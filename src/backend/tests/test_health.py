"""Backend tests using the real Case 1 evidence file."""
import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import create_app

SCENARIO_PATH = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "scenarios"
    / "case_01_test1"
    / "case_01_evidence.json"
)

def load_case_one():
    records = []

    with SCENARIO_PATH.open(encoding="utf-8") as evidence_file:
        for index, line in enumerate(evidence_file, start=1):
            if line.strip():
                event = json.loads(line)
                records.append(
                    {
                        "id": f"EVENT-{index}",
                        "type": "windows-event",
                        "text": json.dumps(event),
                    }
                )

    return {
        "id": "case_01",
        "version": "1.0",
        "title": "PowerShell and Firewall Tampering",
        "evidence": records,
    }


def test_health_and_openapi():
    with TestClient(create_app()) as client:
        response = client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

        schema = client.get("/openapi.json")

        assert schema.status_code == 200
        assert {"/health", "/investigate", "/sessions"} <= set(schema.json()["paths"])


def test_case_one_real_evidence_is_labelled_suspicious():
    case_data = load_case_one()

    with TestClient(create_app()) as client:
        response = client.post("/investigate", json=case_data)

    assert response.status_code == 200
    assert response.json()["case_id"] == "case_01"
    assert response.json()["label"] == "suspicious"
    assert response.json()["prototype"] == "fixed-rule-v2"

    print(response.json())
