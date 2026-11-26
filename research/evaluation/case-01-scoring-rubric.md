# Case 1 Scoring Rules - Draft v0.3

Owner: Nguyen Huyen Minh Nhat
Jira: SCRUM-124 (Sprint 2), following SCRUM-104/105
Date: 2026-11-26
Status: Draft revision. Nhat reports Huy confirmed adding SHA-1 to IOC F1 and deferring broader IOC expansion; partial credit is permitted in principle, but its criteria require agreement. Not yet frozen for participant trials.

## Dataset identity and scope

The current Case 1 research dataset is `data/scenarios/case_01/` (OTRF `empire_launcher_vbs`). Its incident is a VBScript stager followed by obfuscated PowerShell execution. The participant workbench uses 350 bounded evidence records. The evidence dataset is unchanged. The proposed truth-file revision adds its existing reference SHA-1 hash to `truth_iocs`; the answer key remains researcher-only.

The truth file declares `scenario_id: case_01` but does not declare `scenario_version`. The backend session API currently uses `case_version: 1.0`; this must not be mistaken for a version supplied by the original dataset. The older `case_01_test1/` and `case_01_test2/` directories have been removed, and the synthetic phishing frontend fixture is a separate demo.

The reference file contains 13 grouped entries under `iocs` and four MITRE ATT&CK techniques (17 reference entries in total). Its separate `truth_iocs` array contains three explicitly typed hash IOC entries (SHA-256, MD5 and SHA-1). The other grouped items include processes, file paths, users and host context: matching them is not the same as confirming malicious IOC accuracy. The primary score is restricted to the typed truth entries; other reference findings remain separate pending team AI coordination.

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
- Hashes: Validate 32/40/64 hexadecimal characters for MD5/SHA-1/SHA-256 respectively and compare lowercase exact values. Supported primary IOC types are `ip`, `domain`, `md5`, `sha1`, `sha256`.
- Process paths, accounts, firewall rules and command lines remain reference findings for this revision. No additional IOC types are introduced until Phi, Quang and the case owner agree on the shared report contract.
- Do not score partial IOC strings as true positives. Valid nonmatching typed IOCs count as FP under the frozen truth set; malformed/unsupported values require review rather than silent coercion. A missing/unfinished report is not an explicitly empty, completed report. Log unresolved items and exclude unavailable measurements rather than inventing values.

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

## Partial credit - proposed manual rubric (separate outcome)

Partial credit is permitted in principle, as reported by Nhat after consulting Huy. The following categories and weights are proposals for agreement, not implemented F1 logic or approved study results. Standard IOC F1 continues to use integer TP, FP and FN from exact typed matches.

| Case | Proposed secondary credit | Rule |
|---|---:|---|
| Correct, complete, supported finding | 1 | Correct claim with sufficient cited evidence for the criterion. |
| Correct but incomplete supported finding | 0.5 | Core claim is correct and evidence supports it, but required context or explanation is incomplete. |
| Incorrect or contradicted finding | 0 | The value or claim is wrong. |
| Unsupported or omitted finding in a completed report | 0 | No adequate supporting evidence or no answer for the criterion. |
| Ambiguous finding requiring adjudication | Pending | Do not score until a reviewer resolves the evidence. |
| Unavailable report or incomplete trial | N/A | Record missingness; do not convert to zero. |

Example: a correct, evidence-linked root-cause identification without the required execution explanation may receive 0.5 on that separate criterion. A truncated hash or one-character-wrong SHA-1 is never a partial TP and earns no credit for an exact IOC criterion. A correct normalized hash receives full credit in standard IOC F1 even if the separate evidence-quality criterion is not met.

Proposed Case 1 manual criteria (each capped at one point; agree the detailed answer key before trials):

| Criterion | 1 point | 0.5 points | 0 points |
|---|---|---|---|
| Root cause | Correct cause and required execution explanation, supported by evidence | Correct cause, but explanation is incomplete and supported | Incorrect, unsupported or omitted cause |
| Process lineage | Correct required relationships with supporting citations | At least one correct required relationship, but lineage is incomplete | No correct supported relationship |
| Remediation | Correct, sufficient response for the predefined objective | Correct supported response, but an essential step is missing | Incorrect, unsupported or omitted response |

