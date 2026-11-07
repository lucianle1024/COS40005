"""SQLite storage for the Case 1 lifecycle."""
import json
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path
from uuid import NAMESPACE_URL, UUID, uuid4, uuid5

from app.domain.rules import transition
from app.domain.types import Action, Mode, SessionStatus


class Sessions:
    def __init__(self, path: Path):
        self.path = path

    def _connect(self):
        db = sqlite3.connect(self.path)
        db.row_factory = sqlite3.Row
        db.execute("""CREATE TABLE IF NOT EXISTS investigation_sessions (
            id TEXT PRIMARY KEY, case_id TEXT NOT NULL, case_version TEXT NOT NULL,
            mode TEXT NOT NULL, status TEXT NOT NULL, started_at TEXT NOT NULL,
            completed_at TEXT, findings TEXT
        )""")
        return db

    def open(self, case_id: str, version: str, mode: Mode, attempt_key: UUID | None = None):
        session = {
            "id": (uuid5(NAMESPACE_URL, f"cos40005/{case_id}/{version}/{mode.value}/{attempt_key}") if attempt_key else uuid4()).hex,
            "case_id": case_id,
            "case_version": version,
            "mode": mode.value,
            "status": transition(SessionStatus.READY, mode, Action.START).value,
            "started_at": datetime.now(timezone.utc).isoformat(),
        }
        with closing(self._connect()) as db, db:
            db.execute("""INSERT INTO investigation_sessions
                (id, case_id, case_version, mode, status, started_at)
                VALUES (:id, :case_id, :case_version, :mode, :status, :started_at)
                ON CONFLICT(id) DO NOTHING""", session)
            return self._get(db, session["id"])

    def get(self, session_id: str):
        with closing(self._connect()) as db:
            return self._get(db, session_id)

    def apply(self, session_id: str, action: Action, findings):
        with closing(self._connect()) as db, db:
            db.execute("BEGIN IMMEDIATE")
            session = self._get(db, session_id)
            status = transition(SessionStatus(session["status"]), Mode(session["mode"]), action)
            session.update(
                status=status.value,
                findings=findings,
                completed_at=datetime.now(timezone.utc).isoformat()
                if status is SessionStatus.FINALISED else None,
            )
            db.execute("""UPDATE investigation_sessions
                SET status = ?, findings = ?, completed_at = ? WHERE id = ?""",
                (session["status"], json.dumps(findings), session["completed_at"], session_id))
            return session

    @staticmethod
    def _get(db, session_id):
        row = db.execute("SELECT * FROM investigation_sessions WHERE id = ?", (session_id,)).fetchone()
        if row is None:
            raise KeyError(session_id)
        session = dict(row)
        session["findings"] = json.loads(session["findings"]) if session["findings"] is not None else None
        return session
