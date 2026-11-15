# SQLite telemetry migrations

- `001_telemetry.sql` adds `telemetry_events`, `suggestion_exposures` and `suggestion_decisions` to the existing SQLite session database. It bootstraps the existing `investigation_sessions` schema for a fresh database but never replaces or changes an existing one.
- `TelemetryStore(database_path)` automatically applies this idempotent schema. Repeating initialization preserves existing records.
- Tests in `src/backend/tests/test_telemetry.py` use a fresh temporary SQLite file on every run.
- No `.sqlite3` file should be committed. The frontend/API do not write telemetry yet.

**Review pending:** The original SCRUM-49 10-table SQL is not present in `main`, and the SCRUM-102 event contract is the `1.0-working` baseline. This subset must be aligned with the team before participant data collection. Final `submit` timing must be persisted transactionally by the backend when the final report is accepted; storage tests alone do not establish timing validity.
