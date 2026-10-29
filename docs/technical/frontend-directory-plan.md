# Frontend directory plan

**Status:** Frontend structure implemented on 27 October 2026 and reorganised on 28 October after Tin authorised the cleanup. The backend folder remains a proposal and has not been created. Supporting files also include the formatter configuration, favicon and reusable dialog/source-link components.

**Code location:** `C:/Users/admin/Downloads/GitHub-Repos/COS40005`

**Ownership:** Tin leads the frontend. Phi develops the backend. This structure is a frontend proposal for coordination, not evidence that Phi has agreed a backend layout or API.

## Planned structure

```text
COS40005/
|-- src/
|   |-- frontend/                         # React app, Tin
|   |   |-- package.json                  # Dependencies and scripts
|   |   |-- package-lock.json             # Reproducible npm dependency versions
|   |   |-- index.html                    # Vite entry page
|   |   |-- vite.config.ts                # Development/build configuration
|   |   |-- tsconfig*.json                # TypeScript configuration
|   |   |-- README.md                     # Startup, tests, demo limitations
|   |   |-- contracts/
|   |   |   `-- workbench.schema.json      # Proposed case/evidence/advice shape
|   |   |-- scripts/
|   |   |   `-- generate-types.mjs         # Generate types from the schema
|   |   `-- src/
|   |       |-- main.tsx                  # Mount React
|   |       |-- App.tsx                   # Assemble UI and presentation dialogs
|   |       |-- App.test.tsx              # User-visible workflow tests
|   |       |-- styles.css                # Shared layout and Tailwind styles
|   |       |-- components/
|   |       |   |-- CaseHeader.tsx         # Case/version and demo status
|   |       |   |-- ModeSelector.tsx       # Three demonstration modes
|   |       |   |-- EvidencePanel.tsx      # Search, list and citation selection
|   |       |   |-- RecordInspector.tsx    # Read-only original record content
|   |       |   |-- AdvicePanel.tsx        # Fixed advice, sources, review controls
|   |       |   |-- FindingsPanel.tsx      # Analyst findings form
|   |       |   `-- FindingsActions.tsx    # Pinned save/finalise controls
|   |       |-- api/
|   |       |   |-- generated.ts           # Generated case-data types, not hand-edited
|   |       |   |-- demo-provider.ts       # Load validated synthetic case data
|   |       |   |-- demo-provider.test.ts  # Fixture/provider checks
|   |       |   |-- case-validator.ts      # Shared incoming-case validation
|   |       |   `-- case-validator.test.ts # Schema, IDs and unresolved references
|   |       |-- hooks/
|   |       |   |-- useInvestigation.ts    # Loading, modes, saves and confirmations
|   |       |   `-- useInvestigation.test.ts # Workflow failure/lifecycle coverage
|   |       |-- storage/
|   |       |   |-- local-drafts.ts        # Explicit browser-only save/load
|   |       |   `-- local-drafts.test.ts   # Storage failures and corrupt data
|   |       |-- fixtures/
|   |       |   `-- phishing-case.json     # Synthetic evidence and fixed advice
|   |       |-- state/
|   |       |   |-- investigation.ts       # Pure draft/review/finalisation rules
|   |       |   `-- investigation.test.ts  # Draft isolation and finalisation rules
|   |       `-- test/
|   |           `-- setup.ts              # Test environment and DOM matchers
|   `-- backend/                          # Optional future location, Phi to confirm
|-- docs/
|   |-- technical/
|   |   |-- frontend-directory-plan.md    # This document
|   |   `-- frontend-backend-handoff.md   # To write during implementation
|   `-- superpowers/
|       |-- specs/
|       |   `-- 2026-10-27-frontend-workbench-design.md
|       `-- plans/
|           `-- 2026-10-27-frontend-workbench.md
|-- ai-usage/                             # Actual assistance records
|-- evidence/                            # Reviewed evidence of work
|-- data/                                # Existing team data area
|-- research/                            # Existing research area
`-- tests/                               # Existing area for future cross-system tests
```

Existing repository folders stay in place. `src/backend/` is shown only to explain the possible separation; do not create it or prescribe its contents while Phi owns the backend work. Build output, dependencies and local environment files will be ignored by Git.

## How the parts connect

```text
Synthetic case fixture
  -> schema validation and demo provider
  -> App and evidence/advice panels
  -> analyst review and findings state
  -> explicit browser draft save or local finalisation

Later, after agreement with Phi:
backend API -> validated provider boundary -> the same workspace
```

Components must not import fixture files directly. Keeping data access separate means the backend can be connected without rewriting the panels. A future HTTP adapter will report network failures explicitly rather than silently displaying mock data.

The schema initially covers case/evidence/advice data. Local draft and review types belong in `state/investigation.ts`; they are not yet the agreed server payload. Before backend integration, Phi and Tin should agree one canonical API contract and generate consumer types from it, rather than maintaining competing schemas.

## What to build first

| Order | Deliverable | How we know it works |
|---|---|---|
| 1 | React/Vite setup and validated demo case | Fixture checks and type checking pass |
| 2 | Evidence list and read-only record inspector | Open, search, clear filters and select supporting records |
| 3 | Three modes and advice review | Human-only has no advice; AI-only is read-only; combined preserves original advice |
| 4 | Findings and local drafts | Explicit save/finalise, separate mode drafts and visible storage failures |
| 5 | Documentation and Phi handoff | Fresh tests/build and clear integration checklist |

Implemented scripts include `npm run dev`, `npm test`, `npm run typecheck`, `npm run format:check` and `npm run build` from `src/frontend/`. See the frontend README for setup and the verification note for actual results.

## Confirm with Phi before connecting the backend

- Case ID/version, evidence/advice IDs, record content and source-reference format.
- Session/mode ownership and server enforcement; the demo switch is not a study control.
- Requests, responses, validation errors and unavailable-backend behaviour.
- How findings and review decisions are stored and acknowledged.
- Nhat's required research events and identifiers, including their agreed definitions.
- Server-only API keys and restricted answer keys. Neither belongs in the browser bundle or fixtures.

The frontend-first demo is partial progress on SCRUM-51/52. It cannot establish a working frontend/backend connection, server saves or research effectiveness.

Full behaviour and checks: [design](../superpowers/specs/2026-10-27-frontend-workbench-design.md) and [implementation plan](../superpowers/plans/2026-10-27-frontend-workbench.md).
