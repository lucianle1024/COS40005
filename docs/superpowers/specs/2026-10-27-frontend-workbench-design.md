# Frontend-first investigation workbench

Status: Tin authorised this build on 27 October 2026. Implemented as a synthetic frontend demo; team review and backend integration remain pending. See [directory plan](../../technical/frontend-directory-plan.md).

## Intent and approach

Build a usable React frontend while Phi implements the backend. Reuse the existing evidence, AI advice and analyst findings layout. The team chose React; a static-only page would not exercise drafts/review, while building FastAPI here would overlap Phi's work. My proposal is a functional demo with a replaceable data adapter, not an agreed backend design.

## Deliverable

- App under `src/frontend/`, preserving existing files. React, TypeScript, Vite and restrained Tailwind styling compatible with the team's shadcn direction. Compatible dependency versions and component boundaries are builder choices.
- One synthetic phishing case, clearly labelled fixed AI output and backend-disconnected status.
- Evidence list, search/filter, read-only record inspector and supporting-record selection.
- AI advice with source links, visible unresolved references and individual accept/revise/reject controls.
- Analyst classification, reasoning, supporting records, local draft save/reopen and explicit finalisation.
- Honest loading/empty/error/unsaved/saved states, keyboard accessibility, readable long records and narrow-screen layout. Warm neutral surfaces, muted semantic accents, no invented metrics.

## Behaviour

Human-only shows evidence/findings and never requests or displays AI advice. AI-only shows read-only fixed automated output; it does not pretend a model ran. Human plus AI retains original advice separately from reviews, revisions and final findings. Reviewing advice never silently submits a report; copying into findings is a separate explicit draft action.

Demo mode switching is for walkthroughs, not study isolation. Separate saved drafts by case and mode; warn before discarding unsaved changes. Viewing and citing are distinct, with one consistent supporting-record selection mechanism.

Browser saves are labelled local/demo. Failed writes preserve current input and never show success. Finalisation requires confirmation, reasoning and a supporting record; this proposed demo rule does not prove prevention of over-reliance. Finalised findings remain read-only until an explicit new-draft action.

## Integration and limits

One JSON Schema owns the proposed consumer data shape, with generated TypeScript types, validated fixtures and stable record/advice IDs. A demo provider isolates fixtures from components. Phi and Nhat must review the shape before HTTP integration; do not invent agreed endpoints or implement silent real-to-mock fallback.

No backend code, live AI, keys, paid calls, deployment, participant collection, research metrics, commits or pushes. Backend persistence, mode enforcement, model calls, telemetry and answer-key isolation belong to later integration. Render evidence as text and use inert reserved example domains/addresses.

## Checks and handoff

Test search/reset, references, mode restrictions, original-advice preservation, draft isolation, explicit finalisation and storage failures/corruption. Run types/tests/build and check desktop/narrow layout in a browser if available, disclosing gaps.

Provide setup instructions and Phi's handoff. Log actual assistance/checks in Obsidian; do not infer student hours or whole SCRUM-51/52 completion. Exact synthetic wording and minor responsive details remain builder choices.
