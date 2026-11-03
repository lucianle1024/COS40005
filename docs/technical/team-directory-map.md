> Directory placement agreed by the team, reported by Tin on 3 November 2026. Historical proposal wording below is preserved. File placements are agreed; unimplemented features and open API/schema decisions remain pending. See src/backend/README.md for the actual scaffold.

# COS40005 team directory map

**Status:** Proposed for team review. The frontend exists; the backend and evaluation files shown are planned. Names show suggested leads, not exclusive ownership.

```text
COS40005/
├── src/
│   ├── frontend/                       # TIN: React analyst interface
│   │   ├── public/                     # TIN: static assets
│   │   ├── contracts/                  # TIN + PHI: current frontend data shape
│   │   ├── scripts/                    # TIN: type-generation script
│   │   ├── src/
│   │   │   ├── main.tsx                # TIN: start React
│   │   │   ├── App.tsx                 # TIN: assemble the interface
│   │   │   ├── styles.css              # TIN: interface styling
│   │   │   ├── components/             # TIN: evidence, advice and findings panels
│   │   │   ├── hooks/                  # TIN: coordinate investigation interactions
│   │   │   ├── state/                  # TIN: local draft and review rules
│   │   │   ├── storage/                # TIN: browser draft storage
│   │   │   ├── api/                    # TIN + PHI: case loader and future API adapter
│   │   │   ├── fixtures/               # TIN + HUY: synthetic demo data
│   │   │   └── test/                   # TIN + QUANG: frontend test setup
│   │   ├── package.json                # TIN: frontend dependencies and scripts
│   │   ├── vite.config.ts              # TIN: frontend development server/build
│   │   └── README.md                   # TIN: frontend setup
│   │
│   └── backend/                        # PROPOSED: team FastAPI application
│       ├── app/
│       │   ├── main.py                 # PHI: start FastAPI and register routes
│       │   ├── config.py               # PHI: backend settings
│       │   ├── dependencies.py         # PHI + NHAT: database/session access
│       │   ├── api/
│       │   │   ├── health.py           # PHI: backend health
│       │   │   ├── scenarios.py        # PHI + HUY: case and evidence endpoints
│       │   │   ├── sessions.py         # TIN + PHI: investigation sessions
│       │   │   ├── investigations.py   # PHI: request and retrieve AI runs
│       │   │   ├── decisions.py        # PHI + TIN: review decisions
│       │   │   ├── reports.py          # PHI + TIN: save/finalise findings
│       │   │   └── events.py           # NHAT + PHI: receive activity events
│       │   ├── schemas/                # PHI + TIN + NHAT: validate API data
│       │   ├── domain/                 # TIN + PHI: investigation/lifecycle rules
│       │   ├── services/               # PHI + TIN: coordinate backend workflows
│       │   ├── ai/
│       │   │   ├── router.py           # PHI: choose model provider
│       │   │   ├── providers.py        # PHI + QUANG: fixed/live AI adapters
│       │   │   ├── validation.py       # PHI + QUANG: check AI output
│       │   │   └── prompts/            # PHI + QUANG: versioned prompt templates
│       │   └── db/
│       │       ├── connection.py       # NHAT + PHI: SQLite connections
│       │       ├── repositories.py     # NHAT + PHI: database queries
│       │       └── migrations/         # NHAT: reviewed schema changes
│       ├── tests/                      # QUANG + developers: backend tests
│       ├── pyproject.toml              # PHI: Python dependencies
│       ├── .env.example                # PHI: setting names, no real secrets
│       └── README.md                   # PHI + TIN: setup and testing
│
├── data/
│   └── scenarios/                      # HUY: reviewed, versioned case evidence
├── research/
│   └── evaluation/
│       ├── run_ai_only.py              # QUANG: automated AI-only baseline
│       ├── metric_scoring.py           # NHAT: scoring and evaluation
│       └── export_results.py           # NHAT: researcher data export
├── tests/
│   └── integration/                    # TIN + QUANG: complete workflow tests
├── docs/
│   └── technical/                      # TEAM: architecture and API agreements
├── evidence/                           # TEAM: test and contribution evidence
├── ai-usage/                           # TEAM: AI assistance records
├── handover/                           # TIN + TEAM: final handover
└── .gitignore                          # TEAM: exclude secrets and private data
```

Keep ground-truth keys and participant data restricted from the participant-facing app. Confirm responsibilities, contracts and the proposed layout with the team before implementation.
