"""Fixed-rule assessment with evidence scoped to each detected signal."""
import json
import re

from app.schemas.scenario import AdviceClaim, LabelResult, ScenarioInput

_AUDIT_EVENT = re.compile(r'\beventid["\s]*[:=]\s*"?1102\b', re.IGNORECASE)


_ADVICE = {
    "Audit log clear event (1102)": (
        "audit-log-clear",
        "Inspect the audit log clearance",
        "Windows recorded an audit log clearance. Check who cleared it and when.",
    ),
    "PowerShell executable mentioned": (
        "powershell",
        "Investigate the PowerShell references",
        "These records mention PowerShell. Check the command line and parent process to establish what ran.",
    ),
    "Netsh firewall command mentioned": (
        "firewall",
        "Check for firewall rule changes",
        "These records mention netsh and advfirewall. Compare the command with firewall audit events to establish what changed.",
    ),
    "Winlogon or LSA registry path mentioned": (
        "registry",
        "Review the registry references",
        "These records mention Winlogon or LSA registry paths. Check the operation and outcome before inferring a modification.",
    ),
}


def _find_signals(scenario: ScenarioInput) -> tuple[dict[str, list[str]], list[str]]:
    matches: dict[str, list[str]] = {}
    supporting_ids: list[str] = []
    for record in scenario.evidence:
        try:
            event = json.loads(record.text)
        except ValueError:
            event = None
        fields = event if isinstance(event, dict) else {}
        message = str(fields.get("Message", record.text)).lower()
        signals = {
            "Audit log clear event (1102)": (
                str(fields.get("EventID")) == "1102" if fields
                else bool(_AUDIT_EVENT.search(record.text))
            ),
            "PowerShell executable mentioned": "powershell.exe" in message,
            "Netsh firewall command mentioned": "netsh.exe" in message and "advfirewall" in message,
            "Winlogon or LSA registry path mentioned": "\\winlogon" in message or "\\lsa" in message,
        }
        for signal, matched in signals.items():
            if matched:
                matches.setdefault(signal, []).append(record.id)
        if any(signals.values()):
            supporting_ids.append(record.id)

    return matches, supporting_ids


def case_advice(scenario: ScenarioInput) -> list[AdviceClaim]:
    matches, _ = _find_signals(scenario)
    claims = []
    for signal, ids in matches.items():
        claim_id, title, rationale = _ADVICE[signal]
        claims.append(AdviceClaim(
            id=claim_id,
            title=title,
            classification="undetermined",
            rationale=rationale,
            evidence_ids=list(dict.fromkeys(ids))[:3],
        ))
    return claims


def label_case(scenario: ScenarioInput) -> LabelResult:
    matches, supporting_ids = _find_signals(scenario)
    suspicious = len(matches) >= 2
    summary = [
        f"{signal} ({', '.join(list(dict.fromkeys(ids))[:3])})"
        for signal, ids in matches.items()
    ]
    rationale = (
        ("Multiple rule signals found: " if suspicious else "One rule signal found: ")
        + "; ".join(summary) + "."
        if summary else "No supported rule signals were found."
    )
    return LabelResult(
        case_id=scenario.id,
        label="suspicious" if suspicious else "undetermined",
        confidence=0.95 if suspicious else 0.40,
        supporting_evidence=list(dict.fromkeys(supporting_ids)),
        rationale=rationale,
        prototype="fixed-rule-v2",
    )
