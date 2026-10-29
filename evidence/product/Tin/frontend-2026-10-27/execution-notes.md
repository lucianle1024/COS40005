# Execution ledger: 2026-10-27-frontend-workbench

Approved: Tin said "ok proceed with the build" on 27 October 2026. Native implementation in the requested clone, no commits or pushes.

Ruling: Work in the explicitly requested Downloads clone on a new local feature branch, without creating a second checkout. This keeps the planned paths usable for Tin and Phi; the cost is no filesystem isolation from concurrent local edits. Preserve existing files and recheck changes.

Ruling: Keep this ledger and test logs rather than deleting them because commits are not authorised. Bash-specific skill helper scripts are replaced with equivalent explicit checks on Windows; the cost is manual progress bookkeeping.

Pre-flight: Task 1 provides generated InvestigationCase types and a demo provider to Task 2. Task 3 owns draft/review types used by Task 2 panels; define these before completing App integration. Task 4 documents these exact boundaries. No competing server contract is introduced.

Task 1: started; baseline has no app, manifests or executable tests. Checking compatible dependencies before configuration and behaviour tests.

Task 1 RED: Vitest ran all 7 contract tests; each failed against the not-implemented provider, including shape/provenance, duplicates, unknown ID, empty and unresolved-source behaviours. Dependencies installed with lifecycle scripts disabled; npm reported 0 vulnerabilities.

Task 1: complete; generated types succeeded, 7/7 tests passed and tsc --noEmit exited 0. No live provider has been tested.

Task 2/3: Ruling: Define and verify draft state/storage before connecting panels, because App needs these shared interfaces. Key browser drafts by case ID, case version and mode to avoid stale evidence selections; the cost is older versions are not automatically migrated. The contract handed to Phi remains a proposal.

Task 3 state RED/GREEN: 7 analyst-control tests passed after implementation; 6 storage tests still failed against storage stubs, then storage implementation followed. Full output: state-green-storage-red.log.

Task 3 storage GREEN: full suite 20/20 and TypeScript check passed. Task 2 UI RED: all 15 interaction tests failed against the placeholder screen before panel implementation; output in ui-red.log. Now implementing the observed missing workflows.

Task 2/3: complete; 35/35 tests, generated-type drift check, TypeScript and production build passed. Desktop 1440 and mobile390 browser layout inspected without horizontal overflow. Actual browser verified human-only and read-only AI-only behaviour, dirty-switch cancellation and local save. Finalisation is covered by interaction tests, not a live backend.

Task 4: clean isolated verification copy of 35 files installed via npm ci --ignore-scripts, 0 reported vulnerabilities, 35/35 tests and production build passed. Formatting check passed in the main clone.

Final review: fresh gpt-6-astra read-only source review found no critical issue; Important missing dialog focus restoration was reproduced in real Chrome (About, Escape -> BODY). Reviewer enum-coercion finding is regraded Important because corrupt-storage rejection is an explicit contract and array status bypasses finalised validation. Both enter the single fix pass.

Final browser audit: Lighthouse mobile found low contrast and record visible-name mismatches. Treat these as Important accessibility defects; initial failed audit is the RED evidence. Fix and repeat the same audit. Marketing/SEO/agent-discovery scores are outside this local frontend demo's purpose.

Final: minor (deferred): add dedicated failed Save-and-switch/finalise and new-draft lifecycle interaction coverage; current unit/storage checks and successful UI paths do not cover every dialog error branch. Reviewer found no demonstrated normal-operation defect there.

Final: fixed dialog focus restoration and malformed enum arrays; targeted regression run failed all 3 new tests before fixes, then full suite passed 38/38. The record-label test additionally exposed missing whitespace in natural accessible names; corrected actual text grouping, not just test expectations. Lighthouse repeat now passes contrast and visible-name audits, accessibility 100; only robots.txt/llms.txt discovery audits remain outside local-demo scope.

Final: Ruling: Keep branch and files uncommitted, as the approved plan explicitly excludes commits/pushes; no integration menu or publishing action is needed. The cost is changes are local until Tin chooses to commit and share them.

Final review declined items: backend/auth, durable persistence/conflicts, research isolation/telemetry and cybersecurity correctness. These remain explicitly deferred integration/study work, not evidence of completion. No second reviewer is dispatched; fixes use red/green regression and full-suite evidence.

Task 4: complete for frontend handover. Final hash-checked clean installation: 38/38 tests, format check and generated-type/TypeScript/Vite build passed. Local preview HTTP 200, 10 doc links resolved. Final Chrome console had no warnings/errors. Vault structural check: 56 notes, 118 internal links, no errors. SCRUM-51/52 locally in-progress with Jira snapshots unchanged. Evidence/handoff and actual AI assistance retained; no commits/pushes.
