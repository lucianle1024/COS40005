"""Validated input and output shapes for the scenario prototype."""
from typing import Literal
from pydantic import BaseModel, Field
class EvidenceRecord(BaseModel):
    id: str = Field(min_length=1)
    type: str = Field(min_length=1)
    text: str = Field(min_length=1)
class ScenarioInput(BaseModel):
    id: str = Field(min_length=1)
    version: str = Field(min_length=1)
    title: str = Field(min_length=1)
    evidence: list[EvidenceRecord] = Field(min_length=1)
Classification = Literal["undetermined", "benign", "suspicious", "malicious"]


class AdviceClaim(BaseModel):
    id: str
    title: str
    classification: Classification
    rationale: str
    evidence_ids: list[str]


class LabelResult(BaseModel):
    case_id: str
    label: Classification
    confidence: float = Field(ge=0, le=1)
    supporting_evidence: list[str]
    rationale: str
    prototype: str
