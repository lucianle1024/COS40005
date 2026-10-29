# COS40005 investigation frontend

React interface for reviewing synthetic incident evidence, fixed AI advice and analyst findings. This is a frontend increment, not a connected SOC system or an experiment result.

## Start locally

Use Node.js 22.12 or newer. Development and checks were run with Node 24.22.1 and npm 11.15.0 on Windows.

From the team repository:

```powershell
cd src/frontend
npm ci --ignore-scripts
npm run dev
```

Open **http://127.0.0.1:5173/**. No API key, backend or environment file is needed. The server binds to this computer only; it is not a public/team sharing URL. A port conflict produces an error rather than silently changing ports.

## What to try

1. Start in **Human + AI**. Choose any of the four chronological record tiles above the inspector. Search for `powershell`, then clear the filter.
2. Click an AI source such as **E03** to inspect the original record. Viewing does not select it as evidence.
3. Accept, revise or reject an individual advice item. Review actions do not write your findings or submit a report.
4. After accepting or revising, **Add to findings** explicitly copies that text and its available source IDs into your draft. Your assessment remains your choice.
5. Write your reasoning and use **Cite / Cited** beside a record or inside its viewer to manage supporting records. Citing does not verify a record. Save the draft or finalise it after confirmation.
6. Try **Human only** and **AI only**. Unsaved mode changes require a decision; saved drafts are separate by case, case version and workflow mode.
7. Use **Expand record** for a larger reading view, or **Case brief** for the scenario summary. The desktop raw-log reader and right-hand decision area scroll independently; findings actions stay pinned below the decision area. Narrow or short viewports use normal page scrolling. Dialogs support Escape and keyboard focus management.

## Three demo modes

The forensic layout gives evidence approximately 58% of desktop width. Advice and findings share the remaining 42%, with findings below advice in combined mode. At desktop heights of 600–700px the record tiles and controls become compact to preserve log-reading space. See [product facts](PRODUCT.md), [design system](DESIGN.md) and the repository's `docs/technical/frontend-forensic-layout-2026-10-28.md` for the implemented direction and checks. Fonts and styles are served locally; the supplied HTML's CDN scripts, timer and in-memory telemetry were not imported.

| Mode       | Available behaviour                                                            |
| ---------- | ------------------------------------------------------------------------------ |
| Human only | Evidence and analyst findings, without displaying AI advice                    |
| AI only    | Read-only fixed automated assessment and source inspection; no analyst editing |
| Human + AI | Evidence, individual advice review and analyst findings                        |

The mode switch is a walkthrough aid. It does not enforce a study protocol or prevent access to bundled fixture data. AI-only is fixed output, not a live model run.

## Drafts and limits

- Drafts use this browser's local storage and this origin. Clearing site data, changing browser/profile or moving to another origin will not carry drafts over.
- Storage failures keep current input visible and report an error. Local save messages never mean a server accepted a report.
- Finalisation requires reasoning, a real supporting record and confirmation. `Undetermined` is allowed; the UI does not force a malicious classification.
- A finalised copy is read-only in the interface. Starting and saving a new draft explicitly replaces the local copy. There is no durable audit/history service or multi-user conflict handling.
- Records are synthetic and indicators inert. Rendered content is text, not executable HTML. No live links, credentials, participant identifiers, scoring keys or research telemetry are included.
- One case is implemented. The other incident types, real model calls, server saves, session controls, scoring and deployment remain future work.

## Checks

```powershell
npm test
npm run typecheck
npm run check:types-generated
npm run format:check
npm run build
npm run preview
```

Preview serves the production build at **http://127.0.0.1:4173/**. Development and preview are different origins, so they have separate local drafts.

Tests cover schema/fixture validation, missing references, search/filter, mode restrictions, advice/revision separation, drafts, blocked/corrupt storage and explicit finalisation. They verify frontend behaviour, not cybersecurity accuracy, backend integration or analyst performance. See the repository's frontend verification note for actual check results.

The repository workflow `.github/workflows/frontend-ci.yml` runs these checks for frontend changes on pushes and pull requests, or manually from GitHub Actions. It uses Node 24.22.1, installs the committed lockfile without lifecycle scripts, and runs tests, formatting and the build. Build includes generated-type and TypeScript checks. A local pass is separate from a successful GitHub Actions run.

## Contract and code ownership

`contracts/workbench.schema.json` owns the demo case shape. Generate types with `npm run generate:types`; do not hand-edit `src/api/generated.ts`. Build checks generated types for drift. `src/api/demo-provider.ts` loads the fixture and rejects unknown case IDs. Shared `src/api/case-validator.ts` validates incoming case data and rejects duplicate evidence/advice IDs while preserving unresolved source references for the UI to flag.

`src/hooks/useInvestigation.ts` coordinates loading, mode drafts, reviews, saving and confirmation flows. `App.tsx` assembles the interface and keeps presentation-only dialogs/focus handling. `src/storage/local-drafts.ts` owns browser persistence; its keys and saved format are unchanged, so existing browser drafts remain compatible. Tests stay beside their modules. No real HTTP client or endpoint is assumed implemented.

Components do not import fixtures directly. Phi can later provide a reviewed adapter at that boundary. Draft/review types in `src/state/investigation.ts` are local UI types, not agreed server payloads.

Tin leads the frontend. Phi owns the backend; Nhat's telemetry requirements and Huy's reviewed case evidence still require integration. See [Phi's handoff](../../docs/technical/frontend-backend-handoff.md) and [directory plan](../../docs/technical/frontend-directory-plan.md).

## Tooling references

Configuration was checked against the official [Vite guide](https://vite.dev/guide/), [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite) and [Vitest guide](https://vitest.dev/guide/). Dependency versions are pinned in `package.json` and resolved in `package-lock.json`. Dialogs use Radix UI; a shadcn component collection has not been generated.
