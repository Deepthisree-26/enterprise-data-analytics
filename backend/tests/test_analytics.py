import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def get_auth_token():
    signup_data = {
        "username": "analytics_user",
        "email": "analytics@example.com",
        "password": "password123",
        "role": "Analyst",
    }
    client.post("/api/auth/signup", json=signup_data)
    login_data = {"username": "analytics_user", "password": "password123"}
    resp = client.post("/api/auth/login", json=login_data)
    return resp.json()["access_token"]

def test_kpis_and_data_records():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Upload test data
    csv_content = "order_id,date,region,category,product,units_sold,revenue,profit_margin,customer_role\n" \
                 "ORD_K_001,2023-01-01,North,Electronics,Phone,10,5000,0.2,Consumer\n"
    files = {"file": ("test.csv", csv_content, "text/csv")}
    upload_resp = client.post("/api/upload", files=files, headers=headers)
    assert upload_resp.status_code == 201

    # Test KPIs endpoint
    kpi_resp = client.get("/api/kpis", headers=headers)
    assert kpi_resp.status_code == 200
    kpis = kpi_resp.json()
    assert isinstance(kpis, list)
    assert any("Total Revenue" in k["label"] for k in kpis)

    # Test Data Records endpoint
    records_resp = client.get("/api/data/records", headers=headers)
    assert records_resp.status_code == 200
    records = records_resp.json()
    assert isinstance(records, list)
    assert any(r["order_id"] == "ORD_K_001" for r in records)

def test_reports_export_pdf_and_excel():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Export PDF
    pdf_resp = client.get("/api/reports/export?format=pdf", headers=headers)
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"

    # Export Excel
    excel_resp = client.get("/api/reports/export?format=excel", headers=headers)
    assert excel_resp.status_code == 200
    assert "openxmlformats" in excel_resp.headers["content-type"]

def test_ai_chat_endpoint():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Test revenue calculation query
    resp1 = client.post("/api/ai-chat", json={"question": "revenue calculation"}, headers=headers)
    assert resp1.status_code == 200
    ans1 = resp1.json()["answer"]
    assert "Revenue" in ans1 or "Units Sold" in ans1
    assert "Total Revenue" in ans1

    # Test what is sales profit query
    resp2 = client.post("/api/ai-chat", json={"question": "what is sales profit"}, headers=headers)
    assert resp2.status_code == 200
    ans2 = resp2.json()["answer"]
    assert "Profit" in ans2
    assert "Margin" in ans2

def test_admin_endpoints():
    # Create an admin user
    signup_data = {
        "username": "admin_test_user",
        "email": "admin_test@example.com",
        "password": "password123",
        "role": "Admin",
    }
    client.post("/api/auth/signup", json=signup_data)
    login_data = {"username": "admin_test_user", "password": "password123"}
    resp = client.post("/api/auth/login", json=login_data)
    admin_token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Test get users
    users_resp = client.get("/api/admin/users", headers=headers)
    assert users_resp.status_code == 200
    assert len(users_resp.json()) >= 1

    # Test get system stats
    stats_resp = client.get("/api/admin/stats", headers=headers)
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert "services" in stats
    assert stats["services"]["fastapi_server"] == "Online (Port 8000)"

