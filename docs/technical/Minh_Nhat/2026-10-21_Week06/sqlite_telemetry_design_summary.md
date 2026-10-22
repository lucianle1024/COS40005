# SCRUM-49 - SQLite telemetry design summary

Author: Nguyen Huyen Minh Nhat
Project: COS40005 - Hanoi Group 5
Updated: 2026-10-21 (Week 6 evidence organisation)
Jira: https://cos40005hngroup5.atlassian.net/browse/SCRUM-49

## Design coverage

The proposed SQLite baseline is organised into ten entities:

- participants
- scenarios
- trial_sessions
- telemetry_events
- ai_interactions
- ai_suggestions
- suggestion_exposures
- suggestion_decisions
- final_reports
- report_iocs

Session-linked records are intended to support consistent duration, IOC quality and analyst-decision measurements. Proposed foreign keys, unique constraints, CHECK expressions and triggers prevent selected inconsistent records, including condition-A AI interactions and cross-session or unexposed suggestions.

## Next integration requirements

- Agree event taxonomy and API contracts with the React and FastAPI owners.
- Confirm timing and truth-version policies.
- Ensure exposure is saved only after suggestions are shown to participants.
- Review privacy, consent, authorization and sensitive-payload handling in the backend.
- Run integrated scenario tests and gain team-lead approval before describing the schema as merged into the application.

## Status

- Jira SCRUM-49: Done.
- Local synthetic tests: 7 passed on 2026-10-21.
- Backend/frontend integration: not verified by this evidence.
- The original executable SQL/Python source was not part of the uploaded files in this conversation and is not recreated here as if it had been run.

Extended technical proposal: https://docs.google.com/document/d/1wJrCf0XTEcXOwZwF4yXrc-fD07BKqIQ0Bc1d6kJImlY/edit
