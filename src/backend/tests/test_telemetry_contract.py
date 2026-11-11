"""Check the versioned telemetry examples against the connected Case 1 API."""
import ast
import json
from datetime import datetime, timezone
from pathlib import Path

EXAMPLES = Path(__file__).resolve().parents[3] / "docs/technical/telemetry-event-examples.json"
CATALOG = {
    "click": {"control_id"}, "search": {"result_count"},
    "filter": {"filter_id", "result_count"}, "evidence_view": {"evidence_id"},
    "report_edit": {"section_id"}, "triage_marked": {"classification"},
    "pause": set(), "resume": set(), "ai_suggestion_shown": {"suggestion_id"},
    "submit": {"report_id"},
}
FIELDS = {"event_id", "session_id", "event_type", "occurred_at_utc", "elapsed_ms", "ui_target", "metadata"}


def test_examples_match_connected_case_and_contract():
    data = json.loads(EXAMPLES.read_text(encoding="utf-8"))
    repo = EXAMPLES.parents[2]
    sessions = ast.parse((repo / "src/backend/app/api/sessions.py").read_text(encoding="utf-8"))
    constants = {
        node.targets[0].id: node.value.value
        for node in sessions.body
        if isinstance(node, ast.Assign)
        and len(node.targets) == 1
        and isinstance(node.targets[0], ast.Name)
        and isinstance(node.value, ast.Constant)
    }
    assert (data["case_id"], data["case_version"], data["dataset"]) == (
        constants["CASE_ID"], constants["CASE_VERSION"], "case_01"
    )
    assert (repo / "data/scenarios/case_01/case_01_evidence.json").is_file()
    assert data["contract_version"] == "1.0-working" and data["synthetic_only"] is True
    assert data["server_only_event_types"] == ["submit"]
    ids = set()
    for event in data["examples"]:
        assert set(event) == FIELDS
        assert event["event_id"] and event["event_id"] not in ids
        ids.add(event["event_id"])
        assert event["event_type"] in CATALOG
        assert data["sample_session_modes"][event["session_id"]] in {"A", "C"}
        assert type(event["elapsed_ms"]) is int and event["elapsed_ms"] >= 0
        assert event["ui_target"] is None or isinstance(event["ui_target"], str)
        assert isinstance(event["metadata"], dict)
        assert set(event["metadata"]) == CATALOG[event["event_type"]]
        assert datetime.fromisoformat(event["occurred_at_utc"].replace("Z", "+00:00")).tzinfo == timezone.utc
        assert event["occurred_at_utc"].endswith("Z")
        if event["event_type"] == "ai_suggestion_shown":
            assert data["sample_session_modes"][event["session_id"]] == "C"
        if event["event_type"] == "submit":
            assert event["metadata"]["report_id"] == event["session_id"]
        if event["event_type"] == "evidence_view":
            assert event["metadata"]["evidence_id"].startswith("EVENT-")
    assert {e["event_type"] for e in data["examples"]} >= {"evidence_view", "ai_suggestion_shown", "triage_marked", "submit"}
