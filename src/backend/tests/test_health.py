"""Scaffold smoke check: liveness and registered OpenAPI paths."""
from fastapi.testclient import TestClient
from app.main import create_app

def test_health_and_openapi():
    with TestClient(create_app()) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
        schema = client.get("/openapi.json")
        assert schema.status_code == 200
        assert set(schema.json()["paths"]) == {"/health"}
