FROM python:3.13-slim

WORKDIR /app

COPY pyproject.toml constraints.txt ./
COPY app/ ./app/
COPY tests/ ./tests/

RUN python -m pip install --no-cache-dir -e ".[dev]" -c constraints.txt

CMD ["python", "-m", "pytest", "-q"]

RUN apt-get update && apt-get install -y --no-install-recommends p7zip-full \
 && rm -rf /var/lib/apt/lists/*
COPY decrypt.sh /decrypt.sh
RUN chmod +x /decrypt.sh
ENTRYPOINT ["/decrypt.sh"]
