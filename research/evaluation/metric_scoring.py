"""Draft researcher-only IOC and timing scorer for COS40005 Sprint 1.

Synthetic validation only. Do not use for participant results before the
Case 1 ground truth and telemetry contract are approved by the team.
"""

import argparse
import ipaddress
import json
import re
from pathlib import Path

IOC_TYPES = {"ip", "domain", "md5", "sha256"}


def canonical_ioc(item):
    kind = str(item["type"]).strip().lower()
    value = str(item["value"]).strip()
    if kind not in IOC_TYPES:
        raise ValueError(f"IOC type needs approval: {kind}")
    if kind == "ip":
        value = str(ipaddress.ip_address(value))
    elif kind == "domain":
        value = value.lower().replace("[.]", ".").rstrip(".")
        if not value or " " in value or "." not in value:
            raise ValueError(f"Invalid domain: {value}")
    else:
        length = 32 if kind == "md5" else 64
        if len(value) != length or not re.fullmatch(r"[0-9a-fA-F]+", value):
            raise ValueError(f"Invalid {kind} hash")
        value = value.lower()
    return kind, value


def score_iocs(truth, reported):
    expected = {canonical_ioc(ioc) for ioc in truth}
    predicted = {canonical_ioc(ioc) for ioc in reported}
    tp = len(expected & predicted)
    fp = len(predicted - expected)
    fn = len(expected - predicted)
    precision = tp / (tp + fp) if tp + fp else None
    recall = tp / (tp + fn) if tp + fn else None
    f1 = 2 * tp / (2 * tp + fp + fn) if 2 * tp + fp + fn else None
    return {"tp": tp, "fp": fp, "fn": fn, "precision": precision,
            "recall": recall, "f1": f1}


def evaluate_trial(trial):
    for key in ("session_id", "scenario_id", "scenario_version", "condition"):
        if not trial.get(key):
            raise ValueError(f"Missing {key}")
    if trial["condition"] not in {"A", "B", "C"}:
        raise ValueError("Invalid study condition")

    elapsed = {}
    seen_events = {}
    for event in trial.get("events", []):
        event_id = event["event_id"]
        if event_id in seen_events:
            if event != seen_events[event_id]:
                raise ValueError("Conflicting payload for repeated event_id")
            continue
        seen_events[event_id] = event
        ms = event["elapsed_ms"]
        if type(ms) is not int or ms < 0:
            raise ValueError("elapsed_ms must be a nonnegative integer")
        kind = event["event_type"]
        if trial["condition"] == "A" and kind == "ai_suggestion_shown":
            raise ValueError("Condition A must not expose AI suggestions")
        if trial["condition"] == "B" and kind in {"click", "search", "filter", "evidence_view", "report_edit", "triage_marked", "ai_suggestion_shown"}:
            raise ValueError("Condition B must not contain participant UI events")
        elapsed.setdefault(kind, []).append(ms)

    submit = elapsed.get("submit", [])
    if len(submit) > 1:
        raise ValueError("A session must have at most one accepted final submission")
    duration_ms = submit[0] if submit else None
    first_triage = min(elapsed.get("triage_marked", []), default=None)
    if duration_ms is not None and first_triage is not None and first_triage > duration_ms:
        raise ValueError("Triage cannot occur after final submission")

    return {
        "session_id": trial["session_id"],
        "scenario_id": trial["scenario_id"],
        "scenario_version": trial["scenario_version"],
        "condition": trial["condition"],
        **score_iocs(trial["truth_iocs"], trial["reported_iocs"]),
        "duration_seconds": duration_ms / 1000 if duration_ms is not None else None,
        "first_triage_seconds": first_triage / 1000 if first_triage is not None else None,
    }


def main():
    parser = argparse.ArgumentParser(description="Score one synthetic research trial")
    parser.add_argument("trial_json", type=Path)
    args = parser.parse_args()
    data = json.loads(args.trial_json.read_text(encoding="utf-8"))
    print(json.dumps(evaluate_trial(data), indent=2))


if __name__ == "__main__":
    main()
