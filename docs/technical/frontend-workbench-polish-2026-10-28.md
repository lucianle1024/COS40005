# Compact analyst workbench layout

**Date:** 28 October 2026. **Instruction:** Tin approved a compact header, wider evidence area, clearer advice/findings grouping and a refined existing light interface, using UI/UX skills.

## Changes

- Joined the three desktop panels into one workbench frame, with approximately 42% evidence, 30% advice and 28% findings. Evidence and findings remain distinct from the subtly tinted advice area.
- Put case title and metadata on a compact row where space permits; placed the case summary across the header and removed the redundant visible Workflow label. The mode group keeps its accessible name and demo behaviour.
- Tightened evidence navigation/utilities and increased raw-record type size. Citation, expanded reading, filtering and record-list controls retain their behaviour.
- Made the advice heading lead each claim, grouped its explanation with source links, and separated review controls with spacing and a rule. Accept and Add to findings remain different actions.
- Separated assessment, reasoning and supporting records through spacing/labels/rules, with a clearly defined pinned action region. Used explicit field classes for the tablet layout instead of positional selectors.
- Preserved the viewport height chain, independent desktop column-body scrolling, narrow/short natural page scrolling, synthetic/fixed-output disclosures and browser-only persistence.
- Corrected an empty-case edge case: collapsed desktop navigation no longer hides the explicit no-evidence message. Added a focused test; total suite is now 43 tests.

## Actual verification

- At 1366 x 768, the workbench starts at approximately y=188 instead of y=246, freeing about 59 vertical pixels. Column widths were approximately 553/395/368px. Document dimensions were 1366 x 768, with no outer vertical/horizontal overflow. Findings actions stayed fixed when column bodies were scrolled and remained within the viewport.
- At 1200 x 600, the joined layout fit the viewport and actions remained visible. Tablet 1024 x 768 retained two upper columns and full-width findings, with assessment and reasoning correctly positioned. Final mobile 390 x 844 retained a 390px page width and natural body scrolling.
- All **43 tests passed across four files** after the actual seven source files were copied and verified. The new empty-case test passes. No claim is made that the initial concurrent focused run demonstrated a failing pre-fix state.
- Final generated-type/TypeScript/production-build checks passed. Formatting passed. Mechanical layout scan returned `[]`.
- Final mobile Lighthouse snapshot: Accessibility 100 and Best Practices 100. Remaining failures are robots.txt and llms.txt discovery checks, not application workflow failures. No performance audit or manual accessibility certification is claimed. Browser console inspection found no warnings/errors.
- Two independent source/layout assessments informed the work. A copy-manifest issue initially left the old styles in place; it was corrected, the self-created empty copy folder removed, and all seven intended source files were checked against the reviewed copies before final verification. Unrelated source/reference files were preserved.

Evidence: `evidence/product/Tin/frontend-workbench-polish-2026-10-28/` contains final test/build logs, layout scan and the accessibility report. Browser screenshots were inspected in-session; no screenshot files are claimed in this evidence folder.

## Limits

This is AI-assisted frontend work for Tin/team review. It establishes neither improved analyst performance nor participant-study validity. No provider/schema, model integration, live timing, telemetry, backend persistence, scoring, dependencies, commits, pushes, deployment or Jira state changed. SCRUM-51/52 integration and team acceptance remain pending.
