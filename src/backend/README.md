# COS40005 FastAPI backend

This README explains how to set up and run the backend, try the Case 1 investigation, and run backend and frontend checks. Unless a section says otherwise, backend commands run from `src/backend`.

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

In PowerShell, use `.venv`'s Python directly as shown below, or activate it with `.\.venv\Scripts\Activate.ps1`. In Bash, activate it with `source .venv/bin/activate` or use `.venv/bin/python` in place of `python`.

## Start the backend and open Swagger

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

Checks the health and OpenAPI endpoints, the Case 1 suspicious label, and whether fixed-rule explanations cite matching evidence without citing unrelated evidence.

### Print the labeled Case 1 response

```bash
python -m pytest -q tests/test_health.py::test_case_one_real_evidence_is_labelled_suspicious -s
```

Runs the real Case 1 investigation check and prints its response. The test checks the response status, case ID, suspicious label, and fixed-rule prototype. `-s` shows output printed by the test.

### Complete backend test suite

```bash
python -m pytest -q
```

Runs all collected backend tests, including health, assessment, session, lifecycle, and telemetry contract checks.

### Verbose condition coverage

```bash
python -m pytest -vv tests/test_sessions.py tests/test_lifecycle.py tests/test_health.py
```

Shows each test name while checking session behavior, condition-specific actions, valid and invalid lifecycle changes, health/API behavior, and the Case 1 response.

### Verbose complete backend test suite

```bash
python -m pytest -vv
```

Runs the complete backend suite and prints each test name and result.

Pytest reports each test as `PASSED` or `FAILED`. A final summary such as `13 passed` means 13 tests passed; the count can change as tests are added or parameterized. Warnings, such as dependency deprecation warnings, are listed separately from pass/fail results.

The connected CI workflow runs the backend tests and exercises the React workflow against a temporary SQLite database. Dependency constraints record the resolved Python 3.13 package versions.

## Run frontend tests

From `src/frontend`, run:

```bash
npm test
```

This runs the frontend Vitest checks for the app, case validation, demo data, backend connection display, investigation state, hooks, and local draft storage. The frontend tests do not require the backend server to be running. Install frontend dependencies first with `npm ci --ignore-scripts` if needed. Node.js 24.22.1 is specified in the frontend README.
