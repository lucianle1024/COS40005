from fastapi.testclient import TestClient

from app.main import create_app


def test_assessment_explains_only_matched_signals(tmp_path):
    with TestClient(create_app(tmp_path / "sessions.sqlite3")) as client:
        response = client.post("/investigate", json={
            "id": "signals", "version": "1", "title": "Rule evidence",
            "evidence": [
                {"id": "audit", "type": "event", "text": '{"EventID":1102}'},
                {"id": "registry", "type": "event", "text": r"Accessed HKLM\Winlogon"},
                {"id": "netsh", "type": "event", "text": "netsh.exe"},
                {"id": "firewall", "type": "event", "text": "advfirewall"},
                {"id": "unrelated", "type": "event", "text": '{"EventID":5156,"pid":1102}'},
            ],
        })
    assert response.status_code == 200
    result = response.json()
    assert result["label"] == "suspicious"
    assert result["supporting_evidence"] == ["audit", "registry"]
    assert "(audit)" in result["rationale"] and "(registry)" in result["rationale"]
    assert "PowerShell" not in result["rationale"] and "firewall" not in result["rationale"]
