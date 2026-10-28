# Frontend audit fixes, 29 October 2026

Tin authorised fixing the findings from `frontend-audit-2026-10-29.md`.

- Shared case validation now rejects impossible calendar dates and invalid UTC times. It uses native date parsing and an exact ISO round trip after the existing schema check. No dependency or schema change was needed.
- One regression test covers impossible dates, a non-leap-year February29 and24:00 rollover, while confirming a real leap day remains valid. The test failed against the original implementation, then passed after the fix.
- `.github/workflows/frontend-ci.yml` adds one read-only GitHub Actions job for relevant pushes, pull requests and manual runs. Node24.22.1 and action commit hashes are pinned. It installs the committed lockfile without lifecycle scripts and runs tests, formatting and build. Build already checks generated types and TypeScript.
- A fresh Windows export exposed CRLF checkout conversion breaking formatting. Frontend-only `.gitattributes` preserves LF endings. No global Git setting changed.
- The complete frontend, lockfile, relevant implementation documentation and AI-assistance records are included for local Git history on the existing feature branch. Remote publication and a hosted CI run remain separate steps.

## Verification

Original timestamp regression: one failure, four passes. After the fix: **50 tests across six files passed**, with generated types, TypeScript, formatting and production build passing.

A fresh staged-tree export contained no `node_modules`. `npm ci --offline --ignore-scripts --no-audit --no-fund` installed161 packages from the existing npm cache. After the LF checkout correction, its50 tests, formatting and build passed too. This verifies a clean local install on Windows, not a successful Ubuntu/GitHub Actions run.

The original audit probe now reports `accepted: false` for both previously accepted impossible timestamps. Workflow YAML parsing and its event/job structure were checked. Evidence is under `evidence/product/Tin/frontend-audit-fixes-2026-10-29/`.

No interface redesign, saved-draft format change, live AI, server persistence, telemetry, participant results or deployment was introduced. Existing backend integration and whole-issue acceptance remain pending.

Action references were checked against the official [checkout release](https://github.com/actions/checkout/releases/tag/v4.2.2), [setup-node release](https://github.com/actions/setup-node/releases/tag/v4.4.0) and [Node release index](https://nodejs.org/dist/index.json). These references verify the selected pins, not that they are the newest available releases.
