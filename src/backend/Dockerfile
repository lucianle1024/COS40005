FROM python:3.13-slim
WORKDIR /app/src/backend
COPY src/backend/pyproject.toml src/backend/constraints.txt ./
RUN pip install --no-cache-dir -e ".[dev]" -c constraints.txt
CMD ["python", "-m", "pytest", "-vv", "tests/test_sessions.py::test_human_session_lifecycle[C]", "tests/test_sessions.py::test_advice_is_scoped_to_the_combined_session_and_its_case_records", "tests/test_lifecycle.py", "-k", "COMBINED"]
