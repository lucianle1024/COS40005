"""Domain rules for an investigation attempt."""
from enum import Enum


class Mode(str, Enum):
    HUMAN = "A"
    AI = "B"
    COMBINED = "C"


class SessionStatus(str, Enum):
    READY = "ready"
    ACTIVE = "active"
    FINALISED = "finalised"


class Action(str, Enum):
    START = "start"
    EDIT = "edit"
    SAVE = "save"
    FINALISE = "finalise"
    RUN_AI = "run_ai"
    REVIEW_AI = "review_ai"
    COMPLETE_AI = "complete_ai"
