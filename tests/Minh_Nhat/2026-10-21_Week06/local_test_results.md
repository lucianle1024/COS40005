# Local unit test evidence

Author: Nguyen Huyen Minh Nhat
Captured: 2026-10-21

From the root of the local evidence package (`cos40005-evidence`):

```powershell
python -m unittest discover -s tests -v
```

Result observed in the supplied PowerShell screenshot:

```text
Ran 7 tests in 0.029s

OK
```

- Unit test output supports seven passing checks against the local evidence package.
- Cases cover scorer and SQLite constraint behavior. It does not establish full React/FastAPI integration.
- The source file `tests/test_evidence.py` was run on the user's local computer but was not uploaded here. To version the exact tested source, add it from the original evidence package rather than reconstructing it from a screenshot.

Evidence: `unit_tests_7_passed.png`
