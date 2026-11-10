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


def _score_sets(expected, predicted):
    tp = len(expected & predicted)
    fp = len(predicted - expected)
    fn = len(expected - predicted)
    precision = tp / (tp + fp) if tp + fp else None
    recall = tp / (tp + fn) if tp + fn else None
    f1 = 2 * tp / (2 * tp + fp + fn) if 2 * tp + fp + fn else None
    return {"tp": tp, "fp": fp, "fn": fn, "precision": precision,
            "recall": recall, "f1": f1}


def score_iocs(truth, reported):
    return _score_sets(
        {canonical_ioc(ioc) for ioc in truth},
        {canonical_ioc(ioc) for ioc in reported},
    )


def reference_findings(case_truth):
    """Flatten the case owner's existing reference lists without declaring them malicious IOCs."""
    groups = case_truth["iocs"]
    if not isinstance(groups, dict):
        raise ValueError("Case truth iocs must be grouped by category")
    groups = {**groups, "mitre_techniques": case_truth.get("mitre_techniques", [])}
    if any(not isinstance(values, list) for values in groups.values()):
        raise ValueError("Reference categories must contain lists")
    return [
        {"category": category, "value": value}
        for category, values in groups.items()
        for value in values
    ]


def canonical_finding(item):
    category = str(item["category"]).strip().lower()
    value = str(item["value"]).strip().casefold()
    if not category or not value:
        raise ValueError("Finding category and value must not be empty")
    if category == "file_hashes" and (
        len(value) not in {32, 40, 64} or not re.fullmatch(r"[0-9a-f]+", value)
    ):
        raise ValueError("Invalid file hash")
    if category == "mitre_techniques" and not re.fullmatch(r"t[0-9]{4}(?:\.[0-9]{3})?", value):
        raise ValueError("Invalid MITRE technique ID")
    if category == "domains":
        value = canonical_ioc({"type": "domain", "value": value})[1]
    if category == "network_ips":
        value = canonical_ioc({"type": "ip", "value": value})[1]
    return category, value


def score_reference_findings(case_truth, reported):
    """Score category/value agreement with a reference file, not IOC maliciousness."""
    return _score_sets(
        {canonical_finding(item) for item in reference_findings(case_truth)},
        {canonical_finding(item) for item in reported},
    )


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
    parser.add_argument("trial_json", nargs="?", type=Path)
    parser.add_argument("--case-truth", type=Path, help="Existing OTRF reference JSON")
    parser.add_argument("--report", type=Path, help="Structured findings for reference comparison")
    args = parser.parse_args()
    if args.case_truth:
        if args.trial_json:
            parser.error("Use either trial_json or --case-truth")
        truth = json.loads(args.case_truth.read_text(encoding="utf-8"))
        result = {
            "dataset": args.case_truth.parent.name,
            "scenario_id": truth["scenario_id"],
            "reference_counts": {
                **{category: len(values) for category, values in truth["iocs"].items()},
                "mitre_techniques": len(truth.get("mitre_techniques", [])),
            },
        }
        if args.report:
            report = json.loads(args.report.read_text(encoding="utf-8"))
            if report["dataset"] != result["dataset"]:
                raise ValueError("Report dataset does not match reference dataset")
            result["reference_matching"] = score_reference_findings(
                truth, report["reported_findings"]
            )
        print(json.dumps(result, indent=2))
    elif args.trial_json and args.report is None:
        data = json.loads(args.trial_json.read_text(encoding="utf-8"))
        print(json.dumps(evaluate_trial(data), indent=2))
    else:
        parser.error("Provide trial_json or --case-truth [--report REPORT]")


if __name__ == "__main__":
    main()
