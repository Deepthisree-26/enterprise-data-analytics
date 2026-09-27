import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine


client = TestClient(app)

def test_signup_and_login():
    signup_data = {
        "username": "testuser_auth",
        "email": "testauth@example.com",
        "password": "password123",
        "role": "Analyst",
    }
    response = client.post("/api/auth/signup", json=signup_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token

    # Login with same credentials
    login_data = {"username": "testuser_auth", "password": "password123"}
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    login_token = response.json()["access_token"]
    assert login_token

def test_protected_route_requires_token():
    # Attempt to access protected upload endpoint without token
    response = client.post("/api/upload", files={})
    assert response.status_code == 401
