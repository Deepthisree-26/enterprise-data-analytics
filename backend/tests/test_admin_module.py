import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.auth.models import User
from app.seed import seed_database
from app.auth.security import create_access_token

client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    seed_database()


def get_token(role: str, username: str = None) -> str:
    """Helper to return a valid JWT for given role."""
    if not username:
        user_map = {
            "Admin": "admin_user",
            "Analyst": "analyst_user",
            "Manager": "manager_user",
        }
        username = user_map.get(role, "test_user")
    return create_access_token({"sub": username, "role": role})


def test_admin_overview_access_control():
    """Verify Analyst and Manager are blocked (403) while Admin can access overview."""
    analyst_token = get_token("Analyst")
    manager_token = get_token("Manager")
    admin_token = get_token("Admin")

    # Analyst blocked
    res = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {analyst_token}"})
    assert res.status_code == 403

    # Manager blocked
    res = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {manager_token}"})
    assert res.status_code == 403

    # Admin allowed
    res = client.get("/api/admin/overview", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "kpis" in data
    assert data["kpis"]["total_users"] >= 3
    assert data["kpis"]["total_departments"] == 7
    assert "department_data_status" in data


def test_admin_user_crud_and_safety():
    """Test user creation, update, role changes, status toggle, and last admin protection."""
    admin_token = get_token("Admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create a new user
    new_user_payload = {
        "username": "test_analyst_qa",
        "email": "test_analyst_qa@enterprise.com",
        "password": "password123",
        "role": "Analyst",
        "department": "Operations",
        "full_name": "Test Analyst QA",
    }
    # Clean up if exists from previous run
    db = SessionLocal()
    existing = db.query(User).filter(User.username == "test_analyst_qa").first()
    if existing:
        db.delete(existing)
        db.commit()
    db.close()

    create_res = client.post("/api/admin/users", headers=headers, json=new_user_payload)
    assert create_res.status_code == 201
    user_id = create_res.json()["user_id"]

    # 2. Update user role to Manager
    update_res = client.put(
        f"/api/admin/users/{user_id}",
        headers=headers,
        json={"role": "Manager", "department": "Executive"},
    )
    assert update_res.status_code == 200

    # 3. Toggle status to Inactive then Active
    status_res = client.patch(
        f"/api/admin/users/{user_id}/status",
        headers=headers,
        json={"is_active": False},
    )
    assert status_res.status_code == 200

    status_res2 = client.patch(
        f"/api/admin/users/{user_id}/status",
        headers=headers,
        json={"is_active": True},
    )
    assert status_res2.status_code == 200

    # 4. Reset password
    pw_res = client.post(
        f"/api/admin/users/{user_id}/reset-password",
        headers=headers,
        json={"new_password": "newpassword123"},
    )
    assert pw_res.status_code == 200

    # 5. Delete the created user
    del_res = client.delete(f"/api/admin/users/{user_id}", headers=headers)
    assert del_res.status_code == 200

    # 6. Safety check: Cannot deactivate last admin
    users_res = client.get("/api/admin/users", headers=headers)
    admin_users = [u for u in users_res.json() if u["role"] == "Admin"]
    if len(admin_users) == 1:
        bad_deactivate = client.patch(
            f"/api/admin/users/{admin_users[0]['id']}/status",
            headers=headers,
            json={"is_active": False},
        )
        assert bad_deactivate.status_code == 400
        assert "last active administrator" in bad_deactivate.json()["detail"].lower()


def test_admin_departments_and_status():
    """Verify department listing and toggling status."""
    admin_token = get_token("Admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = client.get("/api/admin/departments", headers=headers)
    assert res.status_code == 200
    depts = res.json()
    assert len(depts) == 7
    dept_names = [d["name"] for d in depts]
    assert "Sales" in dept_names
    assert "Finance" in dept_names

    # Toggle status of HR department
    patch_res = client.patch(
        "/api/admin/departments/HR/status",
        headers=headers,
        json={"is_active": False},
    )
    assert patch_res.status_code == 200

    # Restore HR department to active
    restore_res = client.patch(
        "/api/admin/departments/HR/status",
        headers=headers,
        json={"is_active": True},
    )
    assert restore_res.status_code == 200


def test_admin_data_quality_and_upload_history():
    """Verify data quality center metrics and upload history query."""
    admin_token = get_token("Admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Data Quality
    dq_res = client.get("/api/admin/data-quality", headers=headers)
    assert dq_res.status_code == 200
    dq_data = dq_res.json()
    assert "summary" in dq_data
    assert "department_breakdown" in dq_data
    assert len(dq_data["department_breakdown"]) == 7

    # Upload History
    uh_res = client.get("/api/admin/upload-history", headers=headers)
    assert uh_res.status_code == 200
    uh_data = uh_res.json()
    assert "items" in uh_data
    assert "total" in uh_data


def test_admin_system_health():
    """Verify real system health checks return all service categories."""
    admin_token = get_token("Admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    res = client.get("/api/admin/system-health", headers=headers)
    assert res.status_code == 200
    health = res.json()
    assert "services" in health
    service_names = [s["name"] for s in health["services"]]
    assert any("Backend API" in name for name in service_names)
    assert any("Database" in name for name in service_names)
    assert any("AI Copilot" in name for name in service_names)


def test_admin_alerts_and_audit_logs():
    """Verify creating alert, changing status, and audit log generation."""
    admin_token = get_token("Admin")
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create alert
    alert_payload = {
        "title": "Automated Quality Check Alert",
        "message": "Sample notification for test runner",
        "severity": "info",
        "category": "data_quality",
        "department": "Sales",
    }
    create_res = client.post("/api/admin/alerts", headers=headers, json=alert_payload)
    assert create_res.status_code == 200
    alert_id = create_res.json()["id"]

    # Acknowledge / resolve alert
    update_res = client.patch(
        f"/api/admin/alerts/{alert_id}/status",
        headers=headers,
        json={"status": "resolved"},
    )
    assert update_res.status_code == 200

    # Query audit logs
    audit_res = client.get("/api/admin/audit-logs", headers=headers)
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert "items" in audit_data
    assert audit_data["total"] > 0
