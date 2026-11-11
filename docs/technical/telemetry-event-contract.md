# Case 1 Telemetry Event Contract - Working v1.0

Owner: Nguyen Huyen Minh Nhat
Jira: SCRUM-102 (schema basis: SCRUM-49; persistence: SCRUM-103)
Date: 2026-11-10
Status: Team-agreed working baseline using the current Case 1 implementation. Revise together if integration exposes a problem; this document does not imply telemetry is already deployed.

## Case identity and existing implementation

- Use the currently connected OTRF dataset `data/scenarios/case_01/` (VBScript stager and obfuscated PowerShell), `case_id: case_01`, `case_version: 1.0`, and evidence IDs `EVENT-1`, `EVENT-2`, etc. The session API uses these identifiers and loads evidence from the canonical `case_01` path.
- Conditions: A = Human-only; B = AI-only; C = Human + AI. The server assigns the mode at session creation; clients must not override it in telemetry.
- The standalone synthetic phishing fixture (`case-01`, v0.1) is a different demo and must not be mixed with these trials. The new dataset truth file does not itself declare `case_version`; v1.0 is the current session API version, not a verified OTRF dataset version. The earlier `case_01_test1` and `case_01_test2` directories were removed during the dataset consolidation; use the current `case_01` directory only.
- Existing routes: `GET /sessions/case-01`, `POST /sessions`, `GET /sessions/{session_id}`, `POST /sessions/{session_id}/draft`, `POST /sessions/{session_id}/finalise`, `GET /sessions/{session_id}/advice` (C), and `POST /sessions/{session_id}/complete-ai` (B).
- `POST /sessions` returns the server-generated `id` (use this as `session_id`), `started_at` and mode. A repeated `attempt_key` can reopen the same session. The existing SQLite `investigation_sessions` table persists session lifecycle and report findings. **Compatibility update (2026-11-11):** The backend now loads the canonical `case_01` dataset, and CI checks pass. Telemetry ingestion remains future integration work.

## Event envelope v1.0

Every telemetry event has the following fields:

```json
{
  "event_id": "evt-demo-001",
  "session_id": "00000000000000000000000000000001",
  "event_type": "evidence_view",
  "occurred_at_utc": "2026-11-10T08:00:12Z",
  "elapsed_ms": 12000,
  "ui_target": "evidence:EVENT-39",
  "metadata": {"evidence_id": "EVENT-39"}
}
```

| Field | Type / rule |
|---|---|
| `event_id` | Required nonempty unique opaque string (up to 128 characters). Repeated identical ID and payload is an idempotent retry; conflicting replay is rejected. |
| `session_id` | Required nonempty ID (up to 128 characters) returned by the server. Validate existence and active session for client interactions. |
| `event_type` | Required, one of the exact values in the catalog below. |
| `occurred_at_utc` | Required ISO 8601 UTC timestamp with `Z` suffix; for diagnostics and ordering checks. |
| `elapsed_ms` | Required nonnegative integer (not float or Boolean); active investigation time since session start, excluding agreed pauses. Not yet a validated research measure. |
| `ui_target` | Required string or `null` identifying a stable UI target, not visible text. |
| `metadata` | Required JSON object with the fields listed below; no free-text searches, credentials, evidence logs or participant PII. |

Scenario, version, mode and participant pseudonym are resolved from the **server session**, not supplied as trusted event fields. Example session IDs are synthetic, not valid IDs on another machine.

## Event catalog

| Event | Origin | Required `metadata` | Recording rule |
|---|---|---|---|
| `click` | Client A/C | `control_id`: nonempty string | Meaningful controls, not every keystroke |
| `search` | Client A/C | `result_count`: nonnegative integer | Search applied; never store query text |
| `filter` | Client A/C | `filter_id`: string, `result_count`: nonnegative integer | Filter applied or cleared |
| `evidence_view` | Client A/C | `evidence_id`: existing `EVENT-*` ID | Evidence opened, not merely listed |
| `report_edit` | Client A/C | `section_id`: nonempty string | Report section changed; never store its text here |
| `triage_marked` | Client A/C | `classification`: `undetermined`, `benign`, `suspicious` or `malicious` | Triage explicitly recorded |
| `pause` | Client A/C | None | Approved pause begins |
| `resume` | Client A/C | None | Approved pause ends |
| `ai_suggestion_shown` | Client C only | `suggestion_id`: ID from case advice | Suggestion actually displayed, not merely fetched |
| `submit` | Server A/C | `report_id`: nonempty string | Only after successful final report persistence |

