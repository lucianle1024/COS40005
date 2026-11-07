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

This is a local development build. Case 1 Human + AI serves fixed-rule claims from `GET /sessions/{session_id}/advice`. The route is limited to Human + AI sessions. Individual review decisions are held in the React workspace. Participant access control and telemetry are outside this increment.

## Checks

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

The connected CI workflow runs the backend tests and exercises the React workflow against a temporary SQLite database. Dependency constraints record the resolved Python 3.13 package versions.
