# Case 1 Scoring Rules - Draft v0.2

Owner: Nguyen Huyen Minh Nhat
Jira: SCRUM-104, linked to SCRUM-45 and SCRUM-53
Date: 2026-11-10
Status: Draft. The case owner must approve the ground-truth categories before this rubric is frozen.

## Dataset identity and scope

The current Case 1 research dataset is `data/scenarios/case_01/` (OTRF `empire_launcher_vbs`). Its incident is a VBScript stager followed by obfuscated PowerShell execution. The participant workbench uses 350 bounded evidence records. I use the existing `case_01_truth.json` without modifying the dataset or presenting its answer key to participants.

The truth file declares `scenario_id: case_01` but does not declare `scenario_version`. The backend session API currently uses `case_version: 1.0`; this must not be mistaken for a version supplied by the original dataset. The older `case_01_test1/` and `case_01_test2/` directories have been removed, and the synthetic phishing frontend fixture is a separate demo.

The reference file contains 13 grouped entries under `iocs` and four MITRE ATT&CK techniques (17 reference entries in total). Its separate `truth_iocs` array contains two explicitly typed hash IOC entries (one SHA-256 and one MD5). The other grouped items include processes, file paths, users and host context: matching them is not the same as confirming malicious IOC accuracy. Huy must approve the final scoring categories before participant evaluation.

## Reference matching for technical tests

The scorer's new `score_reference_findings()` uses the existing `iocs` category names and a separate `mitre_techniques` category. This is a dataset-compatibility check, distinct from `score_iocs()` and the primary IOC F1 measure.

- A reported finding has the shape `{"category": "file_hashes", "value": "..."}`.
- Match `(category, value)` pairs exactly after trimming leading/trailing whitespace and case-folding for these Windows datasets. Duplicates are counted once.
- Windows paths and command lines use case-folded exact matching only. We do not normalize slash styles, quoting, environment variables or command arguments; these may require manual adjudication.
- File hashes must be 32, 40 or 64 hexadecimal characters (MD5, SHA-1 or SHA-256); MITRE IDs use `T####` or `T####.###`. No partial string matching or inferred equivalence is awarded.
- IP and domain categories reuse the existing IP/domain normalization rules.
- Report values outside the reference list count as unmatched, not automatically as malicious false positives. Manual review is required for ambiguous answers.
- A self-match against the reference file must produce zero unmatched and zero missing items; this is a unit-test invariant, not a study outcome.
- The reference comparison outputs matched, unmatched-reported and missing-reference counts, plus category breakdowns and the unmatched values. These are not Precision, Recall or F1 scores until reference completeness and malicious labels are approved.
- Each CLI result includes the dataset folder, draft rubric version and SHA-256 of the reference file. If a test report carries `reference_sha256`, the scorer rejects a mismatch.

### Current Case 1 reference categories

| Category | Entries |
|---|---:|
| `suspicious_processes` | 1 |
| `process_names` | 3 |
| `file_paths` | 2 |
| `file_hashes` | 3 |
| `user_accounts` | 1 |
| `target_hosts` | 1 |
| `registry_keys_modified` | 2 |
| `mitre_techniques` | 4 |
| **Total reference entries** | **17** |

Root cause and benign noise are separate fields. They are not automatically scored as IOC findings. The current UI stores classification, reasoning and evidence IDs rather than typed IOC tuples, so participant IOC F1 cannot yet be computed from its final report alone.

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

## Research use boundary

- `score_iocs()` remains the primary typed IOC utility. Its existing IP/domain/MD5/SHA-256 validation and synthetic timing tests are unchanged.
- `score_reference_findings()` verifies whether structured reports match the consolidated Case 1 reference file. It does **not** label every referenced process, account, or rule as malicious.
- For participant outcomes, first confirm which reference categories represent scored malicious findings, then supply typed `reported_iocs` and actual `submit`/`triage_marked` events. Otherwise mark those measurements as unavailable rather than recording a zero or a fabricated F1.
- Do not expose reference or answer-key files through the participant UI, API or AI prompt.

## Minimum scoring input

- `session_id`, `scenario_id`, `scenario_version`, condition (A/B/C).
- The approved truth version and canonical IOC tuples from researcher-only storage.
- Final report IOC tuples with source references where available.
- Accepted submission and triage events with measured `elapsed_ms`.
- A missing-value rule for unfinished trials and a record of exclusions.

## Review checklist

- [x] I mapped the consolidated Case 1 reference file and verified its 17 reference entries.
- [ ] Huy confirms which reference entries represent scored malicious versus contextual findings.
- [ ] Huy and Nhat approve the exact matching/partial-credit policy and version it.
- [ ] Tin/Phi confirm the final-report format includes typed IOCs and stable evidence IDs.
- [x] I ran local unit tests against both reference JSON files (synthetic report predictions only).
- [ ] Nhat pilots a real structured submission and freezes the rubric before collecting human data.
- [ ] Team records approval in Jira SCRUM-104 and links the reviewed version.
