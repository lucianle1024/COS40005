FROM python:3.13-slim

WORKDIR /app

COPY pyproject.toml constraints.txt ./
COPY app/ ./app/
COPY tests/ ./tests/

RUN python -m pip install --no-cache-dir -e ".[dev]" -c constraints.txt

CMD ["python", "-m", "pytest", "-q"]
