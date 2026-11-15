"""SQLite persistence for draft Case 1 research telemetry (SCRUM-103).

Storage only. Phi owns HTTP integration; the team must validate research timing and integration
before recording participant outcomes.
"""

import json
import re
import sqlite3
from contextlib import closing
from datetime import datetime
from pathlib import Path


REQUIRED_METADATA = {
    "click": {"control_id": str},
    "search": {"result_count": int},
    "filter": {"filter_id": str, "result_count": int},
    "evidence_view": {"evidence_id": str},
    "report_edit": {"section_id": str},
    "triage_marked": {"classification": str},
    "pause": {},
    "resume": {},
    "ai_suggestion_shown": {"suggestion_id": str},
    "submit": {"report_id": str},
}
CLASSIFICATIONS = {"undetermined", "benign", "suspicious", "malicious"}
DECISIONS = {"accept", "modify", "reject"}


def _identifier(value, field):
    if not isinstance(value, str) or not value.strip() or len(value) > 128:
        raise ValueError(f"Invalid {field}")
    return value


def _utc(value):
    if not isinstance(value, str) or not re.fullmatch(
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z", value
    ):
        raise ValueError("Timestamp must be UTC ISO 8601 with Z suffix")
    try:
        datetime.fromisoformat(value[:-1] + "+00:00")
    except ValueError as error:
        raise ValueError("Invalid UTC timestamp") from error
    return value


def _metadata(event_type, metadata):
    expected = REQUIRED_METADATA[event_type]
    if not isinstance(metadata, dict) or metadata.keys() != expected.keys():
        raise ValueError(f"Invalid metadata fields for {event_type}")
    for name, kind in expected.items():
        value = metadata[name]
        if kind is int:
            if type(value) is not int or value < 0:
                raise ValueError(f"Invalid {name}")
        else:
            _identifier(value, name)
    if event_type == "triage_marked" and metadata["classification"] not in CLASSIFICATIONS:
        raise ValueError("Invalid triage classification")
    if event_type == "evidence_view" and not re.fullmatch(r"EVENT-[1-9][0-9]*", metadata["evidence_id"]):
        raise ValueError("Invalid evidence_id format")
    return json.dumps(metadata, sort_keys=True, separators=(",", ":"))


