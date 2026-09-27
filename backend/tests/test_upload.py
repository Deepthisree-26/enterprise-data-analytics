import io
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Helper to get auth token for Analyst user
def get_token():
    # Ensure a user exists
    signup_data = {
        "username": "upload_analyst",
        "email": "upload_analyst@example.com",
        "password": "password123",
        "role": "Analyst",
    }
    client.post("/api/auth/signup", json=signup_data)
    login_data = {"username": "upload_analyst", "password": "password123"}
    response = client.post("/api/auth/login", json=login_data)
    return response.json()["access_token"]

def test_upload_csv():
    token = get_token()
    csv_content = "order_id,date,region,category,product,units_sold,revenue,profit_margin,customer_role\n" \
                 "ORD_UPLOAD_001,2023-01-01,North,Electronics,Phone,10,5000,0.2,Consumer\n"
    files = {"file": ("test.csv", csv_content, "text/csv")}
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/api/upload", files=files, headers=headers)
    assert response.status_code == 201
    json_resp = response.json()
    assert isinstance(json_resp, list)
    assert len(json_resp) > 0
    assert json_resp[0]["order_id"] == "ORD_UPLOAD_001"
