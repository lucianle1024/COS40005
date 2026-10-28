# COS40005 HN_Group5 frontend demo

Assistant-authored implementation documentation, based on the frontend source and the supplied project context. This file records product facts; it is not client approval or evidence of user research.

The research project compares human-only, AI-only, and human plus AI SOC investigation. The current frontend demonstrates these modes with one synthetic phishing case, “A suspicious invoice” (`case-01`). Its fixture version is `0.1`; read the fixture's `version` field when displaying it.

- Human-only mode supports independent investigation and findings without the advice panel.
- AI-only mode displays fixed automated output and supports inspecting evidence; analyst edits are disabled.
- Human plus AI mode supports inspecting evidence, reviewing fixed advice, and recording independent findings.
- Four chronological synthetic records cover message headers, proxy activity, an endpoint event, and DNS. Indicators are inert text.
- Opening a record and citing it are separate actions. Neither establishes verification. Accepting advice records a response; adding advice copies text and available source IDs without changing the analyst's assessment.
- Drafts save in this browser only, separately for each mode. Mode changes with unsaved edits offer keep working, discard and switch, or save and switch. Finalisation validates findings and asks for confirmation before saving a read-only local copy. A new draft has its own confirmation.
- There is no live model, backend connection, participant telemetry, or report submission. Fixed advice is explicitly identified as demonstration text. Phi/Nhat integration remains pending.

The implementation uses React, compiled Tailwind/CSS, system fonts, native buttons and form controls, inline SVG icons, and Radix dialogs. Claims, reference text, and raw records are rendered as React text.

Evidence: `src/fixtures/phishing-case.json`, `src/App.tsx`, `src/hooks/useInvestigation.ts`, `src/api/case-validator.ts`, `src/storage/local-drafts.ts`, `src/state/investigation.ts`, and the components under `src/components/` in the frontend source.
