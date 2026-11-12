# Research evaluation - SCRUM-104/105

The evaluation script and scoring rubric use the current OTRF Case 1 reference in `data/scenarios/case_01/case_01_truth.json`. The original evidence and truth file are unchanged. This is researcher-side evaluation code, not participant scoring results.

- `case-01-scoring-rubric.md` - Reference mapping, IOC scoring definitions and approvals still required.
- `metric_scoring.py` - Typed IOC Precision/Recall/F1, sample trial timing and separate reference matching.
- `test_metric_scoring.py` - Synthetic checks and tests against the current Case 1 truth file.
- `sample-trial.json` - Synthetic sample; not an actual participant result.

Run from the repository root:

```powershell
python -m unittest discover -s research/evaluation -p "test_metric_scoring.py" -v
python research/evaluation/metric_scoring.py --case-truth data/scenarios/case_01/case_01_truth.json
python research/evaluation/metric_scoring.py research/evaluation/sample-trial.json
```

To compare a structured test report, save a local JSON file, for example:

```json
{
  "dataset": "case_01",
  "reported_findings": [
    {"category": "process_names", "value": "wscript.exe"}
  ]
}
```

Then run:

```powershell
python research/evaluation/metric_scoring.py --case-truth data/scenarios/case_01/case_01_truth.json --report path/to/local-report.json
```

The truth currently contains 13 grouped findings and four MITRE techniques (17 reference entries), plus two explicitly typed `truth_iocs` hashes. `reference_matching` counts agreement with the reference, not verified malicious-IOC accuracy. Results include a SHA-256 of the truth file for reproducibility; reports can supply `reference_sha256` to require an exact match.

The frontend final report still stores reasoning and evidence IDs rather than `reported_findings` or typed `reported_iocs`, so an adapter and validated timing events are needed for real trials. The case owner must confirm scored malicious vs contextual categories before participant evaluation. Do not commit participant data or expose the ground-truth file to the participant UI.
