import pytest
from fastapi.testclient import TestClient
import io
import os
import pandas as pd
from app.main import app
from app.database import Base, engine, SessionLocal
from app.seed import seed_database
from app.auth.security import create_access_token

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    seed_database()

def get_auth_token(role="Analyst", username="analyst_test"):
    return create_access_token({"sub": username, "role": role})

def test_ingestion_departments_endpoint():
    token = get_auth_token("Analyst")
    response = client.get("/api/ingestion/departments", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    depts = response.json()
    dept_names = [d["name"] for d in depts]
    assert "Sales" in dept_names
    assert "Customers" in dept_names
    assert "Inventory" in dept_names
    assert "Finance" in dept_names
    assert "Marketing" in dept_names
    assert "HR" in dept_names

def test_analyst_validate_and_import_products():
    token = get_auth_token("Analyst")
    csv_content = (
        "Product ID,Product Name,Category,Region,Unit Cost,Unit Price,Supplier,Reorder Level\n"
        "PROD-901,Test Server,Hardware,North America,100.0,200.0,Supplier A,10\n"
        "PROD-902,Test Cloud,Software,Europe,50.0,120.0,Supplier B,5\n"
    )
    # Validation step
    files = {"file": ("products.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    data = {"department": "Products", "dataset_type": "Product Master"}
    res = client.post("/api/ingestion/validate", headers={"Authorization": f"Bearer {token}"}, files=files, data=data)
    assert res.status_code == 200
    val_data = res.json()
    assert val_data["can_import"] is True
    assert val_data["total_rows"] == 2

    # Import step
    files = {"file": ("products.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    import_res = client.post("/api/ingestion/import", headers={"Authorization": f"Bearer {token}"}, files=files, data=data)
    assert import_res.status_code == 200
    assert import_res.json()["success"] is True

def test_manager_cannot_upload():
    """Verify RBAC: Manager is blocked from uploading dataset."""
    token = get_auth_token("Manager", "manager_test")
    csv_content = "Product ID,Product Name,Category,Region,Unit Cost,Unit Price,Supplier,Reorder Level\n"
    files = {"file": ("products.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")}
    data = {"department": "Products", "dataset_type": "Product Master"}
    res = client.post("/api/ingestion/validate", headers={"Authorization": f"Bearer {token}"}, files=files, data=data)
    assert res.status_code == 403

def test_executive_overview_empty_state_and_with_data():
    token = get_auth_token("Manager", "manager_test")
    res = client.get("/api/analytics/executive", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "cards" in data
    assert "departments" in data

def test_ai_chat_executive_summary():
    token = get_auth_token("Manager", "manager_test")
    res = client.post("/api/ai-chat", headers={"Authorization": f"Bearer {token}"}, json={"question": "Give me an executive summary."})
    assert res.status_code == 200
    assert "executive" in res.json()["answer"].lower()

def test_validation_detects_missing_column():
    """Verify validation detects missing mandatory columns."""
    token = get_auth_token("Analyst")
    # Missing Revenue column in Sales
    invalid_csv = (
        "Date,Region,Product,Product ID,Customer ID,Units Sold,Unit Price,Cost,Profit Margin\n"
        "2026-08-01,North America,Suite,PROD-01,CUST-01,5,100.0,300.0,0.4\n"
    )
    files = {"file": ("sales_invalid.csv", io.BytesIO(invalid_csv.encode("utf-8")), "text/csv")}
    data = {"department": "Sales", "dataset_type": "Sales Transactions"}
    res = client.post("/api/ingestion/validate", headers={"Authorization": f"Bearer {token}"}, files=files, data=data)
    assert res.status_code == 200
    res_json = res.json()
    assert res_json["can_import"] is False
    assert any("Revenue" in err["column"] for err in res_json["errors"])

def test_validation_detects_negative_units():
    """Verify validation blocks negative units sold."""
    token = get_auth_token("Analyst")
    invalid_csv = (
        "Date,Region,Product,Product ID,Customer ID,Units Sold,Unit Price,Revenue,Cost,Profit Margin\n"
        "2026-08-01,North America,Suite,PROD-01,CUST-01,-5,100.0,500.0,300.0,0.4\n"
    )
    files = {"file": ("sales_invalid.csv", io.BytesIO(invalid_csv.encode("utf-8")), "text/csv")}
    data = {"department": "Sales", "dataset_type": "Sales Transactions"}
    res = client.post("/api/ingestion/validate", headers={"Authorization": f"Bearer {token}"}, files=files, data=data)
    assert res.status_code == 200
    res_json = res.json()
    assert res_json["can_import"] is False
    assert any("negative" in err["error"].lower() for err in res_json["errors"])

def test_predictive_churn_and_stockout():
    token = get_auth_token("Manager")
    # Churn prediction
    churn_res = client.post(
        "/api/predict/churn",
        headers={"Authorization": f"Bearer {token}"},
        json={"age": 42, "total_orders": 1, "total_spend": 300.0, "days_since_last_purchase": 95},
    )
    assert churn_res.status_code == 200
    assert "churn_probability" in churn_res.json()
    assert churn_res.json()["risk_level"] in ["Low", "Medium", "High"]

    # Stockout prediction
    stock_res = client.post(
        "/api/predict/stockout",
        headers={"Authorization": f"Bearer {token}"},
        json={"product_name": "Test Server", "stock_quantity": 5, "daily_run_rate": 2.0, "lead_time_days": 10},
    )
    assert stock_res.status_code == 200
    assert stock_res.json()["days_until_stockout"] == 2.5

def test_reports_export_excel_and_pdf():
    token = get_auth_token("Manager")
    # Export executive excel
    excel_res = client.get("/api/reports/export?format=excel&department=Executive", headers={"Authorization": f"Bearer {token}"})
    assert excel_res.status_code == 200
    assert excel_res.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    # Export executive pdf
    pdf_res = client.get("/api/reports/export?format=pdf&department=Executive", headers={"Authorization": f"Bearer {token}"})
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"

def test_rbac_admin_vs_analyst():
    """Analyst cannot access /api/admin/users, Admin can."""
    analyst_token = get_auth_token("Analyst")
    admin_token = get_auth_token("Admin")

    # Analyst blocked
    res_analyst = client.get("/api/admin/users", headers={"Authorization": f"Bearer {analyst_token}"})
    assert res_analyst.status_code == 403

    # Admin allowed
    res_admin = client.get("/api/admin/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin.status_code == 200


