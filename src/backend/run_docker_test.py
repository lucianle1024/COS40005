#!/usr/bin/env python3
"""Run backend tests for a given case inside Docker Compose."""

import argparse
import os
import subprocess
import sys
from pathlib import Path

COMPOSE_FILE = Path(__file__).resolve().parent / "docker-compose.yml"


def main() -> int:
    parser = argparse.ArgumentParser(description="Run backend Docker tests for a case.")
    parser.add_argument("--case", default="case_02", help="Case ID to mount (default: case_02)")
    parser.add_argument("--build", action="store_true", help="Rebuild the image before running")
    parser.add_argument("--sudo", action="store_true", help="Prefix docker command with sudo")
    args = parser.parse_args()

    cmd = ["sudo"] if args.sudo else []
    cmd += [
        "docker",
        "compose",
        "-f",
        str(COMPOSE_FILE),
        "run",
        "--rm",
    ]
    if args.build:
        cmd.append("--build")
    cmd += [
        "api",
        "python",
        "-m",
        "pytest",
        "-q",
    ]

    env = os.environ.copy()
    env["CASE_ID"] = args.case
    return subprocess.call(cmd, env=env)


if __name__ == "__main__":
    sys.exit(main())
