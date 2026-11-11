"""Open Case 1 sessions and persist draft or final findings."""
from pathlib import Path
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.ai.providers import case_advice, label_case
from app.db.repositories import Sessions
from app.domain.rules import InvalidTransition
from app.domain.types import Action, Mode
from app.schemas.scenario import AdviceClaim, ScenarioInput

CASE_ID = "case_01"
CASE_VERSION = "1.0"
CASE_PATH = Path(__file__).resolve().parents[4] / "data/scenarios/case_01/case_01_evidence.json"


class OpenSession(BaseModel):
    case_id: str
    case_version: str
    mode: Mode
    attempt_key: UUID | None = None


class Findings(BaseModel):
    classification: Literal["undetermined", "benign", "suspicious", "malicious"] = "undetermined"
    reasoning: str = ""
    evidence_ids: list[str] = Field(default_factory=list)


def create_router(database_path: Path) -> APIRouter:
    router = APIRouter(prefix="/sessions", tags=["sessions"])
    store = Sessions(database_path)

    def load_case() -> ScenarioInput:
        return ScenarioInput(
            id=CASE_ID, version=CASE_VERSION, title="Endpoint Script Execution Alert",
            evidence=[
                {"id": f"EVENT-{index}", "type": "windows-event", "text": line}
                for index, line in enumerate(CASE_PATH.read_text(encoding="utf-8-sig").splitlines(), 1)
                if line.strip()
            ],
        )

    @router.get("/case-01")
    def get_case():
        return load_case()

    @router.post("", status_code=201)
    def open_case(request: OpenSession):
        if (request.case_id, request.case_version) != (CASE_ID, CASE_VERSION):
            raise HTTPException(404, "Case version not found.")
        return store.open(request.case_id, request.case_version, request.mode, request.attempt_key)

    @router.get("/{session_id}")
    def get_session(session_id: str):
        try:
            return store.get(session_id)
        except KeyError:
            raise HTTPException(404, "Session not found.") from None

    def apply(session_id: str, action: Action, findings: dict):
        try:
            return store.apply(session_id, action, findings)
        except KeyError:
            raise HTTPException(404, "Session not found.") from None
        except InvalidTransition as error:
            raise HTTPException(409, str(error)) from error

    def save_findings(session_id: str, findings: Findings, action: Action):
        valid_ids = {record.id for record in load_case().evidence}
        if set(findings.evidence_ids) - valid_ids:
            raise HTTPException(422, "A citation does not exist in this case version.")
        if action is Action.FINALISE and (not findings.reasoning.strip() or not findings.evidence_ids):
            raise HTTPException(422, "Final findings require reasoning and at least one citation.")
        return apply(session_id, action, findings.model_dump())

    @router.post("/{session_id}/draft")
    def save_draft(session_id: str, findings: Findings):
        return save_findings(session_id, findings, Action.SAVE)

    @router.post("/{session_id}/finalise")
    def finalise(session_id: str, findings: Findings):
        return save_findings(session_id, findings, Action.FINALISE)

    @router.get("/{session_id}/advice", response_model=list[AdviceClaim])
    def get_advice(session_id: str):
        session = get_session(session_id)
        if session["mode"] != Mode.COMBINED.value:
            raise HTTPException(403, "Advice is only available in Human + AI sessions.")
        return case_advice(load_case())

    @router.post("/{session_id}/complete-ai")
    def complete_ai(session_id: str):
        session = get_session(session_id)
        if session["mode"] != Mode.AI.value or session["status"] != "active":
            raise HTTPException(409, "Only active AI-only sessions can complete automatically.")
        return apply(session_id, Action.COMPLETE_AI, label_case(load_case()).model_dump())

    return router
