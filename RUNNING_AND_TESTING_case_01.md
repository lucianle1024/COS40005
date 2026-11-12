# Run and test the project

The project has a FastAPI backend and a React frontend. The steps below show how to start the backend, try Case 1 in the browser, and run the automated tests.

## Start the backend and open the API page

In PowerShell, from the repository folder:

```powershell
cd src/backend
python -m uvicorn app.main:app --reload
```

Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs). This page lets you send requests to the API from your browser.

To try Case 1:

1. Expand `POST /investigate` and click **Try it out**.
2. Paste the Case 1 JSON request. A real example is in `data/scenarios/case_01/case_01_evidence.json`; the API request also needs the case ID, version, title, and evidence records.
3. Click **Execute**.
4. A successful response has HTTP `200` and should include `"label": "suspicious"` for the Case 1 evidence.

## Run the backend tests

From `src/backend` in PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -e ".[dev]" -c constraints.txt
.\.venv\Scripts\python.exe -m pytest -q
```

Pytest prints a summary at the end. A passing run shows that all collected tests passed; the number can change as tests are added or parameterized.

To run just the real Case 1 check and display its response:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_health.py::test_case_one_real_evidence_is_labelled_suspicious -s -q
```

The `-s` option displays output printed by the test, and `-q` keeps the pytest summary short. The test reads the real Case 1 evidence file and sends it to `/investigate`. It checks that the API returns HTTP `200`, keeps the case ID as `case_01`, labels the evidence `suspicious`, and identifies the fixed-rule prototype.

## What the tests check

Tests are small automatic checks of expected behavior. Pytest runs each test and reports a failure if an expected result is missing or different.

- **Health and API test:** checks that the health endpoint is working and that the API schema includes key endpoints. It also checks the real Case 1 assessment.
- **Assessment test:** checks that the fixed rules cite evidence that matches the signals, and do not cite unrelated evidence.
- **Session tests:** check that sessions can be started and resumed, findings can be saved and finalised, and each mode allows only its intended actions.
- **Lifecycle tests:** check that valid status changes work and invalid actions are rejected.
- **Telemetry contract test:** checks that the example telemetry data follows the documented field and value rules.

Tests that need a database use a temporary SQLite database, so they do not change your normal local session data. The backend tests run locally and do not need the frontend server to be running.

## Run the frontend

Start the backend first. Then, in a second PowerShell terminal from the repository folder:

```powershell
cd src/frontend
npm ci --ignore-scripts
npm run dev
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/). Frontend dependencies require Node.js 24.22.1, as noted in the frontend README.

To run the frontend tests, from `src/frontend`:

```powershell
npm test
```

Vitest checks the app, case validation, demo data, backend connection display, investigation state and hook behavior, and local draft storage. These tests do not require the backend to be running.
