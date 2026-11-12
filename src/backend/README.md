# COS40005 FastAPI backend

Directory plan agreed by the team, as reported by Tin on 3 November 2026.
This is a starter scaffold. `GET /health` and the prototype `POST /investigate`
route are implemented; the latter uses a deterministic fixed-rule labeler.
Other workflow modules remain planned. SQL migrations, prompt templates and
workflow tests will be added with their reviewed implementations.

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

The tests cover liveness, OpenAPI registration, and offline Condition B output
validation with a stubbed model response. They do not check database
connectivity, live AI calls or frontend integration. Dependencies are declared
as compatible ranges; lock resolved versions once the team has verified
installation.

The separate AI-only Condition B runner is optional and is not used by the
`/investigate` endpoint. To install its provider dependency, include the
`evaluation` extra:

```powershell
.\.venv\Scripts\python.exe -m pip install -e ".[dev,evaluation]"
```

From `src/backend`, run it with a JSON file matching the shared
`ScenarioInput` schema:

```powershell
.\.venv\Scripts\python.exe -m app.ai.condition_b_eval input-scenario.json output-report.json
```

Set `GEMINI_API_KEY` or `GOOGLE_API_KEY` before running; optionally set
`GEMINI_MODEL` to select the model. This makes a live provider request. Do not
use it for study results until the case, scoring, and measurement contracts
have been approved. `run_duration_ms` measures from immediately before the
provider request through structured-response and evidence-reference validation;
it excludes process startup, input loading, and client construction. The team
must approve this measurement boundary before comparing it with human trial
timings.

The frontend does not send these events yet. This remains **storage-only**. SCRUM-102 has been merged; API and UI integration are still pending. The existing Condition B result remains in `investigation_sessions.findings`. Do not use these draft timestamps as final study outcomes.

To run the focused telemetry storage and contract tests:

```powershell
.\.venv\Scripts\python.exe -m pytest -q tests/test_telemetry.py tests/test_telemetry_contract.py
```

- app/main.py: construct FastAPI and register implemented routes.
- app/config.py: environment settings and allowed frontend origins.
- app/api/: HTTP endpoints; health.py and investigations.py currently serve routes.
- app/schemas/: future Pydantic request/response definitions.
- app/domain/: future investigation rules independent of HTTP and SQL.
- app/services/: future workflow coordination.
- app/ai/: fixed-rule prototype and separate Condition B AI-only runner.
- app/db/: future SQLite access and Nhat's reviewed migrations.
- tests/: backend behaviour and API checks.

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

The telemetry tests use `tmp_path` and never read or overwrite the local `investigation-sessions.sqlite3` file. The production database file is excluded by `.gitignore`.

To initialise an empty local database (not tracked in Git), from `src/backend`:

```powershell
.\.venv\Scripts\python.exe -c "from pathlib import Path; from app.db.telemetry import TelemetryStore; TelemetryStore(Path('cos40005-study.sqlite3')); print('SQLite ready')"
```

This creates the four tables locally. Re-running it is safe; teammates create their own local database after pulling.
