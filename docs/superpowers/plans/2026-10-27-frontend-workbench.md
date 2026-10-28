# Frontend Workbench Implementation Plan

**Status:** Tin authorised the build on 27 October 2026. The frontend demo is implemented; backend integration and team acceptance remain pending. See [verification](../../technical/frontend-verification-2026-10-27.md).

> For agentic workers: use `superpowers:executing-plans` for Native execution after approval, or `superpowers:subagent-driven-development` if selected. No commits or pushes.

**Goal:** Build the React frontend while Phi develops the backend.

**Architecture:** Three panels consume validated fixtures through a demo provider. Reviews and browser drafts stay separate from original evidence/advice. HTTP integration awaits Phi/Nhat's contract review.

**Tech Stack:** React, TypeScript, Vite, Tailwind, JSON Schema, Vitest, React Testing Library.

**Spec:** `../specs/2026-10-27-frontend-workbench-design.md`

**Directory plan:** [Folder structure and ownership](../../technical/frontend-directory-plan.md). All app-relative paths below are inside `src/frontend/` unless a repository-relative path is written in full.

## Global Constraints

- Frontend under `src/frontend/`; preserve existing files.
- No backend, live AI, keys, paid calls, deployment, participant collection, commits or pushes.
- Human-only hides AI; AI-only is read-only fixed output; combined mode preserves original advice and explicit analyst control.
- Label fixtures and browser persistence as demo functionality.
- One schema owns fixture types; the provider contract is a proposal pending backend review.

## Review Focus

1. Distinguish empty evidence from failed loading.
2. Show missing source IDs instead of linking to the wrong record.
3. Separate mode drafts and protect unsaved changes.
4. Preserve input and show failure for blocked/full/corrupt storage.
5. Preserve original advice and never silently finalise findings.

## Task 1: Demo boundary and test harness

**Files:** `src/frontend/package.json`, lockfile/configs, `src/frontend/contracts/workbench.schema.json`, `src/frontend/scripts/generate-types.mjs`, `src/frontend/src/api/generated.ts`, `src/frontend/src/api/demo-provider.ts`, `src/frontend/src/api/demo-provider.test.ts`, `src/frontend/src/test/setup.ts`.

**Interfaces:** `loadDemoCase(caseId: string): Promise<InvestigationCase>`. Generate `InvestigationCase` from the schema; include stable IDs and demo provenance.

- [x] Check repo instructions and compatible runtimes, then scaffold after approval.
- [x] Write and observe failing tests for fixture validation, unique IDs, demo provenance, empty records and rejected loading.
- [x] Define schema, generate types, validate fixtures and implement provider; require tests/type checking to pass.

## Task 2: Workspace and modes

**Files:** `src/frontend/src/App.tsx`, `components/EvidencePanel.tsx`, `components/AdvicePanel.tsx`, `components/ModeSelector.tsx`, `styles.css`, `App.test.tsx`.

**Interfaces:** `WorkflowMode = 'human' | 'ai' | 'combined'`. Evidence panel takes records, `selectedEvidenceIds` and `onSelectionChange(ids: string[])`. Advice panel emits review actions by stable advice ID, without mutating original inputs.

- [x] Write failing user-behaviour tests for search/reset, empty/failed load distinction, viewing versus citation selection and missing sources.
- [x] Write failing tests for hidden advice in human-only and no analyst editing in AI-only.
- [x] Implement labelled responsive panels, source navigation, keyboard controls and recovery actions using Task 1's provider.
- [x] Run tests and inspect desktop/narrow layout in a browser if available.

## Task 3: Findings and local drafts

**Files:** `components/FindingsPanel.tsx`, `state/investigation.ts`, `state/investigation.test.ts`, `api/local-drafts.ts`, `api/local-drafts.test.ts`, all under `src/frontend/src/`.

**Interfaces:** `ReviewDecision = 'accept' | 'revise' | 'reject'`. `InvestigationDraft` contains classification, reasoning, evidence IDs and reviews/revisions. `saveDraft(caseId, mode, draft)` / `loadDraft(caseId, mode)` return explicit success/error outcomes. `finaliseDraft(draft)` validates and creates a read-only snapshot.

- [x] Write failing tests for original-advice preservation, separate explicit draft transfer and no automatic submission.
- [x] Write failing tests for save/reopen, case/mode isolation, dirty-switch cancellation and storage corruption/write failures.
- [x] Implement draft state/storage and honest feedback, preserving input after failures.
- [ ] Add dedicated interaction coverage for the implemented new-draft cancel/create/reload lifecycle. Finalisation and its cancelled/confirmed paths are implemented and tested; this extra coverage is a deferred minor.
- [x] Run all tests, type checking and production build.

## Task 4: Handoff and verification

**Files:** `src/frontend/README.md`, `docs/technical/frontend-backend-handoff.md`, `ai-usage/2026-10-27-frontend.md`, scoped ignore entries and affected Obsidian notes.

**Interfaces:** Handoff points to Task 1's schema; actual provider/persistence/mode enforcement/telemetry remain future integration.

- [x] Document exact commands and limitations; repeat dependency installation where feasible, tests, types and build.
- [x] Record browser checks or gaps. Inspect changes for unrelated files, secrets and unsupported claims.
- [x] Log actual assistance and partial progress; do not update Jira or invent student effort.

## Review and execution

Tin authorised Native execution in this chat by saying "ok proceed with the build" on 27 October 2026. Implementation and verification are recorded in the linked verification note. No commits, pushes or publishing are authorised. User/team review and Phi's backend integration remain next steps.
