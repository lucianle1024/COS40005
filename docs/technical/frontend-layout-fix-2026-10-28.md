# Frontend viewport and workflow corrections

**Date:** 28 October 2026. **Scope:** Tin approved corrections after the assistant assessed Gemini's review against the actual frontend. This is a frontend demo increment, not a participant study or backend release.

## Delivered

- Wide desktop shell uses the available dynamic viewport height. Headings and findings actions sit outside independently scrolling column bodies. Removed the 690px panel minimum that forced the page to scroll. Viewports narrower than 1200px or shorter than 600px retain natural page scrolling.
- Raw evidence has no separate constrained scrollbar. The desktop record list starts collapsed; Show record list reveals it, and searching/filtering reveals results automatically. Expanded inspection remains a focus-managed modal with a visible Expand record button.
- Shared Cite/Cited controls in list and viewer explicitly select/remove supporting records. They remain disabled in AI-only mode and after finalisation. Opening, citing and verifying are distinct; the app does not assert verification.
- Save state is beside Draft/Finalised in Your findings. Accept/revise feedback explains that review alone does not transfer advice. The separate Add to findings action explicitly copies text and available source IDs and displays confirmation. It does not set the analyst's assessment.
- The connection label now accurately says Demo: activity recording unavailable. Fixed-response and synthetic-data disclosures remain visible.
- Clear filters and unresolved references already existed and are retained. Added an explicit Clear search button. No dependencies, case contracts, scoring rules, model calls or telemetry were added.

## Verification performed by the assistant

- Reproduced the original defect at 1366 x 768: document height 1031px; findings actions began at approximately y=873px, below the viewport.
- Corrected layout at 1366 x 768: document height 768px; findings actions remained at approximately y=628px when all column bodies were scrolled. Raw text height and scroll height both 258px, with visible overflow rather than a nested vertical scroller.
- At 1280 x 600, document height was 600px and findings actions ended at approximately y=544px. At 1024 x 768, layout used natural page flow without horizontal overflow. At mobile 390 x 844, page width was 390px and column bodies used natural flow; citation controls were 44px tall.
- Browser checks covered expanded evidence, Escape restoring focus, Accept feedback, explicit transfer, local save, human-only editable findings and AI-only disabled citation controls/read-only output.
- Final automated suite: **42 tests passed across 4 files**. The earlier regression run against the old UI had 8 expected failures, including all three newly added interaction checks. A fourth test subsequently covers desktop initial compact-list behaviour.
- Final generated-type check, TypeScript check and production build passed. Prettier formatting completed; format check is part of final handover verification.
- Final desktop snapshot audit: Accessibility 100, Best Practices 100. The initial audit identified a visible-label/accessibility-name mismatch; Expand and Cited names were corrected. Remaining audit failures are robots.txt and llms.txt discovery checks, outside this local app increment. This is not a manual accessibility certification or a performance benchmark.
- Desktop console inspection found no warnings/errors. A browser automation helper initially selected a mode by exact text and failed because the buttons also include A/B/C labels; the subsequent checks used the observed controls and passed. This helper error was not an application defect.

Evidence: `evidence/product/Tin/frontend-layout-fix-2026-10-28/`. Earlier verification notes remain historical records; this note supersedes the earlier desktop-height behaviour.

## Still pending

Phi/Nhat integration must provide enforced study sessions, agreed start/reveal timing, ordered durable interaction events, genuine recording-failure feedback, server persistence and scoring isolation. Confidence questions, source-opened cues and disclosure wording for participants remain protocol decisions. Current fixed output does not measure live-model performance. No commits, pushes, deployments, Jira transitions, student hours or whole-issue acceptance are claimed.
