# Two-pane forensic workbench

**Date:** 28 October 2026. Tin supplied a specific HTML direction and approved adapting it into the React frontend, retaining existing functional safeguards.

## Delivered

- Compact slate command bar with real case ID/title/version, three demo modes, Case brief and About dialogs. Original synthetic case/advice content and version remain unchanged.
- Approximately 58% desktop evidence pane: four chronological native record buttons, independent Cite controls, search/type/reset controls and a deep read-only, line-numbered log inspector. Log text is rendered through React text nodes; markup is not interpreted as HTML. Switching records resets the reader scroll position.
- Approximately 42% decision pane: AI advice above independent findings in one shared scroller. Save/Finalise actions sit outside that scroller in `FindingsActions`. Human-only retains editable findings; AI-only has fixed read-only output without analyst actions.
- Preserved browser-local persistence, separate mode drafts, unsaved-switch safeguards, advice review/revision separation, explicit transfer, validation/confirmation and finalised locking.
- Adapted mobile into natural page flow. Added compact desktop rules for width >=1024px and height 600–700px, retaining readable raw text without forcing overflowing minimum heights.
- Kept accurate fixed-output, synthetic-data and unavailable-recording disclosures. Did not import the illustrative HTML's timer, counters, confidence questions, answer-leading placeholders, changed incident conclusions, CDN scripts/fonts, in-memory save claims or telemetry logic.
- Added PRODUCT.md, token-bearing DESIGN.md and the supported Impeccable v2 design sidecar as assistant-authored implementation documentation.

## Verification performed

- **45 tests passed across four files**, including case-brief draft preservation/focus and literal raw-markup rendering. Existing mode isolation, save failures and confirmation checks remain. No experimental results or measured analyst benefit are claimed.
- Final generated-type/TypeScript checks, production build and formatting passed. A manual design scan returned `[]`; the short-desktop correction also received a clean automatic style scan.
- At 1366x768, the page fit the viewport with approximately 797/569px panes, a 271px raw-reader viewport and visible pinned actions. At 1024x768, the page fit and the raw reader was 226px high.
- An additional 1200x600 check initially exposed a 63px raw viewport. The reviewer's compact-control correction increased the unfiltered reader to 201px. With an active powershell filter and the longest current record title, all three modes retained 196px and seven complete text lines; the page remained 1200x600, with actions visible through y=574 when applicable.
- Mobile390 had a 390px page width, natural stacking and reachable action buttons after scrolling to the page tail. Actual browser checks confirmed human-only editable findings, AI-only disabled citation controls/no findings actions, combined findings accessibility and pinned actions, record-scroll reset and case-brief Escape focus restoration.
- Final mobile snapshot audit: Accessibility100 and Best Practices100; remaining failures concern robots.txt and llms.txt discovery. Console inspection found no warnings/errors. This is not a manual accessibility certification, performance benchmark or participant study.
- A fresh independent reviewer inspected desktop/mobile captures and source and returned ship at that scope. The subsequent short-desktop fix was separately reviewed and all listed minimums were scored resolved. Other-mode measurements were assistant execution, not independently rerun by that reviewer.

Evidence is under `evidence/product/Tin/frontend-forensic-2026-10-28/`. The source, fixture/schema and user-supplied HTML were not treated as evidence of model performance.

## Remaining work

Team review and SCRUM-51/52 integration acceptance remain pending. Phi/Nhat must agree real backend contracts, study-session/mode enforcement, durable ordered events and timing/scoring before participant trials. No server, provider, contract, dataset, dependency, commit, push, deployment or Jira state changed in this step. No independent student authorship, understanding, approval or hours are inferred.
