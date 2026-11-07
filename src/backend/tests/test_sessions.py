from fastapi.testclient import TestClient
import pytest

from app.main import create_app


@pytest.mark.parametrize("mode", ["A", "C"])
def test_human_session_lifecycle(tmp_path, mode):
    db = tmp_path / "sessions.sqlite3"
    with TestClient(create_app(db)) as client:
        assert client.get("/sessions/missing").status_code == 404
        response = client.post("/sessions", json={
            "case_id": "case_01", "case_version": "1.0", "mode": mode,
        })
        assert response.status_code == 201
        session = response.json()
        assert session["status"] == "active" and session["started_at"]
        url = "/sessions/" + session["id"]
        assert client.post(url + "/draft", json={"reasoning": "Partial"}).status_code == 200
        assert client.post(url + "/finalise", json={"reasoning": "Partial"}).status_code == 422
        assert client.post(url + "/finalise", json={
            "reasoning": "Checked evidence", "evidence_ids": ["E99"],
        }).status_code == 422
        assert client.get(url).json()["findings"]["reasoning"] == "Partial"
        findings = {"reasoning": "Firewall rule added", "evidence_ids": ["EVENT-39"]}
        final = client.post(url + "/finalise", json=findings)
        assert final.status_code == 200
        assert final.json()["status"] == "finalised" and final.json()["completed_at"]
        assert client.post(url + "/draft", json=findings).status_code == 409
        assert client.post(url + "/finalise", json=findings).status_code == 409
    with TestClient(create_app(db)) as reopened:
        assert reopened.get(url).json() == final.json()


def test_ai_only_uses_automated_result(tmp_path):
    with TestClient(create_app(tmp_path / "sessions.sqlite3")) as client:
        assert client.post("/sessions", json={
            "case_id": "case_01", "case_version": "unknown", "mode": "B",
        }).status_code == 404
        session = client.post("/sessions", json={
            "case_id": "case_01", "case_version": "1.0", "mode": "B",
        }).json()
        url = "/sessions/" + session["id"]
        assert client.post(url + "/draft", json={}).status_code == 409
        assert client.post(url + "/finalise", json={
            "reasoning": "Firewall rule added", "evidence_ids": ["EVENT-39"],
        }).status_code == 409
        result = client.post(url + "/complete-ai")
        assert result.status_code == 200
        assert result.json()["findings"]["prototype"] == "fixed-rule-v2"
        assert result.json()["status"] == "finalised"
        assert client.post(url + "/complete-ai").status_code == 409


def test_advice_is_scoped_to_the_combined_session_and_its_case_records(tmp_path):
    with TestClient(create_app(tmp_path / "sessions.sqlite3")) as client:
        case = client.get("/sessions/case-01").json()
        records = {record["id"]: record["text"] for record in case["evidence"]}
        for mode in ("A", "B", "C"):
            session = client.post("/sessions", json={
                "case_id": case["id"], "case_version": case["version"], "mode": mode,
            }).json()
            response = client.get(f"/sessions/{session['id']}/advice")
            if mode != "C":
                assert response.status_code == 403
                continue
            assert response.status_code == 200
            claims = {claim["id"]: claim for claim in response.json()}
            assert set(claims) == {"audit-log-clear", "powershell", "firewall", "registry"}
            for claim in claims.values():
                assert 1 <= len(set(claim["evidence_ids"])) == len(claim["evidence_ids"]) <= 3
                assert set(claim["evidence_ids"]) <= records.keys()
            for record_id in claims["firewall"]["evidence_ids"]:
                assert "advfirewall" in records[record_id].lower()
            assert client.get(f"/sessions/{session['id']}").json()["status"] == "active"


def test_reopening_same_attempt_keeps_start_time(tmp_path):
    with TestClient(create_app(tmp_path / "sessions.sqlite3")) as client:
        case = client.get("/sessions/case-01")
        assert case.status_code == 200
        assert len(case.json()["evidence"]) == 2395
        request = {
            "case_id": case.json()["id"], "case_version": case.json()["version"],
            "mode": "A", "attempt_key": "b50472b4-4840-4eaf-aac0-9d4f95a0f158",
        }
        first = client.post("/sessions", json=request)
        second = client.post("/sessions", json=request)
        assert first.status_code == second.status_code == 201
        assert first.json() == second.json()