- Session creation (`POST /sessions`) is the lifecycle start, not a synthetic client `start` event. The server's `started_at` is authoritative for when the session was opened.
- Current finalisation route is `POST /sessions/{session_id}/finalise`; a separate report ID does **not** exist yet. For the current one-final-report-per-session design, set `submit.metadata.report_id` to the existing `session_id` as a stable report key. Do not invent a separate ID.
- For B, `POST /sessions/{session_id}/complete-ai` saves the automated outcome. Record AI runs separately in SCRUM-103; do not fabricate participant clicks or triage events.
- In C, review decisions (`accept`, `modify`, `reject`) are separate records keyed to session and suggestion ID. Exposure requires a recorded `ai_suggestion_shown`, and clicking Accept alone does not establish that the final report retained a claim.

## Validation, timing and persistence

- Reject missing fields, unknown event types, invalid UTC times, negative/non-integer `elapsed_ms`, invalid category metadata, nonexistent session or evidence reference and condition-incompatible events. Limit identifier and metadata string fields to 128 characters.
- De-duplicate by globally unique `event_id`. Same ID + same content is acknowledged once; same ID + different content is rejected. Never rewrite the original record on replay.
- A must never expose AI suggestions or decisions. B has no participant UI telemetry. C can record advice exposure and review decisions.
- A valid `submit` must be written by the server **only after** its final report has been accepted. When integrated, the report and submit event should share a transaction; failed finalisation must not create a submit event.
- First-triage time = earliest valid `triage_marked.elapsed_ms`; submission duration = accepted `submit.elapsed_ms / 1000`. If either event is absent, report that measurement as missing, not zero.
- Pause/resume behaviour, client clock checks and recovery after refresh are not implemented or validated in the current frontend. Do **not** use elapsed time for participant analysis until those checks pass; the backend `completed_at` alone is not a substitute for active time.
- Use the existing SQLite database file and `investigation_sessions` table. SCRUM-103 adds telemetry tables/storage rather than replacing session storage. Do not expose ground-truth files through the participant app or telemetry endpoint.

## Integration boundary and responsibilities

- **Already implemented:** FastAPI session endpoints and SQLite session persistence; React saves drafts/final reports to those endpoints and displays advice in C.
- **Not implemented on `main`:** `POST /events`, server-created `submit` telemetry, persisted AI suggestion decisions, and frontend event emission. The JSON examples illustrate the proposed contract, **not** successful API calls.
- Tin: emit A/C UI events only when the corresponding action occurs, using the current session ID and stable evidence/advice identifiers.
- Phi: validate and persist event requests, ensure server-side submit is tied to successful finalisation, and reject invalid conditions/replays.
- Nhat: maintain versioned contract, SQLite event storage/migrations (SCRUM-103), tests and research measurement definitions.
- Huy: maintain the existing dataset/reference; changes to the canonical research dataset/version require coordination before any experimental comparison.

## Review and change control

- [x] Checked backend/frontend interfaces and canonical dataset paths; verified compatibility fixes.
- [x] Adopted the current `case_01` dataset and the backend's `case_01` v1.0 session identifier as the working contract baseline, per team direction.
- [x] Specified exact event fields, catalog, validation and synthetic JSON examples.
- [ ] Implement and test `POST /events`, active-session enforcement, capture timing, suggestion decisions and atomic finalisation with Tin/Phi (SCRUM-103/integration).
- [ ] Re-review contract and bump its version if the implementation or experiment protocol changes. Record the agreed revision in Jira.

Sample payloads: `telemetry-event-examples.json`. This contract is an implementation baseline, not proof that end-to-end telemetry or research timing has been validated.
