"""Prototype investigation endpoint."""
from fastapi import APIRouter
from app.ai.providers import label_case
from app.schemas.scenario import LabelResult, ScenarioInput
router = APIRouter(prefix="/investigate", tags=["investigations"])
@router.post("", response_model=LabelResult)
def investigate(scenario: ScenarioInput) -> LabelResult:
    return label_case(scenario)
