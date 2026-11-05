# Case 1 Scoring Rules - Draft v0.1

Owner: Nguyen Huyen Minh Nhat
Jira: SCRUM-104, linked to SCRUM-45 and SCRUM-53
Date: 2026-11-05
Status: Draft. The case owner must approve the ground-truth categories before this rubric is frozen.

## Case identity issue

The frontend demo is `case-01` v0.1, an invoice-phishing case. The current `data/scenarios/case_01/` folder is `case_01` v1.0, a PowerShell and firewall-tampering investigation. They do not share a consistent ground truth. We must not score one against the other.

Huy's existing `case_01_truth.json` contains `root_cause`, `iocs` grouped by type, and `mitre_techniques`. It should be reviewed as a proposed source of truth, not automatically treated as an approved list of malicious indicators. The ground truth and trap labels must not be served in participant-facing assets or the AI prompt.

## Primary IOC scoring

- Compare final reported IOC tuples `(type, value)` with the approved truth for the same `scenario_id` and `scenario_version`.
- Use one-to-one set matching after normalization. Repeated identical IOCs are deduplicated; record duplicates separately for quality review if necessary.
- IP addresses: Validate as IPv4/IPv6 and compare canonical address representation.
- Domains: Lowercase, remove a final dot and normalize approved defanged notation such as `[.]`.
- Hashes: Compare lowercase exact hash values once the expected hash algorithm is agreed.
- Process paths, accounts, firewall rules and command lines are not automatically IOCs. Huy must mark which are scored indicators versus supporting evidence. Otherwise a correct but benign process could be counted incorrectly.
- Do not score partial IOC strings as true positives by default. Log unclear matches for case-owner adjudication before the rubric is locked.

Let TP be reported approved IOCs, FP be reported items outside approved truth, and FN be approved IOCs missing in the report.

- Precision = `TP / (TP + FP)` when `TP + FP > 0`; otherwise undefined (`null`).
- Recall = `TP / (TP + FN)` when `TP + FN > 0`; otherwise undefined (`null`).
- F1 = `2TP / (2TP + FP + FN)` when its denominator is positive.
- If the truth contains items but there are no predictions, F1 = 0.
- If truth and predictions are both empty, F1 is undefined (`null`), not 1.
- True negatives are not defined without a fixed candidate universe.

### Worked synthetic example

Approved truth: `(ip, 192.0.2.10)`, `(ip, 192.0.2.20)`, `(domain, alpha.example)`.

Report: `(ip, 192.0.2.10)`, `(domain, alpha.example)`, `(ip, 192.0.2.99)`.

Result: TP = 2, FP = 1, FN = 1, Precision = 0.667, Recall = 0.667, F1 = 0.667 (rounded). These are illustrative values, not participant outcomes or Case 1 scores.

## Secondary outcomes

- Investigation duration: Accepted final `submit.elapsed_ms / 1000`, excluding approved pauses. If no valid submission, record missing duration.
- First-triage time: First valid `triage_marked.elapsed_ms / 1000`.
- ATT&CK mapping: Evaluate technique IDs separately from IOC F1 against versioned truth.
- Root-cause assessment: Use a separate case-owner-approved rubric for correct, partial or unsupported explanations. Do not fold subjective root-cause points into IOC F1.
- AI hallucination/contamination: Compare claims actually displayed to Condition C participants against final retained findings. An Accept click alone is insufficient evidence of contamination.
- Condition B is an automated baseline, not a human participant for paired A vs C statistics.

## Current truth-file mapping to review

| Current `case_01_truth.json` field | Proposed treatment |
|---|---|
| `iocs.network_ips` | Candidate `ip` IOC set after approval |
| `iocs.domains` | Candidate `domain` IOC set after approval |
| `iocs.suspicious_processes` | Review individual path/command items; not automatically IOC |
| `iocs.target_binaries` | Supporting evidence or separately scored binary indicators if approved |
| `iocs.accounts_involved` | Supporting attribution, unless case owner defines malicious accounts |
| `iocs.firewall_rules` | Supporting or separately scored configuration artifacts |
| `mitre_techniques` | Separate technique scoring |
| `root_cause` | Separate qualitative/categorical assessment |

## Minimum scoring input

- `session_id`, `scenario_id`, `scenario_version`, condition (A/B/C).
- The approved truth version and canonical IOC tuples from researcher-only storage.
- Final report IOC tuples with source references where available.
- Accepted submission and triage events with measured `elapsed_ms`.
- A missing-value rule for unfinished trials and a record of exclusions.

## Review checklist

- [ ] Huy selects the canonical Case 1 and confirms malicious versus benign artifacts.
- [ ] Huy and Nhat approve the exact matching/partial-credit policy and version it.
- [ ] Tin/Phi confirm the final-report format includes typed IOCs and stable evidence IDs.
- [ ] Nhat runs synthetic scorer tests, pilots one full sample and freezes the rubric before collecting human data.
- [ ] Team records approval in Jira SCRUM-104 and links the reviewed version.
