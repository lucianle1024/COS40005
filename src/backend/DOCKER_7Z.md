# Docker Setup: Extracting Encrypted Case Evidence (.7z)

Evidence is committed as a password-protected `.7z` archive (AES-256) to avoid Windows Defender false positives on attack strings in the logs. The container extracts it at start-up, so the plaintext JSON only exists inside the container.

## Table of Contents

- [Current Setup](#current-setup)
- [Running Tests](#running-tests)
  - [Windows / macOS / Linux (with Docker permission)](#windows--macos--linux-with-docker-permission)
  - [Linux (if `docker` requires `sudo`)](#linux-if-docker-requires-sudo)
  - [Using Docker Compose directly](#using-docker-compose-directly)
- [Required files in `data/scenarios/<case_id>/`](#required-files-in-datascenarioscase_id)
- [Windows gotcha: line endings](#windows-gotcha-line-endings)
- [Rules](#rules)

## Current Setup

| Piece | Location | Purpose |
|---|---|---|
| `decrypt.sh` | `src/backend/decrypt.sh` | Extracts `*_data.7z` / `*_data.zip` (and verifies `.sha256` if present) at startup |
| `Dockerfile` | `src/backend/Dockerfile` | Installs `p7zip-full` and sets `ENTRYPOINT ["/decrypt.sh"]` |
| `docker-compose.yml` | `src/backend/docker-compose.yml` | Mounts `../../data/scenarios/${CASE_ID:-case_02}:/data/cases:ro` |
| `run_docker_test.py` | `src/backend/run_docker_test.py` | Cross-platform helper to run backend tests in Docker |

## Running Tests

Use [run_docker_test.py](run_docker_test.py) from the repo root (`COS40005/`).

### Windows / macOS / Linux (with Docker permission)

```bash
# Run tests for case_01 (default)
python3 src/backend/run_docker_test.py

# Rebuild image and run tests
python3 src/backend/run_docker_test.py --build

# Run tests for a different case (e.g. case_02)
python3 src/backend/run_docker_test.py --case case_02
```

> On Windows, use `python` instead of `python3` if `python3` isn't aliased.

### Linux (if `docker` requires `sudo`)

Add `--sudo` to any command above:

```bash
python3 src/backend/run_docker_test.py --sudo --build
```

### Using Docker Compose directly

```bash
CASE_ID=case_02 docker compose -f src/backend/docker-compose.yml up --build
```

## Required files in `data/scenarios/<case_id>/`

- `<case_id>_data.7z` (AES-256, password `infected`)
- `<case_id>_evidence.sha256` *(optional)* — if present, `decrypt.sh` runs `sha256sum -c` against the extracted plaintext JSON.

### Making the archive in 7-Zip

1. Right-click the evidence JSON, then **7-Zip**, then **Add to archive...**
2. **Archive format:** `7z`
3. **Encryption:** enter the password. The method is AES-256 for 7z.
4. Optionally tick **Encrypt file names**. Extraction with `-p` still works, and the file name inside the archive is hidden.
5. Name it `<case_id>_data.7z`.

After creating it, extract it into a temp folder to confirm the password works before committing.

### Making the checksum file (PowerShell)

```powershell
"$( (Get-FileHash .\evidence.json -Algorithm SHA256).Hash.ToLower() )  evidence.json" | Set-Content -Encoding ascii case_02_evidence.sha256
```

## Windows gotcha: line endings

If `decrypt.sh` is saved with CRLF endings, the container fails with `exec /decrypt.sh: no such file or directory` or `bad interpreter`. Prevent it by adding a `.gitattributes` file at the repo root:

```
*.sh text eol=lf
```

Or in VS Code, click `CRLF` in the bottom bar and switch to `LF` before saving.

## Rules

- Never commit plaintext evidence JSON. Add it to `.gitignore` and `.dockerignore`.
- `infected` is for evidence only (public OTRF data). Never use it for the truth key.
- The truth key and participant briefing should live in a private repo or a restricted folder and be mounted only into the scoring container, never the API container.
