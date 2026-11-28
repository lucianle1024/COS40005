# COS40005 FastAPI backend


Directory plan agreed by the team, as reported by Tin on 3 November 2026.
This is a starter scaffold. `GET /health` and the prototype `POST /investigate`
route are implemented; the latter uses a deterministic fixed-rule labeler.
Other workflow modules remain planned. SQL migrations, prompt templates and
workflow tests will be added with their reviewed implementations.


## Python environment

The backend dependency set is tested with Python 3.13.

### PowerShell

From the repository root:

```powershell
cd src/backend
py -3.13 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".[dev]" -c constraints.txt
```

### Bash

From the repository root:

```bash
cd src/backend
python3.13 -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]" -c constraints.txt
```

This is a local development build. Case 1 Human + AI serves fixed-rule claims from `GET /sessions/{session_id}/advice`. The route is limited to Human + AI sessions. Individual review decisions are held in the React workspace. Participant access control and telemetry API integration remain outside this increment.


From `src/backend`, start the FastAPI development server:

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

With the virtual environment activated, the same command works in Bash. Leave the server running. Open the interactive Swagger API page at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

The default CORS settings allow the frontend on port 5173. If you use another port, set `SOC_ALLOWED_ORIGINS` to a JSON list of allowed origins.

## Try the Case 1 investigation

In Swagger, expand **POST /investigate**, click **Try it out**, enter a JSON request, and click **Execute**. The real evidence file is `data/scenarios/case_01/case_01_evidence.json` at the repository root. The request body wraps evidence records in the case fields, for example:

```json
{
  "id": "case_01",
  "version": "1.0",
  "title": "Endpoint Script Execution Alert",
  "evidence": [
    {"id": "EVENT-1", "type": "windows-event", "text": "{\"EventID\": 4104}"}
  ]
}
```

The labeled Case 1 test command below loads the full evidence file, posts it to `/investigate`, and prints the response. A successful response has HTTP `200`, `case_id` `case_01`, label `suspicious`, and prototype `fixed-rule-v2`. This AI-only investigation corresponds to **Condition B**. Its rationale lists the rule checks that passed and their supporting evidence IDs. The confidence field is an uncalibrated rule score.

## Case 1 sessions and conditions

- **Condition A:** human-only.
- **Condition B:** AI-only.
- **Condition C:** human plus AI.

The session API provides these behaviors:

- `GET /sessions/case-01` serves case metadata and evidence records, excluding the evaluation answer key.
- `POST /sessions` opens an attempt and records its start time. Repeating the same attempt key, case version, and mode resumes that attempt.
- `GET /sessions/{id}` returns saved state. Draft and finalise routes save human findings. Finalisation requires reasoning and a case citation; subsequent writes return a conflict.
- `POST /sessions/{id}/complete-ai` saves the AI-only assessment. `POST /investigate` runs the same fixed-rule assessment on supplied evidence.
- In Condition C, `GET /sessions/{session_id}/advice` serves fixed-rule claims. This route is limited to Human + AI sessions. Individual review decisions are held in the React workspace.

This is a local development build. Participant access control and telemetry are outside this increment. Automated tests prove code-level support for the behaviors they exercise, but do not measure participant performance or establish research outcomes. Participant testing requires session records and telemetry so that participant actions and investigation outcomes can be analyzed using the evaluation metrics.

`SOC_SESSION_DATABASE` overrides the default `investigation-sessions.sqlite3` in the backend working directory. Tests that need a database use a temporary SQLite database; use a separate database for any manual testing.

## Run backend tests

Run the commands below from `src/backend`. With the virtual environment activated, use `python`. In PowerShell without activation, use `.\.venv\Scripts\python.exe` instead of `python`.

### Focused health and assessment checks

```bash
python -m pytest -q tests/test_health.py tests/test_assessment.py
```

### Run the test suite in Docker

Build from this directory so the Dockerfile can copy the backend files, then run
the container without mounting the repository:

```bash
docker build -t cos40005-backend .
docker run --rm cos40005-backend
```

The image includes `app/` and `tests/`; its default command runs the full test
suite.


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

Add `--model <model-id>` to select a model for a one-off run. Run the module
without arguments to use the interactive slash-command interface:

```powershell
.\.venv\Scripts\python.exe -m app.ai.condition_b_eval
```

In interactive mode, enter `/model` to choose from the five listed Gemini
models, `/run` to provide the scenario and output JSON paths, `/help` for
commands, or `/quit` to exit. The selection lasts for that interactive session.
Alternatively, set `GEMINI_MODEL` to choose the default model. Model access,
free-tier availability, quotas, and pricing depend on the provider account and
can change; a listed model is not a guarantee of availability or zero cost.
Set `GEMINI_API_KEY` or `GOOGLE_API_KEY` before running; this makes a live
provider request. Do not use it for study results until the case, scoring, and
measurement contracts have been approved. `run_duration_ms` measures from
immediately before the provider request through structured-response and
evidence-reference validation; it excludes process startup, input loading, and
client construction. The team must approve this measurement boundary before
comparing it with human trial timings.

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

