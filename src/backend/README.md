# COS40005 FastAPI backend

## Local setup

Use Python 3.13 for the tested dependency set. In PowerShell from the repository root:

```powershell
cd src/backend
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".[dev]" -c constraints.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open the API documentation at http://127.0.0.1:8000/docs. Run the frontend in another terminal. The default CORS settings allow the frontend on port 5173. Set `SOC_ALLOWED_ORIGINS` to a JSON list of origins if using another port.

## Case 1 lifecycle

- `GET /sessions/case-01` serves the case metadata and evidence records. It excludes the evaluation answer key.
- `POST /sessions` opens an attempt and records the start time. Repeating the same attempt key, case version and mode resumes that attempt.
- `GET /sessions/{id}` returns the saved state. The draft and finalise routes save human findings. Finalisation requires reasoning and a citation from the case. Subsequent writes return a conflict.
- `POST /sessions/{id}/complete-ai` saves the AI-only assessment. `POST /investigate` runs the same fixed-rule assessment on supplied evidence. Its confidence field is an uncalibrated rule score.
- `SOC_SESSION_DATABASE` overrides the default `investigation-sessions.sqlite3` in the backend working directory. Use a separate database for testing.

This is a local development build. Case 1 Human + AI serves fixed-rule claims from `GET /sessions/{session_id}/advice`. The route is limited to Human + AI sessions. Individual review decisions are held in the React workspace. Participant access control and telemetry API integration remain outside this increment.

## Checks

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

The connected CI workflow runs the backend tests and exercises the React workflow against a temporary SQLite database. Dependency constraints record the resolved Python 3.13 package versions.

## Research telemetry storage (SCRUM-103)

`app.db.telemetry.TelemetryStore` uses the **same SQLite file** as `Sessions`; no new service or credentials are required. It creates `telemetry_events`, `suggestion_exposures` and `suggestion_decisions` from `app/db/migrations/001_telemetry.sql` without altering `investigation_sessions`. The schema follows the SCRUM-102 working contract (`1.0-working`).

The frontend does not send these events yet. This remains **storage-only**. SCRUM-102 has been merged; API and UI integration are still pending. The existing Condition B result remains in `investigation_sessions.findings`. Do not use these draft timestamps as final study outcomes.

To run the focused telemetry storage and contract tests:

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/test_telemetry.py tests/test_telemetry_contract.py
```

After following Local setup, run the full backend suite (including isolated SQLite telemetry tests):

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

The telemetry tests use `tmp_path` and never read or overwrite the local `investigation-sessions.sqlite3` file. The production database file is excluded by `.gitignore`.

To initialise an empty local database (not tracked in Git), from `src/backend`:

```powershell
.\.venv\Scripts\python.exe -c "from pathlib import Path; from app.db.telemetry import TelemetryStore; TelemetryStore(Path('cos40005-study.sqlite3')); print('SQLite ready')"
```

This creates the four tables locally. Re-running it is safe; teammates create their own local database after pulling.