For exact indicators and ATT&CK IDs, use full normalized matches or no match; no credit for a similar string or parent technique by default. Where an otherwise valid exact IOC lacks citations, record the evidence-quality gap separately rather than changing standard IOC F1. Ambiguous claims remain pending; incomplete trials remain N/A. These secondary criteria and their denominator require team approval before use.

For a secondary score, predefine criteria and required evidence before trials, apply the same weights to A/B/C, cap credit at one point per criterion, and deduplicate claims. Record rationale and evidence references for each decision; adjudicate ambiguous claims consistently, ideally blinded to condition. Use a fixed rubric denominator for completed reports; report unresolved and unavailable outcomes separately. Do not implement fuzzy hash matching, fractional TP, or a weighted F1. The separate partial-credit score and its detailed criteria are pending review and are not computed by the current scorer.

## Sprint 2 version and compatibility

- Reviewed upstream `main`: `f2438dcfa348231ed2bf48d6ae8a89c607065dd4`.
- Proposed revised truth-file SHA-256: `f8e0d4b2c87b5952aaaefe7df517152b447d63adc8d6313842fee67044f3e1bd`. The existing session API assigns `case_version: 1.0`; the research reference hash identifies the revised answer key. Freeze both and the rubric version after review.
- Condition B currently accepts only `ip`, `domain`, `md5`, `sha256` (including PR #17). Phi and Quang must coordinate SHA-1 support in the shared output schema and prompt before comparing A/B/C using the revised truth. Do not report missing SHA-1 from an unsupported AI schema as participant performance. A/C typed final-report integration remains SCRUM-126/127 work.
- Case 2/2 Test 2 and other datasets are unchanged; their typed truth sets require case-owner review before any additional SHA-1 inclusion.

## Secondary outcomes

- Investigation duration: Accepted final `submit.elapsed_ms / 1000`, excluding approved pauses. If no valid submission, record missing duration.
- First-triage time: First valid `triage_marked.elapsed_ms / 1000`.
- ATT&CK mapping: Evaluate technique IDs separately from IOC F1 against versioned truth.
- Root-cause assessment: Use a separate case-owner-approved rubric for correct, partial or unsupported explanations. Do not fold subjective root-cause points into IOC F1.
- AI hallucination/contamination: Compare claims actually displayed to Condition C participants against final retained findings. An Accept click alone is insufficient evidence of contamination.
- Condition B is an automated baseline, not a human participant for paired A vs C statistics.

## Research use boundary

- `score_iocs()` remains the primary typed IOC utility. Its primary IOC validation now includes SHA-1; timing logic is unchanged.
- `score_reference_findings()` verifies whether structured reports match the consolidated Case 1 reference file. It does **not** label every referenced process, account, or rule as malicious.
- For participant outcomes, freeze the typed truth and rubric versions, then supply typed `reported_iocs` and actual `submit`/`triage_marked` events. Otherwise mark those measurements as unavailable rather than recording a zero or a fabricated F1.
- Do not expose reference or answer-key files through the participant UI, API or AI prompt.

## Minimum scoring input

- `session_id`, `scenario_id`, `scenario_version`, condition (A/B/C).
- The approved truth version and canonical IOC tuples from researcher-only storage.
- Final report IOC tuples with source references where available.
- Accepted submission and triage events with measured `elapsed_ms`.
- A missing-value rule for unfinished trials and a record of exclusions.

## Review checklist

- [x] I mapped the consolidated Case 1 reference file and verified its 17 reference entries.
- [x] Nhat reports Huy confirmed SHA-1 inclusion and no further IOC expansion at this stage. Record confirmation in Jira.
- [ ] Huy and Nhat approve the separate partial-credit criteria and freeze the rubric version.
- [ ] Tin/Phi confirm the final-report format includes typed IOCs and stable evidence IDs.
- [ ] Nhat reviews the SHA-1 change and reruns the synthetic unit tests on the local checkout.
- [ ] Nhat pilots a real structured submission and freezes the rubric before collecting human data.
- [ ] Team records approval in Jira SCRUM-124 and links the reviewed version.
