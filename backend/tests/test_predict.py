import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_token(role="Analyst"):
    # Ensure user exists
    signup_data = {
        "username": f"user_{role.lower()}",
        "email": f"{role.lower()}@example.com",
        "password": "password123",
        "role": role,
    }
    client.post("/api/auth/signup", json=signup_data)
    login_data = {"username": signup_data["username"], "password": signup_data["password"]}
    resp = client.post("/api/auth/login", json=login_data)
    return resp.json()["access_token"]

def test_predict_endpoint_requires_token():
    response = client.post("/api/predict", json={})
    assert response.status_code == 401

def test_predict_returns_prediction(monkeypatch):
    token = get_token()
    # Insert a minimal record to allow training
    csv_content = "order_id,date,region,category,product,units_sold,revenue,profit_margin,customer_role\n" \
                 "ORD001,2023-01-01,North,Electronics,Phone,10,5000,0.2,Consumer\n"
    files = {"file": ("test.csv", csv_content, "text/csv")}
    client.post("/api/upload", files=files, headers={"Authorization": f"Bearer {token}"})

    # Mock model training to avoid heavy computation if needed (optional)
    # Here we use the real training on the small dataset
    payload = {
        "order_id": "ORD002",
        "date": "2023-01-02",
        "region": "South",
        "category": "Electronics",
        "product": "Tablet",
        "units_sold": 5,
        "revenue": 2500,
        "profit_margin": 0.15,
        "customer_role": "Consumer"
    }
    resp = client.post("/api/predict", json=payload, headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "predicted_revenue" in data
    assert "r2_score" in data
    assert isinstance(data["predicted_revenue"], float)
    assert isinstance(data["r2_score"], float)
