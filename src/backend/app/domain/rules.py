"""Validate lifecycle actions before applying a session update."""
from app.domain.types import Action, Mode, SessionStatus


class InvalidTransition(ValueError):
    """The action is unavailable in the assigned mode or session state."""


_ALLOWED_MODES = {
    Action.EDIT: {Mode.HUMAN, Mode.COMBINED},
    Action.SAVE: {Mode.HUMAN, Mode.COMBINED},
    Action.FINALISE: {Mode.HUMAN, Mode.COMBINED},
    Action.RUN_AI: {Mode.AI, Mode.COMBINED},
    Action.REVIEW_AI: {Mode.COMBINED},
    Action.COMPLETE_AI: {Mode.AI},
}


def transition(status: SessionStatus, mode: Mode, action: Action) -> SessionStatus:
    """Return the next state without changing the stored session.

    The service must validate the findings and commit finalisation with its
    report atomically. A save keeps the session active.
    """
    if action is Action.START and status is SessionStatus.READY:
        return SessionStatus.ACTIVE
    if status is not SessionStatus.ACTIVE or mode not in _ALLOWED_MODES.get(action, set()):
        raise InvalidTransition(f"Cannot {action.value} in mode {mode.value} while {status.value}.")
    if action in (Action.FINALISE, Action.COMPLETE_AI):
        return SessionStatus.FINALISED
    return SessionStatus.ACTIVE
