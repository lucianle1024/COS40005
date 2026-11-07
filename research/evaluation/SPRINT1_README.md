# Research evaluation

Sprint 1 draft for SCRUM-104 and SCRUM-105. This is researcher-side prototype code, not a backend integration or a participant result.

- `case-01-scoring-rubric.md` - Proposed truth mapping, IOC matching rules and unresolved decisions.
- `metric_scoring.py` - Example scorer for approved typed IOC tuples and valid trial events.
- `test_metric_scoring.py` - Synthetic unit tests only.
- `sample-trial.json` - Synthetic CLI example; not an approved Case 1 answer key.

Run from the repository root:

```powershell
python -m unittest discover -s research/evaluation -p "test_metric_scoring.py" -v
```

To score a test input, run `python research/evaluation/metric_scoring.py path/to/synthetic-trial.json`.

Do not place actual participant data or confidential ground-truth files in GitHub. The case owner must approve truth categories and the team must validate the telemetry contract before this code is integrated into the study. Record AI-assisted changes in the sprint AI Usage Log.

The AI-only runner (`run_ai_only.py`) and results exporter (`export_results.py`) belong to later integration and are not included here.
