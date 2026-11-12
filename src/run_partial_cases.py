import json
import urllib.request
from pathlib import Path

CASES = ["case_01"]
NUMBER_OF_LINES = 500

for case_name in CASES:
    REPO_ROOT = Path(__file__).resolve().parent.parent
    path = REPO_ROOT / "data" / "scenarios" / case_name / "case_01_evidence.json"

    with path.open(encoding="utf-8") as file:
        evidence = [
            {
                "id": f"{case_name}-EVENT-{index}",
                "type": "windows-event",
                "text": line.strip(),
            }
            for index, line in enumerate(file, start=1)
            if line.strip()
        ][:NUMBER_OF_LINES]

    payload = {
        "id": case_name,
        "version": "1.0",
        "title": case_name,
        "evidence": evidence,
    }

    request = urllib.request.Request(
        "http://127.0.0.1:8000/investigate",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(request) as response:
        print(f"\n{case_name} - {len(evidence)} events")
        print(response.read().decode())
