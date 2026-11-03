> Directory placement agreed by the team, reported by Tin on 3 November 2026. Historical proposal wording below is preserved. File placements are agreed; unimplemented features and open API/schema decisions remain pending. See src/backend/README.md for the actual scaffold.

# COS40005 backend directory plan

Prepared 3 November 2026. Proposal for team review; no backend implementation or API approval is claimed.

## Purpose

Build one FastAPI application that serves case evidence, enforces investigation conditions, calls the agreed AI provider, preserves original AI output, saves analyst findings and records research events.

This plan builds on Phi's SCRUM-48 API proposal and Nhat's SCRUM-49 SQLite design. Keep their existing work; review the interfaces together rather than creating competing schemas.

## Proposed location

Use the existing team repository: `C:/Users/admin/Downloads/GitHub-Repos/COS40005/src/backend/`. No separate repository is required. The existing frontend remains at `src/frontend/`.

```text
COS40005/
├── src/
│   ├── frontend/                     # Existing React application
│   └── backend/                      # Proposed FastAPI application
│       ├── README.md                 # Setup, run, test and data instructions
│       ├── pyproject.toml            # Python dependencies and test configuration
│       ├── .env.example              # Names/placeholders only, no real secrets
│       ├── app/
│       │   ├── __init__.py
│       │   ├── main.py               # Construct app and register routes
│       │   ├── config.py             # Environment settings, CORS and data paths
│       │   ├── dependencies.py       # DB connection and session access checks
│       │   ├── api/                  # HTTP inputs, responses and status codes
│       │   │   ├── __init__.py
│       │   │   ├── health.py
│       │   │   ├── scenarios.py      # Case metadata and analyst-safe evidence
│       │   │   ├── sessions.py       # Assigned condition and start/end lifecycle
│       │   │   ├── investigations.py # AI run requests and saved run results
│       │   │   ├── decisions.py      # Suggestion exposures and review decisions
│       │   │   ├── reports.py        # Save drafts and finalise findings
│       │   │   └── events.py         # Interaction events
│       │   ├── schemas/              # Pydantic request/response validation
│       │   │   ├── __init__.py
│       │   │   ├── scenario.py
│       │   │   ├── session.py
│       │   │   ├── ai.py
│       │   │   ├── decision.py
│       │   │   ├── report.py
│       │   │   └── event.py
│       │   ├── domain/
│       │   │   ├── __init__.py
│       │   │   ├── types.py          # Shared condition, state and decision values
│       │   │   └── rules.py          # Investigation rules independent of HTTP/SQL
│       │   ├── services/             # Coordinate each use case and transaction
│       │   │   ├── __init__.py
│       │   │   ├── sessions.py
│       │   │   ├── investigations.py
│       │   │   ├── decisions.py
│       │   │   ├── reports.py
│       │   │   └── telemetry.py
│       │   ├── ai/
│       │   │   ├── __init__.py
│       │   │   ├── router.py         # Select configured provider
│       │   │   ├── providers.py      # Fixed fixture and first approved live adapter
│       │   │   ├── validation.py     # Output shape, references and technique checks
│       │   │   └── prompts/          # Versioned templates from Phi
│       │   │       ├── summarise.txt
│       │   │       ├── extract.txt
│       │   │       └── assess.txt
│       │   └── db/
│       │       ├── __init__.py
│       │       ├── connection.py     # SQLite connections, FK enablement, transactions
│       │       ├── repositories.py   # Parameterised queries grouped by use case
│       │       └── migrations/
│       │           └── 001_initial.sql # Adopt reviewed Nhat schema, not a rewrite
│       └── tests/
│           ├── conftest.py           # Temporary DB and synthetic case fixtures
│           ├── test_rules.py
│           ├── test_sessions.py
│           ├── test_ai_runs.py
│           ├── test_decisions.py
│           ├── test_reports.py
│           ├── test_events.py
│           └── test_case1_workflow.py
├── data/
│   └── scenarios/                    # Reviewed, versioned analyst-safe case packages
├── research/
│   └── evaluation/                   # Researcher-only scorer/export tools and keys
├── docs/
│   └── technical/                    # Shared API/domain decisions and setup docs
└── .gitignore                        # Exclude .env, runtime DBs and private exports
```

The private evaluation inputs are excluded from participant deployment and prompts even if the tools live in the same repository. Do not commit private keys, participant records or trial databases. Runtime SQLite and export locations come from configuration and are not served as static files.

## What each layer does

| Layer | Owns | Must avoid |
|---|---|---|
| api | HTTP parsing, dependencies and error responses | SQL and provider calls embedded in route functions |
| schemas | Explicit input/output field validation | Treating valid JSON as proof a claim is true |
| domain | Condition restrictions and lifecycle invariants | Importing FastAPI or opening database connections |
| services | Coordinating rules, providers, persistence and transactions | Trusting a client-supplied mode or finalisation state |
| ai | Prompt version, provider execution and output checks | Receiving researcher answer keys or exposing credentials |
| db | Persistence constraints and queries | Maintaining a second, conflicting version of Nhat's schema |
| tests | Behaviour, API, constraints and integration checks | Calling paid/live models in routine automated tests |

Do not create an interface, abstract base class or repository class for every table just to demonstrate OOP. Use cohesive services and functions first. A provider protocol is useful when fixed and live implementations genuinely need the same contract. Split `repositories.py` or `providers.py` only when their size or responsibilities justify it.

## Mapping to Nhat's ten tables

