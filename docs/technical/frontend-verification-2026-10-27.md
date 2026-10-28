# Frontend verification, 27 October 2026

**Scope:** React frontend increment on local branch `feat/tin-frontend-workbench`, starting from `b4fa52b887ade7496adf5235c674b39cb7122d5e`. No commits, pushes, backend implementation or Jira updates.

## Implemented

- One clearly labelled synthetic phishing case, four original records and fixed advice.
- Human-only, read-only AI-only and combined demonstration workflows.
- Evidence search/type filtering/reset, original-record expansion, citations and source navigation; missing source references remain visible.
- Individual accept/revise/reject decisions, preserved original advice and separate explicit draft transfer.
- Analyst reasoning/classification, browser drafts, separate case/version/mode storage, unsaved-switch decisions and confirmed finalisation.
- Failed/corrupt storage feedback, read-only finalised findings and an explicit new-draft action.
- Responsive panels and keyboard dialogs with restored focus. No live model or telemetry.

## Actual checks

| Check | Result |
|---|---|
| `npm test` | 38 passed across four test files after final fixes |
| `npm run build` | Passed, including generated-type drift check, TypeScript and Vite production build |
| `npm run format:check` | Passed on the final source tree in the clean verification installation |
| Clean installation | Separate hash-checked source copy: `npm ci --ignore-scripts` succeeded with no audit vulnerabilities reported; after review fixes the same clean installation passed all 38 tests, formatting and production build |
| Real browser layout | Chrome at 1440px desktop and emulated 390px mobile; no horizontal document overflow observed |
| Real browser workflows | Human-only hides advice; AI-only has no analyst edits; dirty-switch dialog keeps input, Escape closes it, local save works |
| Dialog regression | About -> Escape initially left focus on BODY; fixed and browser-confirmed focus returns to About button |
| Lighthouse mobile snapshot | Final accessibility 100 and best practices 100; initial contrast/name issues fixed. This automated snapshot does not establish complete accessibility conformance |

The final audit still flags missing robots.txt and llms.txt, affecting SEO/agent-discovery categories. Those discovery files are outside this localhost demo's requirements. No public-site or performance claim is made.

Final handover check: local preview returned HTTP 200; 10 local documentation links resolved; generated dependencies/build output and environment files were absent from Git's untracked deliverable list. No console warnings/errors were present in the final browser session. Browser screenshots and the final audit report are saved under `evidence/product/Tin/frontend-2026-10-27/`.

## Independent review and corrections

A fresh `gpt-6-astra` reviewer read the implementation, tests, schema and handoff without editing files. It found no critical defect. Missing dialog focus restoration was fixed after a failing regression test. Enum coercion in corrupt local data was also fixed with a failing test, then all 38 checks passed. Browser audit findings were corrected and the same audit repeated.

**Deferred minor coverage:** dedicated interaction tests for failed Save and switch, failed Confirm finalisation, and the cancel/create/reload new-draft lifecycle. Ordinary storage failures and successful finalisation/mode workflows are tested; the reviewer found no demonstrated normal-use data-loss defect in those untested branches.

## Implementation choices

1. Work stays in the user-requested clone on a local feature branch, rather than a second checkout. This preserves the planned paths but provides no filesystem isolation from concurrent local edits.
2. Keep execution logs rather than deleting them because no commits are authorised. Windows commands substitute for Bash bookkeeping helpers; progress is manually recorded.
3. Draft state was implemented before final panel wiring because the panels depend on it. Draft keys include case version; older versions are not automatically migrated.

## Still pending

Tin's personal review/understanding, team acceptance, Huy's reviewed evidence, Phi's real API/persistence/mode controls, Nhat's agreed telemetry and the full frontend/backend integration check. SCRUM-51/52 are partial progress, not accepted whole issues. No timing, accuracy, analyst-reliance or effectiveness result has been measured.

See [setup](../../src/frontend/README.md), [Phi handoff](frontend-backend-handoff.md) and the [AI assistance log](../../ai-usage/2026-10-27-frontend.md).
