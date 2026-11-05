# Case 1 Telemetry Event Contract - Draft v0.1

Owner: Nguyen Huyen Minh Nhat
Jira: SCRUM-102
Date: 2026-11-05
Status: Draft for review by Tin, Phi and Huy. Not an approved API contract.

## Purpose and scope

I am defining the event records needed to measure the human-only (A) and human + AI (C) investigations. This document extends the 10-table SQLite design from SCRUM-49. Tin owns event emission from the React workbench (SCRUM-100). Phi owns routing, authorization and API integration. My part covers event definitions, measurement requirements, persistence validation and reproducibility.

The present frontend uses `case-01` version `0.1` (synthetic invoice phishing); the new backend dataset uses `case_01` version `1.0` (PowerShell/firewall activity). These are different cases, not interchangeable IDs. We need Huy and Tin to approve one canonical Case 1 and its version before integrated testing.

## Proposed event envelope

The server should assign and validate the investigation session and condition. For a client event, the proposed record is:

```json
{
  "event_id": "evt-demo-001",
  "session_id": "session-demo-001",
  "event_type": "evidence_view",
  "occurred_at_utc": "2026-11-05T08:00:12Z",
  "elapsed_ms": 12000,
  "ui_target": "evidence:E02",
  "metadata": {"evidence_id": "E02"}
}
```

- `event_id`: Unique opaque event identifier. Replays with the same ID must not create a second event.
- `session_id`: Server-issued identifier for one trial. Resolve condition, participant pseudonym, scenario ID and version from this session, not from untrusted event metadata.
- `event_type`: One of the names in the catalog below.
- `occurred_at_utc`: UTC timestamp in ISO 8601 format with a `Z` suffix. Useful for diagnostics, not the sole duration source.
- `elapsed_ms`: Nonnegative elapsed active investigation time since the session began, excluding agreed pauses. The frontend timer is provisional until server-side validation is agreed.
- `ui_target`: Stable target name, not the visible element text.
- `metadata`: Small, type-specific fields only. Do not store raw logs, free-text searches, credentials or personal data here.

## Event catalog

| Event | Required metadata | When recorded |
|---|---|---|
| `click` | `control_id` | Meaningful navigation or controls, not every keystroke |
| `search` | `result_count` | A search is applied; do not log raw search text |
| `filter` | `filter_id`, `result_count` | A filter is applied or cleared |
| `evidence_view` | `evidence_id` | A source record is opened, not when it is merely listed |
| `report_edit` | `section_id` | A report section is changed; no report text in event metadata |
| `triage_marked` | `classification` | Analyst records first triage classification |
| `pause` | none | Approved pause starts |
| `resume` | none | Approved pause ends |
| `ai_suggestion_shown` | `suggestion_id` | Suggestion is actually displayed to the participant, not merely fetched |
| `submit` | `report_id` | Backend has accepted and persisted final report |

Review decisions are stored in `suggestion_decisions` with `session_id`, `suggestion_id`, `decision` (accept/modify/reject) and a timestamp. Revised text belongs in its approved review record, not in the generic telemetry event. Exposure is stored in `suggestion_exposures` only after `ai_suggestion_shown` is persisted. Opening a record is distinct from citing it in the final report.

## Validation and experiment rules

- A - Human-only: No AI suggestions, exposures or review decisions.
- B - AI-only: No participant interactions. Record automated model runs and their outputs in the AI tables, not fabricated UI events.
- C - Human + AI: Record real suggestion exposure and decisions separately. An Accept click does not prove the final report retained a false claim.
- Check the session, event type, referenced evidence/suggestion, clock order and condition before committing an event.
- Deduplicate by `event_id`; acknowledge only persisted events. Retried requests must be idempotent.
- `submit` is written after successful final-report persistence. A frontend click without server acknowledgement is not a successful submission.
- Do not expose ground truth, participant identity, confidential log content or provider keys to the browser.
- Use stable event names and case versions. Changes after piloting require a contract version bump.

## Timing rules to confirm

- The trial starts when the server records a valid session start, not when the page first loads.
- First triage time is the earliest valid `triage_marked.elapsed_ms`.
- Submission duration is the accepted `submit.elapsed_ms`. Define pause/resume and reload recovery with Tin and Phi before using it as an experimental metric.
- If a valid final submit event does not exist, duration is missing, not zero.

## Proposed API boundary (not implemented)

- `POST /sessions`: Server assigns `session_id`, condition, scenario/version and start time.
- `POST /events`: Validate, persist and acknowledge an event. Replay of the same `event_id` is idempotent.
- `POST /reports/{session_id}/finalise`: Persist final report, then create an accepted `submit` record in the same transaction.
- Response errors must distinguish invalid data, unauthorized condition and temporary storage failures. These routes are proposals for Phi to review, not existing FastAPI endpoints.

## Review checklist

- [ ] Huy confirms Case 1 canonical ID, version, evidence IDs and ground truth custody.
- [ ] Tin confirms which UI actions genuinely emit each event and what is measurable.
- [ ] Phi confirms session ownership, API shapes, idempotency and server timing checks.
- [ ] Nhat checks SQLite mapping against the original SCRUM-49 SQL source and updates this contract.
- [ ] Team approves v1.0 before SCRUM-103 persistence integration or participant piloting.

Synthetic payload examples: `telemetry-event-examples.json`.
