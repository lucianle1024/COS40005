# SCRUM-45 - Statistical methodology summary

Author: Nguyen Huyen Minh Nhat
Project: COS40005 - Hanoi Group 5
Updated: 2026-10-21 (Week 6 evidence organisation)
Jira: https://cos40005hngroup5.atlassian.net/browse/SCRUM-45

## Scope

- Compare human-only (A) and human-with-AI (C) trials with participant pairing and balanced scenario/order assignment.
- Treat AI-only (B) as a separate autonomous baseline, not a third within-subject human condition.
- Define scenario-approved ground truth and a consistent IOC matching policy before collecting participant results.

## Measurement

- True positive (TP): reported IOC also found in approved ground truth.
- False positive (FP): reported IOC absent from approved ground truth.
- False negative (FN): expected IOC missing from a report.
- Precision = TP / (TP + FP), where defined.
- Recall = TP / (TP + FN), where defined.
- F1 = 2TP / (2TP + FP + FN), where defined.
- Track investigation duration separately from report quality; do not assume faster is better.
- Evaluate unsupported or false AI suggestions against what was displayed and what survived in final reports. An Accept click alone is not a valid contamination measure.

## Validation and status

- Synthetic scoring and schema constraints were checked locally with seven passing Python unit tests on 2026-10-21.
- Jira SCRUM-45 is marked Done, but approved truth keys and methodology sign-off are pending team review.
- No participant trials or statistical significance findings are claimed.

Source for extended design: https://docs.google.com/document/d/1wJrCf0XTEcXOwZwF4yXrc-fD07BKqIQ0Bc1d6kJImlY/edit
