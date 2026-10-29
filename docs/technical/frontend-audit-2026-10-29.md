# Frontend audit, 29 October 2026

Assistant-performed review requested by Tin. Skills applied: Ponytail (full), ECC security review, ECC production audit and verification before completion. Scope: the current local React frontend on `feat/tin-frontend-workbench`, based on commit `b4fa52b`. Application source and dependencies were not changed.

**Readiness:** suitable for a local team walkthrough with the findings below. It is not ready for participant trials. The latter is an existing scope boundary: live case/API integration, server persistence, session condition enforcement, timing, telemetry and scoring are still pending. A passing frontend check does not establish cybersecurity accuracy or experimental validity.

## Findings, in priority order

1. **High delivery risk: this frontend is not in Git yet.** `git status --short --branch` lists `src/frontend/` and its related documentation/evidence as untracked; `git ls-files src/frontend` returns no files. Someone cloning the current committed project will not receive this implementation or its lockfile. Minimum next step: review the diff and select the intended frontend, documentation and lockfile for a commit, then share through the team's branch/PR process. No commit or push was performed by this audit.

2. **Medium correctness risk: impossible evidence timestamps pass validation.** `contracts/workbench.schema.json:47` checks timestamp shape only; `src/api/case-validator.ts:7` adds duplicate-ID checks but no calendar validation. Reproduced with `2026-99-99T99:99:99Z` and `2026-02-31T09:12:04Z`. Both pass `validateCase`; the first parses as `NaN`, while JavaScript normalises the second to 3 March. `src/components/EvidencePanel.tsx:33` sorts using that parsed value, so malformed records can receive an incorrect chronological position or display an impossible time. The current four-record fixture has valid dates. Minimum fix: a native date parse plus exact UTC round-trip check in the shared validator, with one test covering both malformed values. No new date library is needed.

3. **Medium maintenance gap: checks are manual.** `.github/` contains a pull-request template but no workflow. The existing package scripts already cover the useful gates. Minimum next step: one CI job running a pinned Node version, `npm ci --ignore-scripts`, `npm test`, `npm run format:check` and `npm run build` from `src/frontend`. Build already checks generated types and TypeScript, so separate duplicate CI steps are unnecessary. This is a proposed next change, not an existing CI result.

## Ponytail assessment

Keep the present components, one coordination hook, pure state functions, shared validator and browser-storage module. Their responsibilities are clear and the recent extraction has functional coverage. Keep the four-record search straightforward. No measured need justifies Redux, a generic repository layer, factories, a speculative HTTP client, another validation library or performance caching. Revisit indexing or precompiled validation only when realistic cases and measurements show a problem.

## Evidence checked

- Fresh test run: **49/49 tests passed**, six files. Includes mode isolation, literal rendering of hostile-looking raw markup, invalid/corrupt/blocked storage, failed-save recovery, advice/findings separation and explicit finalisation.
- Fresh generated-type check, TypeScript check, production build and formatting check passed. Output: JS 414.80 kB / 127.83 kB gzip; CSS 29.43 kB / 6.84 kB gzip. These are sizes, not a performance benchmark.
- Desktop Lighthouse snapshot: accessibility **100**, best practices **100**. The only failed checks were `robots.txt` and `llms.txt`; neither is needed for this local analyst demo. This is an automated snapshot, not a full accessibility certification or a performance audit.
- Browser check at 1200 x 600: document fits the viewport, raw inspector height 201 px, findings actions end at y=574. At 390 x 844: no horizontal overflow and findings actions are reachable after scrolling.
- No browser warning/error messages in the inspected session. Observed resources were same-origin. Raw records, advice and revisions are rendered through React text; no HTML-execution sink was found in reviewed application source.
- Local pattern scan: no matches for the four checked credential/private-key patterns across 31 current frontend source, script and contract files. This is not an exhaustive secret scan or a history audit.
- Lockfile version 3: 226 installed-package entries, all with integrity values and npm HTTPS registry URLs. This checks lockfile structure, not package trust or current CVEs.

## Limits and next step

No registry vulnerability scan, remote CI run, clean-checkout install, backend audit, participant trial or production deployment was performed. A browser reconnect prevented the additional mobile Lighthouse run; only the successful desktop audit and mobile layout check are reported. There are no new critical security findings from this bounded review, which is not a claim that the application is vulnerability-free.

Fix timestamp validation first, then add the single CI job and prepare the reviewed commit. Keep the demo restrictions explicit until the backend and study controls are integrated. Do not mark SCRUM-51 or SCRUM-52 accepted solely on this audit.

Reproduction and raw checks: `evidence/product/Tin/frontend-audit-2026-10-29/`. Run the local probe with `node local-audit.mjs <absolute frontend directory> [output.json]` using the installed frontend dependencies. It reads source/lock metadata, loads the validator through Vite and may refresh local Vite caches; it does not change application source or contact an audit service.

## Follow-up, 29 October 2026

Timestamp validation has been fixed and a CI workflow added. A clean local export/install passed after adding the frontend LF checkout rule. See [the fix verification](frontend-audit-fixes-2026-10-29.md). The original findings above are retained as the audit-time record; remote publication and hosted CI verification remain pending.
