import pytest

from app.domain.rules import InvalidTransition, transition
from app.domain.types import Action, Mode, SessionStatus


@pytest.mark.parametrize("mode", list(Mode))
def test_start_and_finalisation_lock(mode):
    active = transition(SessionStatus.READY, mode, Action.START)
    assert active is SessionStatus.ACTIVE
    with pytest.raises(InvalidTransition):
        transition(active, mode, Action.START)
    finish = Action.COMPLETE_AI if mode is Mode.AI else Action.FINALISE
    finalised = transition(active, mode, finish)
    assert finalised is SessionStatus.FINALISED
    for action in Action:
        with pytest.raises(InvalidTransition):
            transition(finalised, mode, action)


@pytest.mark.parametrize(
    ("mode", "allowed"),
    [
        (Mode.HUMAN, {Action.EDIT, Action.SAVE, Action.FINALISE}),
        (Mode.AI, {Action.RUN_AI, Action.COMPLETE_AI}),
        (Mode.COMBINED, {Action.EDIT, Action.SAVE, Action.FINALISE, Action.RUN_AI, Action.REVIEW_AI}),
    ],
)
def test_active_actions_depend_on_assigned_mode(mode, allowed):
    for action in Action:
        if action is not Action.START:
            with pytest.raises(InvalidTransition):
                transition(SessionStatus.READY, mode, action)
        if action not in allowed:
            with pytest.raises(InvalidTransition):
                transition(SessionStatus.ACTIVE, mode, action)
        elif action not in (Action.FINALISE, Action.COMPLETE_AI):
            assert transition(SessionStatus.ACTIVE, mode, action) is SessionStatus.ACTIVE
