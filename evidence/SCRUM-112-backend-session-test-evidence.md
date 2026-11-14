# SCRUM-112 Backend Session Test Evidence

**Date:** 13 November 2026  
**Purpose:** Record the backend session and lifecycle test run for Conditions A, B and C.

## Test run

Run from `src/backend`:

```powershell
python -m pytest -vv tests/test_sessions.py tests/test_lifecycle.py tests/test_health.py
```

**Result:** 13 passed, 1 warning, in 0.91 seconds.

**Environment shown:** Python 3.11.9, pytest 9.2.0, AnyIO 4.14.2.

## Coverage

- Human session lifecycle in Conditions A and C.
- Automated completion of an AI-only session in Condition B.
- Advice access limited to the Human + AI condition and linked evidence records.
- Session reopening with the same attempt key preserves the original start time.
- Start, finalisation, and mode-specific actions checked across Conditions A, B and C.
- API health and OpenAPI checks.
- Case 1 real evidence sent to `/investigate` and returned as `suspicious`.

## Warning

The run passed with a deprecation warning from the AnyIO pytest plugin: `_pytest.python.CallSpec2` has been renamed to `CallSpec`. The warning says the compatibility alias is scheduled for removal in pytest 10.

## Evidence scope

This run verifies the backend session, lifecycle, health, and Case 1 assessment checks shown above. It does not cover full UI integration or researcher-side scoring.

**Source:** Terminal test output screenshot provided for SCRUM-112.
