"""Database-only telemetry checks. All tests use isolated temporary SQLite files."""

import sqlite3

import pytest

from app.db.repositories import Sessions
from app.db.telemetry import TelemetryStore
from app.domain.types import Action, Mode


@pytest.fixture
def stores(tmp_path):
    db_path = tmp_path / "study.sqlite3"
    sessions = Sessions(db_path)
    storage = TelemetryStore(db_path)
    return sessions, storage, db_path


def event(session_id, event_id="evt-1", kind="evidence_view", metadata=None):
    return {"event_id": event_id, "session_id": session_id, "event_type": kind,
            "occurred_at_utc": "2026-11-10T08:00:12Z", "elapsed_ms": 12000,
            "ui_target": "evidence:EVENT-39", "metadata": metadata or {"evidence_id": "EVENT-39"}}


def open_session(sessions, mode=Mode.HUMAN):
    return sessions.open("case_01", "1.0", mode)["id"]


def test_migration_repeatable_and_session_lifecycle_unchanged(stores):
    sessions, storage, path = stores
    session_id = open_session(sessions)
    storage.record_event(event(session_id))
    TelemetryStore(path)  # Safe to initialise on an existing file.
    assert len(TelemetryStore(path).list_events(session_id)) == 1
    sessions.apply(session_id, Action.FINALISE, {"reasoning": "Checked firewall", "evidence_ids": ["EVENT-39"]})
    assert sessions.get(session_id)["status"] == "finalised"
    storage.record_event(event(session_id))  # Identical retries are harmless after finalise.
    with pytest.raises(ValueError, match="active session"):
        storage.record_event(event(session_id, "evt-after-finalise"))


def test_event_idempotency_and_persistence(stores):
    sessions, storage, path = stores
    session_id = open_session(sessions)
    first = event(session_id)
    storage.record_event(first)
    storage.record_event(dict(first))
    assert TelemetryStore(path).list_events(session_id) == [first]
    with pytest.raises(ValueError, match="Conflicting event_id"):
        storage.record_event({**first, "elapsed_ms": 999})
    assert len(storage.list_events(session_id)) == 1


def test_reject_bad_session_and_condition(stores):
    sessions, storage, _ = stores
    human = open_session(sessions, Mode.HUMAN)
    with pytest.raises(ValueError, match="Unknown session_id"):
        storage.record_event(event("missing"))
    with pytest.raises(ValueError, match="Human-only"):
        storage.record_event(event(human, kind="ai_suggestion_shown", metadata={"suggestion_id": "powershell"}))
    automated = open_session(sessions, Mode.AI)
    with pytest.raises(ValueError, match="AI-only"):
        storage.record_event(event(automated))
    assert storage.list_events(human) == []
    assert storage.list_events(automated) == []


@pytest.mark.parametrize("change", [
    {"elapsed_ms": -1}, {"elapsed_ms": True},
    {"occurred_at_utc": "2026-11-10T15:00:12+07:00"},
    {"event_type": "unknown"},
    {"metadata": {"evidence_id": "EVENT-39", "password": "do-not-store"}},
    {"metadata": {"evidence_id": ""}},
    {"metadata": {"evidence_id": "E02"}},
])
def test_reject_malformed_or_sensitive_event_metadata(stores, change):
    sessions, storage, _ = stores
    session_id = open_session(sessions)
    with pytest.raises(ValueError):
        storage.record_event({**event(session_id), **change})
    assert storage.list_events(session_id) == []


def test_submit_must_follow_finalisation_and_is_unique(stores):
    sessions, storage, _ = stores
    session_id = open_session(sessions)
    submit = event(session_id, kind="submit", metadata={"report_id": session_id})
    with pytest.raises(ValueError, match="finalised"):
        storage.record_event(submit)
    sessions.apply(session_id, Action.FINALISE, {"reasoning": "Confirmed", "evidence_ids": ["EVENT-39"]})
    storage.record_event(submit)
    storage.record_event(submit)
    with pytest.raises(ValueError, match="report_id must equal session_id"):
        storage.record_event({**submit, "event_id": "bad-report", "metadata": {"report_id": "unknown"}})
    with pytest.raises(ValueError, match="duplicate final submission"):
        storage.record_event({**submit, "event_id": "another-submit"})
    assert len(storage.list_events(session_id)) == 1


def test_decision_requires_real_exposure_and_is_idempotent(stores):
    sessions, storage, path = stores
    session_id = open_session(sessions, Mode.COMBINED)
    timestamp = "2026-11-10T08:00:15Z"
    with pytest.raises(ValueError, match="not shown"):
        storage.record_decision(session_id, "powershell", "accept", timestamp)
    storage.record_event(event(session_id, kind="ai_suggestion_shown", metadata={"suggestion_id": "powershell"}))
    with sqlite3.connect(path) as db:
        assert db.execute("SELECT COUNT(*) FROM suggestion_exposures").fetchone()[0] == 1
    storage.record_decision(session_id, "powershell", "accept", timestamp)
    storage.record_decision(session_id, "powershell", "accept", timestamp)
    with pytest.raises(ValueError, match="Conflicting"):
        storage.record_decision(session_id, "powershell", "reject", timestamp)
    assert TelemetryStore(path).list_decisions(session_id) == [{
        "session_id": session_id, "suggestion_id": "powershell", "decision": "accept", "occurred_at_utc": timestamp
    }]
    human = open_session(sessions, Mode.HUMAN)
    with pytest.raises(ValueError, match="Only Human"):
        storage.record_decision(human, "powershell", "accept", timestamp)


def test_foreign_key_protection_and_isolated_databases(stores, tmp_path):
    sessions, storage, path = stores
    session_id = open_session(sessions)
    storage.record_event(event(session_id))
    with sqlite3.connect(path) as db:
        assert db.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
        assert db.execute("SELECT COUNT(*) FROM telemetry_events").fetchone()[0] == 1
    other_path = tmp_path / "another.sqlite3"
    Sessions(other_path).open("case_01", "1.0", Mode.HUMAN)
    with pytest.raises(ValueError, match="Unknown session_id"):
        TelemetryStore(other_path).list_events(session_id)


def test_current_contract_examples_can_be_persisted(stores):
    import json
    from pathlib import Path

    path = Path(__file__).resolve().parents[3] / "docs/technical/telemetry-event-examples.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    sessions, storage, _ = stores
    session_ids = {}
    for sample_id, mode in data["sample_session_modes"].items():
        session_ids[sample_id] = open_session(sessions, Mode(mode))
    for sample in data["examples"]:
        event = dict(sample)
        event["session_id"] = session_ids[event["session_id"]]
        if event["event_type"] == "submit":
            sid = event["session_id"]
            sessions.apply(sid, Action.FINALISE, {"reasoning": "Sample", "evidence_ids": ["EVENT-39"]})
            event["metadata"] = {"report_id": sid}
        assert storage.record_event(event) == event
    assert len(storage.list_events(session_ids["00000000000000000000000000000002"])) == 4


def test_empty_database_bootstraps_all_four_tables(tmp_path):
    database = tmp_path / "fresh.sqlite3"
    TelemetryStore(database)
    with sqlite3.connect(database) as connection:
        names = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
    assert {"investigation_sessions", "telemetry_events", "suggestion_exposures", "suggestion_decisions"} <= names
