# Frontend structure cleanup

**Date:** 28 October 2026. **Authority:** Tin approved the three immediate cleanup recommendations: separate local persistence, extract shared case validation, and move investigation coordination out of App. This change does not implement the later performance or backend proposals.

## Resulting boundaries

| Location | Responsibility |
|---|---|
| `src/App.tsx` | UI composition, About/Case brief dialogs, source-inspection focus |
| `src/hooks/useInvestigation.ts` | Case loading/retry, independent mode drafts, reviews, local saves and confirmation flows |
| `src/storage/local-drafts.ts` | Browser-local persistence and saved-draft validation |
| `src/api/demo-provider.ts` | Select/load the existing synthetic case through shared validation |
| `src/api/case-validator.ts` | Shared schema and duplicate-ID validation; preserve unresolved references for UI warnings |
| `src/api/generated.ts` | Existing generated case types; generator location unchanged |
| `src/state/investigation.ts` | Existing pure draft/review/finalisation rules, unchanged |

Storage code and its tests were moved together. Validation tests now sit beside the shared validator; demo-loader checks remain beside the demo loader. No speculative HTTP client was added before agreement with Phi.

## Impact and compatibility

The affected call paths are App -> hook -> storage/pure state, and demo provider -> shared validator -> schema. The UI component tree, stylesheet, fixtures, schema, generated-type location, persistence keys and saved JSON format were preserved. No data migration or new dependency is required.

A source comparison confirmed that all eight existing coordination method bodies were copied unchanged, storage differs only in its relocated type import, and case validation was extracted unchanged. Hook-specific intent actions contain the existing modal button operations. Presentation-only record focus remains in App. Existing source/verification documents from earlier increments remain historical snapshots; current README, PRODUCT, directory map and Phi handoff were updated.

## Actual checks

- Baseline: 45 tests passed across four files.
- Refactored app: **49 tests passed across six files**. Four added hook tests cover stale load cancellation, failed save-and-switch, failed confirmed finalisation and preservation of the finalised saved copy until a new draft is explicitly saved. Existing user-facing tests and storage/schema checks pass after moving/splitting modules.
- Generated-type, TypeScript and production build checks passed. Formatting was checked during final handover.
- Browser smoke check used an isolated context and assistant-created synthetic test draft. Saving used the unchanged key `cos40005.demo.v1:case-01:0.1:combined`. Reload restored the draft and citation; human-only remained separate; AI-only had no analyst actions and disabled citation controls; switching back restored the combined draft.
- No performance benchmark was run, so no runtime speed or bundle-size improvement is claimed. This is a maintainability and integration-readiness refactor.

Evidence: `evidence/product/Tin/frontend-structure-refactor-2026-10-28/`. Backups and source comparison inputs also remain in the local task workspace.

## Rollback and remaining work

If a regression appears, restore the affected files from the local before-copy, move the two storage files back and rerun the existing checks. Do not reset unrelated work or delete saved browser data. No rollback was required.

Backend integration, API contract approval, participant sessions/events, team review and whole-issue acceptance remain pending. No commits, pushes, deployments, Jira transitions, independent student authorship or personal hours are inferred.
