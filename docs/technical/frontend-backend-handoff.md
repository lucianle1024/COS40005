# Frontend handoff for Phi

**Status:** Frontend-only increment, 27 October 2026. Backend implementation and provider verification are not included.

## Run the frontend

From the repository: `cd src/frontend`, `npm ci --ignore-scripts`, then `npm run dev`. Open http://127.0.0.1:5173/. It runs independently of FastAPI with validated synthetic fixtures and browser-local drafts.

## Existing boundary

| Item | Location | Purpose |
|---|---|---|
| Consumer case schema | `src/frontend/contracts/workbench.schema.json` | Canonical demo shape for case metadata, evidence, advice and automated assessment |
| Generated case types | `src/frontend/src/api/generated.ts` | Generated from that schema, checked during build |
| Demo provider | `src/frontend/src/api/demo-provider.ts` | `loadDemoCase(caseId: string): Promise<InvestigationCase>` using the shared validator |
| Shared case validator | `src/frontend/src/api/case-validator.ts` | Schema validation and duplicate-ID checks for demo and future real adapters |
| Workflow coordination | `src/frontend/src/hooks/useInvestigation.ts` | Loading, separate mode drafts, save/review/confirmation actions |
| Synthetic example | `src/frontend/src/fixtures/phishing-case.json` | Complete contract-valid example; no answer key or participant data |
| UI state | `src/frontend/src/state/investigation.ts` | Local findings, per-item reviews, revisions and finalisation |
| Local persistence | `src/frontend/src/storage/local-drafts.ts` | Versioned browser saves, separate by case and mode; existing keys/format preserved |

App receives its case loader through the `loadCase` prop. The default loader selects `case-01`. No HTTP routes, authentication, server save responses or event payloads are assumed implemented. No API keys belong in frontend environment variables or the browser bundle.

## Agree together before connecting

1. Confirm the canonical server contract with Tin. The current schema is a **consumer proposal for synthetic data only** (`provenance` is restricted to `synthetic`). Do not silently change it to accept real/client data. Prefer generating consumer types from FastAPI's reviewed OpenAPI contract when the real API is ready, rather than maintaining duplicate payload definitions.
2. Preserve opaque case, version, evidence and advice IDs. A source reference must resolve to the correct original record; absent references must stay visibly unresolved. Duplicate evidence/advice IDs are currently rejected.
3. Decide how the backend assigns participant sessions and workflow conditions. The frontend mode switch is only a demo. Hiding a panel or disabling a button is not server access control.
4. Agree save/finalise/review request and response shapes, including conflict, validation and server-unavailable errors. Replace browser-save language only when an actual server acknowledgment exists.
5. Agree Nhat's event names, timestamps, exposure/review definitions, case versions and required IDs. No research events are emitted yet; do not infer measurement from UI clicks or local storage.
6. Keep restricted ground truth and scoring separate from analyst-facing records and all prompts. The frontend schema carries no answer keys.

The current proposed state/storage signatures take the complete case object and mode so saves can be validated against case version and available evidence/advice IDs. They are local helpers, not API methods.

## What the UI does now

- Human-only displays evidence and independent findings. AI-only shows fixed read-only output. Combined mode offers individual review, explicit draft transfer and final confirmation.
- Accept/revise/reject does not submit findings. The original advice remains separate from revisions.
- Add to findings explicitly adds text and valid source IDs without setting classification. Missing sources are never fabricated.
- Failed local saves preserve input. Switching with unsaved changes requires save, discard or cancel.
- Finalised findings are read-only until a new draft is explicitly created. Browser persistence is replaceable and is not an immutable server audit log.

## Integration acceptance checks

- Generate consumer types from the agreed artifact and validate actual responses, including empty and error cases.
- Demonstrate real case loading, failed loading and retry without automatic fallback to synthetic fixtures.
- Demonstrate server-side mode enforcement, authorized save/review/finalise operations and visible success/failure acknowledgments.
- Verify actual persisted findings and Nhat's event records, not just successful HTTP status codes.
- Ensure answer keys, provider credentials and private client data are absent from browser assets and API responses.
- Run a full frontend/backend path before claiming SCRUM-51 integration is complete.

These checks are pending. The frontend unit tests do not establish a working FastAPI connection or research results.

## 28 October UI correction

See [viewport and workflow verification](frontend-layout-fix-2026-10-28.md). Cite/Cited replaces evidence checkboxes; review and explicit transfer remain separate. Desktop columns now scroll independently with pinned findings actions. No provider/session/event contract changed; backend enforcement and recording remain pending.


## 28 October: two-pane adaptation

The approved layout now uses a left record navigator/raw inspector and a right shared advice/findings scroller. FindingsActions owns the pinned local action controls; App retains persistence and mode/finalisation state. The case schema, loader boundary and draft state signatures are unchanged. No participant telemetry, timer, confidence field or live model was introduced. See [forensic layout verification](frontend-forensic-layout-2026-10-28.md).


## 28 October: coordination and persistence cleanup

App now assembles the interface; hooks/useInvestigation.ts coordinates existing load/save/mode/review/confirmation behaviour. Browser persistence moved to storage/local-drafts.ts with the same saved keys/format. Shared api/case-validator.ts serves the demo loader and future approved API adapter. CaseLoader preserves the existing injected loadCase signature. There is no HTTP client or new endpoint yet. See [refactor checks](frontend-structure-refactor-2026-10-28.md).

