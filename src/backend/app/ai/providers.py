"""Deterministic AI prototype for Case 1 security evidence."""
from app.schemas.scenario import LabelResult, ScenarioInput


def label_case(scenario: ScenarioInput) -> LabelResult:
    text = " ".join(
        record.text.lower()
        for record in scenario.evidence
    )

    signals = {
        "audit_log_cleared": "eventid" in text and "1102" in text,
        "powershell": "powershell.exe" in text,
        "firewall_tampering": "netsh.exe" in text and "advfirewall" in text,
        "registry_access": "winlogon" in text or "\\lsa" in text,
    }

    supporting_evidence = [
        record.id
        for record in scenario.evidence
        if any(
            keyword in record.text.lower()
            for keyword in (
                "1102",
                "powershell.exe",
                "netsh.exe",
                "advfirewall",
                "winlogon",
                "lsa",
            )
        )
    ]

    if sum(signals.values()) >= 2:
        return LabelResult(
            case_id=scenario.id,
            label="suspicious",
            confidence=0.95,
            supporting_evidence=supporting_evidence,
            rationale=(
                "The evidence shows suspicious PowerShell activity and "
                "firewall modification, with related security events."
            ),
            prototype="fixed-rule-v1",
        )

    return LabelResult(
        case_id=scenario.id,
        label="undetermined",
        confidence=0.40,
        supporting_evidence=supporting_evidence,
        rationale="Not enough suspicious signals were found.",
        prototype="fixed-rule-v1",
    )