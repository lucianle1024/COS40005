# COS40005 FastAPI backend

Directory plan agreed by the team, as reported by Tin on 3 November 2026.
This is a starter scaffold: only GET /health is implemented. Other Python modules reserve the agreed locations and contain docstrings only. SQL migrations, prompt templates and workflow tests will be added with their reviewed implementations.

## Install (Windows PowerShell)

From the repository root:

```powershell
cd src/backend
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".[dev]"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Python 3.11 or newer is required. Python 3.13 is installed on Tin's machine; the plain `python` command currently selects Python 3.9. Use another installed supported interpreter if necessary. Calling the virtual environment's Python directly avoids PowerShell activation-policy issues.

Open http://127.0.0.1:8000/health (expected: {"status":"ok"}) and http://127.0.0.1:8000/docs for API documentation. Stop with Ctrl+C.

Optional: copy .env.example to .env for local settings. The app runs with defaults without a .env. Defaults allow GET requests from the React development origins on port 5173. Extend CORS alongside actual endpoints and the reviewed access model.

## Test after installing

```powershell
.\.venv\Scripts\python.exe -m pytest
```

The smoke test covers liveness and OpenAPI registration. It does not check database connectivity, AI calls or frontend integration. Dependencies are declared as compatible ranges; lock resolved versions once the team has verified installation.

## Directory responsibilities

- app/main.py: construct FastAPI and register implemented routes.
- app/config.py: environment settings and allowed frontend origins.
- app/api/: HTTP endpoints; only health.py currently serves a route.
- app/schemas/: future Pydantic request/response definitions.
- app/domain/: future investigation rules independent of HTTP and SQL.
- app/services/: future workflow coordination.
- app/ai/: future provider routing, validation and versioned prompts.
- app/db/: future SQLite access and Nhat's reviewed migrations.
- tests/: backend behaviour and API checks.

See ../../docs/technical/team-directory-map.md for team leads and ../../docs/technical/backend-directory-plan.md for the detailed plan. Agreement on directory placement does not approve unfinished API/schema decisions. Confirm existing unpublished work with Phi and Nhat before filling the reserved modules.

Setup follows the official FastAPI guides: https://fastapi.tiangolo.com/virtual-environments/ and https://fastapi.tiangolo.com/tutorial/first-steps/ .
