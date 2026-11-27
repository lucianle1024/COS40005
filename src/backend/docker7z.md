# Docker Setup: Extracting Encrypted Case Evidence (.7z)

Evidence is committed as a password-protected `.7z` archive (AES-256) to avoid Windows Defender false positives on attack strings in the logs. The container extracts and verifies it at start-up, so the plaintext JSON only exists inside the container.

## What you need

| Piece | Needed? | Purpose |
|---|---|---|
| `entrypoint.sh` | Yes | Extracts and checksums evidence when the container starts |
| Dockerfile edits | Yes | Installs `7z` and runs the script |
| `docker-compose.yml` volume | Yes | Mounts the archives read-only |
| `pack_cases.ps1` | Optional | Convenience for making archives; manual 7-Zip works too |

## Steps

### 1. Save `entrypoint.sh` next to your Dockerfile

For example `backend/entrypoint.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

SRC="${CASES_ZIP_DIR:-/data/cases}"      # read-only mount with archives + .sha256
DST="${CASES_OUT_DIR:-/app/cases}"       # writable, inside the container
PW="${EVIDENCE_PW:-infected}"            # public evidence password

mkdir -p "$DST"
shopt -s nullglob
archives=("$SRC"/*_evidence.7z "$SRC"/*_evidence.zip)
[ ${#archives[@]} -gt 0 ] || { echo "No evidence archives in $SRC" >&2; exit 1; }

for a in "${archives[@]}"; do
  c=$(basename "$a"); c="${c%_evidence.*}"
  mkdir -p "$DST/$c"
  7z x -y -p"$PW" -o"$DST/$c" "$a" >/dev/null
  ( cd "$DST/$c" && sha256sum -c "$SRC/${c}_evidence.sha256" ) \
    || { echo "Checksum FAILED for $c" >&2; exit 1; }
  echo "$c extracted and verified"
done

exec "$@"
```

Notes:
- `7z x` opens both `.7z` and `.zip`. The script accepts either, so older zips still work.
- Do not use Info-ZIP `unzip`: it cannot open AES-256 encrypted zips.

### 2. Edit your existing Dockerfile

Add these lines (don't replace the file). Keep your existing `CMD`.

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends p7zip-full \
 && rm -rf /var/lib/apt/lists/*
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
```

If `p7zip-full` isn't found on a newer base image, the package may be named `7zip` with the command `7zz`. Check with `apt-cache search 7zip`.

### 3. Mount the archives in `docker-compose.yml`

```yaml
services:
  api:
    build: ./backend
    environment:
      EVIDENCE_PW: ${EVIDENCE_PW:-infected}
    volumes:
      - ./data/cases:/data/cases:ro     # archives and .sha256 files only
```

### 4. Build and run

```
docker compose up --build
```

## Required files in `data/cases/`

For each case, commit exactly these two files:

- `case_XX_evidence.7z` (AES-256, password `infected`)
- `case_XX_evidence.sha256` (hash of the **plaintext** JSON)

The filename inside the `.sha256` file must match the extracted JSON's name exactly, or `sha256sum -c` will fail.

### Making the archive in 7-Zip

1. Right-click the evidence JSON, then **7-Zip**, then **Add to archive...**
2. **Archive format:** `7z`
3. **Encryption:** enter the password. The method is AES-256 for 7z.
4. Optionally tick **Encrypt file names**. Extraction with `-p` still works, and the file name inside the archive is hidden.
5. Name it `case_XX_evidence.7z`.

After creating it, extract it into a temp folder to confirm the password works before committing.

### Making the checksum file (PowerShell)

```powershell
"$( (Get-FileHash .\evidence.json -Algorithm SHA256).Hash.ToLower() )  evidence.json" | Set-Content -Encoding ascii case_02_evidence.sha256
```

## Optional: packing script changes

If you use `pack_cases.ps1`, change `-tzip` to `-t7z` and the output name from `_evidence.zip` to `_evidence.7z`.

## Windows gotcha: line endings

If `entrypoint.sh` is saved with CRLF endings, the container fails with `exec /entrypoint.sh: no such file or directory` or `bad interpreter`. Prevent it by adding a `.gitattributes` file at the repo root:

```
*.sh text eol=lf
```

Or in VS Code, click `CRLF` in the bottom bar and switch to `LF` before saving.

## Quick check

```
docker compose run --rm api ls /app/cases/case_02
```

You should see the extracted JSON, and the start-up log should print `case_XX extracted and verified` for each case. Any missing archive, failed extraction or checksum mismatch stops the container.

## Rules

- Never commit plaintext evidence JSON. Add it (and `data/cases_src/`) to `.gitignore` and `.dockerignore`.
- `infected` is for evidence only (public OTRF data). Never use it for the truth key.
- The truth key and participant briefing should live in a private repo or a restricted folder and be mounted only into the scoring container, never the API container.