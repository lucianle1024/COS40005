# AI Usage - SQLite Telemetry Storage (Draft)

- Date: 2026-11-10
- Tool: ChatGPT (GPT-6)
- Purpose: Review existing COS40005 SQLite session storage and propose minimal SCRUM-103 telemetry persistence and isolated tests.
- Prompt summary: Extend the existing backend database so teammates can pull and reproduce checks reliably without a new database service.
- Assistance: Proposed SQL schema, a Python storage layer, test cases for persistence/idempotency/condition restrictions, and setup notes.
- Verification status: AI-assisted draft tested in an isolated Python 3.13 reconstruction; student must review, adapt, run the full repository tests and confirm the contract with the team before submission.
- Academic integrity: I will only include work after I understand, validate, and integrate it myself; this entry does not claim that review is complete.
