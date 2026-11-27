#!/usr/bin/env bash
set -euo pipefail

SRC="${CASES_ZIP_DIR:-/data/cases}"      # read-only mount with zips + .sha256
DST="${CASES_OUT_DIR:-/app/cases}"       # writable, inside the container
PW="${EVIDENCE_PW:-infected}"            # public evidence password

mkdir -p "$DST"
shopt -s nullglob
zips=("$SRC"/*_evidence.zip "$SRC"/*_evidence.7z)
[ ${#zips[@]} -gt 0 ] || { echo "No evidence zips in $SRC" >&2; exit 1; }

for z in "${zips[@]}"; do
  c=$(basename "$z"); c="${c%_evidence.*}"
  mkdir -p "$DST/$c"
  7z x -y -p"$PW" -o"$DST/$c" "$z" >/dev/null
  ( cd "$DST/$c" && sha256sum -c "$SRC/${c}_evidence.sha256" ) \
    || { echo "Checksum FAILED for $c" >&2; exit 1; }
  echo "$c extracted and verified"
done

exec "$@"