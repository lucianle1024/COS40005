-- Bootstrap the existing session schema if this is a fresh SQLite file.
-- Matches Sessions._connect(); an existing table and its rows are left unchanged.
CREATE TABLE IF NOT EXISTS investigation_sessions (
    id TEXT PRIMARY KEY, case_id TEXT NOT NULL, case_version TEXT NOT NULL,
    mode TEXT NOT NULL, status TEXT NOT NULL, started_at TEXT NOT NULL,
    completed_at TEXT, findings TEXT
);

-- Add research telemetry without altering the session lifecycle table.
CREATE TABLE IF NOT EXISTS telemetry_events (
    event_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES investigation_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    occurred_at_utc TEXT NOT NULL,
    elapsed_ms INTEGER NOT NULL CHECK (elapsed_ms >= 0),
    ui_target TEXT,
    metadata_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_session
    ON telemetry_events(session_id, elapsed_ms, event_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_telemetry_one_submit
    ON telemetry_events(session_id) WHERE event_type = 'submit';

CREATE TABLE IF NOT EXISTS suggestion_exposures (
    event_id TEXT PRIMARY KEY REFERENCES telemetry_events(event_id) ON DELETE CASCADE,
    session_id TEXT NOT NULL REFERENCES investigation_sessions(id) ON DELETE CASCADE,
    suggestion_id TEXT NOT NULL,
    occurred_at_utc TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_suggestion_exposures_session
    ON suggestion_exposures(session_id, suggestion_id);

CREATE TABLE IF NOT EXISTS suggestion_decisions (
    session_id TEXT NOT NULL REFERENCES investigation_sessions(id) ON DELETE CASCADE,
    suggestion_id TEXT NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('accept', 'modify', 'reject')),
    occurred_at_utc TEXT NOT NULL,
    PRIMARY KEY (session_id, suggestion_id)
);
