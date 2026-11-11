# Research evaluation

Sprint 1/2 prototype for SCRUM-104 and SCRUM-105. I have added reference-file checks for the team's existing OTRF datasets without modifying the original logs or ground truth.

- `case-01-scoring-rubric.md` - Reference-category mapping, scoring definitions and approval gaps.
- `metric_scoring.py` - Existing IOC/trial scorer plus separate category/value reference matching.
- `test_metric_scoring.py` - Unit tests, including reads of both real dataset truth JSON files.
- `sample-trial.json` - Synthetic CLI example, not a participant result.

From repository root:

```powershell
python -m unittest discover -s research/evaluation -p "test_metric_scoring.py" -v
python research/evaluation/metric_scoring.py --case-truth data/scenarios/case_01_test1/case_01_truth.json
python research/evaluation/metric_scoring.py --case-truth data/scenarios/case_01_test2/case_01_truth.json
```

To compare a **structured test report**, create a local file outside Git containing `dataset` and a `reported_findings` list:

```json
{
  "dataset": "case_01_test1",
  "reported_findings": [
    {"category": "firewall_rules", "value": "python.exe"}
  ]
}
```

Run:

```powershell
python research/evaluation/metric_scoring.py --case-truth data/scenarios/case_01_test1/case_01_truth.json --report path/to/local-report.json
```

The output reports reference match counts, unmatched findings and per-category breakdowns; it does not establish malicious IOC accuracy or human study results. It also records `rubric_version` and `reference_sha256` for reproducibility. A report may include `reference_sha256` to require an exact reference-file match. A raw final report currently provides reasoning and evidence IDs, not `reported_findings`, so the UI-to-evaluation adapter and actual telemetry remain future integration work. Use the original trial scorer with `python research/evaluation/metric_scoring.py research/evaluation/sample-trial.json` for the existing synthetic timing example.

The case owner must approve scored malicious/contextual categories before participant evaluation. Keep actual participant results and confidential keys out of GitHub. Record AI-assisted work in the course AI Usage Log.