class TelemetryStore:
    def __init__(self, path: Path):
        self.path = Path(path)
        schema = (Path(__file__).parent / "migrations" / "001_telemetry.sql").read_text(encoding="utf-8")
        with closing(self._connect()) as db:
            db.executescript(schema)

    def _connect(self):
        db = sqlite3.connect(self.path, timeout=5)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
        return db

    @staticmethod
    def _session(db, session_id):
        row = db.execute("SELECT mode, status FROM investigation_sessions WHERE id = ?", (session_id,)).fetchone()
        if row is None:
            raise ValueError("Unknown session_id")
        return row

    def record_event(self, event: dict):
        if not isinstance(event, dict) or set(event) != {
            "event_id", "session_id", "event_type", "occurred_at_utc", "elapsed_ms", "ui_target", "metadata"
        }:
            raise ValueError("Invalid telemetry event fields")
        event_id = _identifier(event["event_id"], "event_id")
        session_id = _identifier(event["session_id"], "session_id")
        event_type = event["event_type"]
        if not isinstance(event_type, str) or event_type not in REQUIRED_METADATA:
            raise ValueError("Unknown event_type")
        timestamp = _utc(event["occurred_at_utc"])
        elapsed_ms = event["elapsed_ms"]
        if type(elapsed_ms) is not int or elapsed_ms < 0:
            raise ValueError("elapsed_ms must be a nonnegative integer")
        target = event["ui_target"]
        if target is not None:
            _identifier(target, "ui_target")
        serialized = _metadata(event_type, event["metadata"])
        row = (event_id, session_id, event_type, timestamp, elapsed_ms, target, serialized)

        with closing(self._connect()) as db, db:
            session = self._session(db, session_id)
            if session["mode"] == "B":
                raise ValueError("AI-only sessions cannot record participant UI events")
            if session["mode"] == "A" and event_type == "ai_suggestion_shown":
                raise ValueError("Human-only sessions cannot expose AI")

            existing = db.execute("SELECT * FROM telemetry_events WHERE event_id = ?", (event_id,)).fetchone()
            if existing is not None:
                if tuple(existing[key] for key in (
                    "event_id", "session_id", "event_type", "occurred_at_utc",
                    "elapsed_ms", "ui_target", "metadata_json"
                )) != row:
                    raise ValueError("Conflicting event_id")
                return event  # A genuine retry remains valid after finalisation.

            if event_type == "submit":
                if session["status"] != "finalised":
                    raise ValueError("Submit requires a finalised session")
                if event["metadata"]["report_id"] != session_id:
                    raise ValueError("Current report_id must equal session_id")
            elif session["status"] != "active":
                raise ValueError("Client events require an active session")
            try:
                db.execute("""INSERT INTO telemetry_events
                    (event_id, session_id, event_type, occurred_at_utc, elapsed_ms, ui_target, metadata_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?)""", row)
                if event_type == "ai_suggestion_shown":
                    db.execute("""INSERT INTO suggestion_exposures
                        (event_id, session_id, suggestion_id, occurred_at_utc)
                        VALUES (?, ?, ?, ?)""",
                        (event_id, session_id, event["metadata"]["suggestion_id"], timestamp))
            except sqlite3.IntegrityError as error:
                raise ValueError("Invalid event or duplicate final submission") from error
        return event

    def list_events(self, session_id: str):
        with closing(self._connect()) as db:
            self._session(db, session_id)
            rows = db.execute("""SELECT * FROM telemetry_events WHERE session_id = ?
                ORDER BY elapsed_ms, event_id""", (session_id,)).fetchall()
        return [{"event_id": row["event_id"], "session_id": row["session_id"],
                 "event_type": row["event_type"], "occurred_at_utc": row["occurred_at_utc"],
                 "elapsed_ms": row["elapsed_ms"], "ui_target": row["ui_target"],
                 "metadata": json.loads(row["metadata_json"])} for row in rows]

    def record_decision(self, session_id: str, suggestion_id: str, decision: str, occurred_at_utc: str):
        _identifier(session_id, "session_id")
        _identifier(suggestion_id, "suggestion_id")
        _utc(occurred_at_utc)
        if not isinstance(decision, str) or decision not in DECISIONS:
            raise ValueError("Invalid AI decision")
        with closing(self._connect()) as db, db:
            session = self._session(db, session_id)
            if session["mode"] != "C":
                raise ValueError("Only Human + AI sessions may review suggestions")
            exposure = db.execute("""SELECT 1 FROM suggestion_exposures
                WHERE session_id = ? AND suggestion_id = ? LIMIT 1""", (session_id, suggestion_id)).fetchone()
            if exposure is None:
                raise ValueError("Suggestion was not shown in this session")
            existing = db.execute("""SELECT decision, occurred_at_utc FROM suggestion_decisions
                WHERE session_id = ? AND suggestion_id = ?""", (session_id, suggestion_id)).fetchone()
            if existing is not None:
                if (existing["decision"], existing["occurred_at_utc"]) != (decision, occurred_at_utc):
                    raise ValueError("Conflicting suggestion decision")
            else:
                if session["status"] != "active":
                    raise ValueError("AI review requires an active session")
                db.execute("""INSERT INTO suggestion_decisions
                    (session_id, suggestion_id, decision, occurred_at_utc) VALUES (?, ?, ?, ?)""",
                    (session_id, suggestion_id, decision, occurred_at_utc))
        return {"session_id": session_id, "suggestion_id": suggestion_id,
                "decision": decision, "occurred_at_utc": occurred_at_utc}

    def list_decisions(self, session_id: str):
        with closing(self._connect()) as db:
            self._session(db, session_id)
            rows = db.execute("""SELECT * FROM suggestion_decisions
                WHERE session_id = ? ORDER BY suggestion_id""", (session_id,)).fetchall()
        return [dict(row) for row in rows]