| Existing proposed tables | Main service |
|---|---|
| participants, scenarios, trial_sessions | sessions, plus read-only scenario loading |
| ai_interactions, ai_suggestions | investigations |
| suggestion_exposures, suggestion_decisions | decisions |
| final_reports, report_iocs | reports |
| telemetry_events | telemetry |

Keep existing foreign-key, uniqueness, condition and exposure constraints. Enable foreign keys for every connection. Service transactions must make related writes consistent, for example a final report and its IOC rows. A failed write must not return success.

Nhat specifies one final report per session. Agree how editable drafts are stored before implementation: distinguish draft state from the immutable final submission, without silently changing that table's meaning. Any migration or extra draft storage needs a reviewed decision.

## API alignment: existing versus proposed

Phi's existing proposal includes `GET /health`, `GET /scenarios`, `POST /investigate`, `GET /results/{run_id}` and `POST /decisions`. Preserve these as the starting contract.

Additional capabilities still need team agreement:

- Retrieve one scenario's versioned evidence.
- Create/assign a session and start/finalise its lifecycle.
- Persist a suggestion exposure after the frontend reports rendering it.
- Save/retrieve an analyst draft and submit the final report.
- Record interaction events with unique event IDs and session references.

The filenames above group capabilities; they do not approve new endpoint paths. Generate frontend consumer types from the agreed FastAPI OpenAPI document once reviewed. The current synthetic frontend schema remains a demo contract until then.

## Key rules the backend must enforce

1. Load the assigned condition from the authorised session. Do not trust a browser mode switch or a submitted condition string.
2. Condition A has no AI interactions. Condition B is an automated baseline with no human participant. Condition C supports human review of AI suggestions.
3. Bind runs, suggestions, exposures, decisions, events and reports to the correct session and scenario/version.
4. A decision must refer to a suggestion exposed in the same C session. An exposure record acknowledges client rendering; it does not prove the analyst read or verified the content.
5. Preserve original provider output and suggestions separately from analyst decisions, revisions and final findings.
6. Accept/Modify/Reject clicks are separate from final-report contents. Evaluation scores the final report independently.
7. Keep unsupported references visible and distinguish schema/reference validation failures from factual truth. Define strict rejection versus flagged persistence consistently with Phi and the study protocol.
8. Apply Phi's bounded invalid-JSON retry rule; distinguish invalid JSON, timeout, provider failure and missing evidence. Store the actual model/prompt settings and outcome.
9. Agree start, pause/resume, end and elapsed-time rules with Nhat. Client elapsed time needs validation; timestamp columns alone do not define a valid duration.
10. Restrict researcher-only export/scoring access. Never return answer keys or trap labels in participant APIs or prompts.

## Example: combined-mode investigation

React requests the assigned case through `api/scenarios.py`. `dependencies.py` checks session access. The investigation service checks the stored C condition, loads approved evidence, calls the configured provider and stores the run/suggestions. React displays advice and acknowledges exposures. Decisions are validated and stored separately. The report service validates and commits the final findings. Telemetry records the agreed events. Researcher tools later join final IOC tuples with restricted versioned ground truth for scoring.

## Build order

1. Confirm the session/run/report contract and reviewed SQLite schema with Phi/Nhat.
2. Scaffold FastAPI, settings, DB connection and health check.
3. Load reviewed Case 1 evidence and expose the scenario read endpoints.
4. Implement session ownership, assigned mode and agreed timing lifecycle.
5. Implement a fixed provider through the real run/persistence path for deterministic integration tests.
6. Connect the first approved live provider behind the same service boundary; keep provider/version provenance explicit.
7. Implement exposure/decision recording and draft/final-report persistence.
8. Connect events, researcher exports and an end-to-end Case 1 test.

Develop frontend API connections alongside ready backend capabilities. Existing frontend tests and a deterministic fixed-provider run do not prove live AI quality or real participant outcomes.

## Decisions to settle before implementation

- Session identity, participant pseudonyms, researcher/session access mechanism and expiry.
- Mapping `scenario_id` and `run_id` to the frontend's case/version and advice IDs.
- Mapping Phi's severity/confidence/IOC/timeline output to analyst-facing claims and findings.
- Draft storage, final-report locking and save-conflict/retry behaviour.
- Event naming, exposure acknowledgement and timing policy.
- Provider choice, limits and approved API budget.

## Ownership and Scrum boundaries

Phi's API/model design and Nhat's database/evaluation work are inputs, not replaced by this proposal. Tin can own the shared domain model, lifecycle decisions and frontend integration, coordinating implementation responsibilities with them. SCRUM-51 covers setup; SCRUM-89/90 cover domain/lifecycle; SCRUM-91/92/93 connect cases/advice/tracing; SCRUM-97 through 100 connect persistence, sessions and events; SCRUM-78 assembles the system; SCRUM-61 verifies it end to end.

## Sources and status

- Phi: https://docs.google.com/document/d/1DloS2Em-omHwsRd6Q8iGqXj9Vj6GA-ScWg1vqEVQvzs/edit
- Nhat: https://docs.google.com/document/d/1wJrCf0XTEcXOwZwF4yXrc-fD07BKqIQ0Bc1d6kJImlY/edit
- Existing frontend handoff: `C:/Users/admin/Downloads/GitHub-Repos/COS40005/docs/technical/frontend-backend-handoff.md`.

Prepared with ChatGPT assistance from these documents and the current frontend boundary. This file is a directory and responsibility plan only. No backend folder, application code, dependency installation, migration, Jira status or team approval is created by this plan.
