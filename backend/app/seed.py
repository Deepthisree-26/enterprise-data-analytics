from sqlalchemy import text
from app.database import SessionLocal, engine
from app.auth.models import User
from app.auth.security import get_password_hash
from app.data.admin_models import DepartmentStatus, SystemSetting, SystemAlert, AuditLog, UserActivity
from datetime import datetime, timezone, timedelta


def migrate_users_table():
    """Ensure newly added columns exist in users table in SQLite."""
    with engine.connect() as conn:
        try:
            result = conn.execute(text("PRAGMA table_info(users)")).fetchall()
            existing_cols = [r[1] for r in result]
            if "full_name" not in existing_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR"))
            if "department" not in existing_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN department VARCHAR DEFAULT 'Administration'"))
            if "created_at" not in existing_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME"))
            if "last_login" not in existing_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN last_login DATETIME"))
            conn.commit()
        except Exception as e:
            # Table might not exist yet before Base.metadata.create_all
            pass


def seed_database():
    """Seed required user accounts, department statuses, and default settings if missing."""
    migrate_users_table()
    db = SessionLocal()
    try:
        # Seed users if missing
        seed_users = [
            {
                "username": "analyst_user",
                "email": "analyst@enterprise.com",
                "password": "password123",
                "role": "Analyst",
                "full_name": "Senior Data Analyst",
                "department": "Operations",
            },
            {
                "username": "admin_user",
                "email": "admin@enterprise.com",
                "password": "password123",
                "role": "Admin",
                "full_name": "Chief Platform Administrator",
                "department": "Administration",
            },
            {
                "username": "manager_user",
                "email": "manager@enterprise.com",
                "password": "password123",
                "role": "Manager",
                "full_name": "Executive Operations Manager",
                "department": "Executive",
            },
        ]

        now = datetime.now(timezone.utc)
        for u in seed_users:
            user = db.query(User).filter(User.username == u["username"]).first()
            if not user:
                new_user = User(
                    username=u["username"],
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    role=u["role"],
                    full_name=u["full_name"],
                    department=u["department"],
                    is_active=True,
                    created_at=now - timedelta(days=30),
                    last_login=now - timedelta(hours=2),
                )
                db.add(new_user)
            else:
                if not user.full_name:
                    user.full_name = u["full_name"]
                if not user.department:
                    user.department = u["department"]
                if not user.last_login:
                    user.last_login = now - timedelta(hours=2)
        db.commit()

        # Seed Department Statuses
        departments = [
            ("Sales", "Revenue generation, transactions, contracts and regional sales pipelines"),
            ("Customers", "Accounts, segments, lifecycle churn risk and retention metrics"),
            ("Products", "Catalog items, pricing tiers, suppliers, and manufacturing units"),
            ("Inventory", "Warehouse stock tracking, reorder levels, and supply velocity"),
            ("Finance", "General ledger, revenue, expenses, budget variance, and payroll"),
            ("Marketing", "Multi-channel campaigns, lead acquisition, conversions, and ROI"),
            ("HR", "Headcount, compensation, retention rates, and performance analytics"),
        ]

        for dept_name, desc in departments:
            dept = db.query(DepartmentStatus).filter(DepartmentStatus.name == dept_name).first()
            if not dept:
                db.add(DepartmentStatus(name=dept_name, description=desc, is_active=True))
        db.commit()

        # Seed Safe System Settings
        default_settings = [
            ("app_title", "Enterprise BI & Data Governance Platform", "general", "Application branding title", False),
            ("max_upload_size_mb", "50", "upload", "Maximum allowable file size in megabytes", False),
            ("allowed_extensions", ".csv, .xlsx, .xls", "upload", "Allowed dataset ingestion extensions", False),
            ("max_preview_rows", "100", "upload", "Maximum preview rows rendered during ingestion", False),
            ("session_timeout_minutes", "1440", "security", "JWT session expiration window in minutes", False),
            ("enforce_password_length", "6", "security", "Minimum character length for user passwords", False),
            ("copilot_model_name", "llama3.2", "ai", "Designated local Ollama LLM model identifier", False),
            ("copilot_temperature", "0.7", "ai", "Sampling temperature for AI Copilot responses", False),
            ("reports_page_size", "LETTER", "reports", "Default page size formatting for PDF exports", False),
            ("alert_notifications_enabled", "true", "notifications", "System alerts dispatch telemetry flag", False),
        ]

        for key, val, cat, desc, is_sec in default_settings:
            setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
            if not setting:
                db.add(SystemSetting(key=key, value=val, category=cat, description=desc, is_secret=is_sec))
        db.commit()

        # Seed initial audit logs if empty
        if db.query(AuditLog).count() == 0:
            initial_audit = [
                AuditLog(
                    user="admin_user",
                    action="PLATFORM_INITIALIZATION",
                    resource="system:core",
                    details="Platform governance engine initialized successfully",
                    status="SUCCESS",
                    timestamp=now - timedelta(days=2),
                ),
                AuditLog(
                    user="admin_user",
                    action="USER_CREATED",
                    resource="user:analyst_user",
                    details="Provisioned role Analyst with access to ingestion & explorer",
                    status="SUCCESS",
                    timestamp=now - timedelta(days=2),
                ),
                AuditLog(
                    user="admin_user",
                    action="USER_CREATED",
                    resource="user:manager_user",
                    details="Provisioned role Manager with access to executive dashboards & reports",
                    status="SUCCESS",
                    timestamp=now - timedelta(days=2),
                ),
                AuditLog(
                    user="analyst_user",
                    action="USER_LOGIN",
                    resource="auth:session",
                    details="Successful analyst authentication token issuance",
                    status="SUCCESS",
                    timestamp=now - timedelta(hours=5),
                ),
            ]
            db.add_all(initial_audit)
            db.commit()

        # Seed initial system alerts if empty
        if db.query(SystemAlert).count() == 0:
            initial_alerts = [
                SystemAlert(
                    title="Platform Governance Online",
                    severity="info",
                    category="system_service",
                    department="Administration",
                    message="Enterprise BI Platform Admin module operational with active RBAC enforcement.",
                    status="resolved",
                    resolved_at=now,
                    resolved_by="admin_user",
                ),
                SystemAlert(
                    title="Ollama Local LLM Endpoint Status",
                    severity="warning",
                    category="system_service",
                    department="AI",
                    message="Ollama local instance on port 11434 will be used when available. Fallback heuristic engine active.",
                    status="open",
                ),
            ]
            db.add_all(initial_alerts)
            db.commit()

        # Seed initial user activity if empty
        if db.query(UserActivity).count() == 0:
            initial_activity = [
                UserActivity(
                    username="admin_user",
                    activity_type="LOGIN",
                    role="Admin",
                    department="Administration",
                    status="SUCCESS",
                    timestamp=now - timedelta(hours=2),
                    details="Authenticated from local enterprise subnet",
                ),
                UserActivity(
                    username="analyst_user",
                    activity_type="LOGIN",
                    role="Analyst",
                    department="Operations",
                    status="SUCCESS",
                    timestamp=now - timedelta(hours=5),
                    details="Standard analyst session initialization",
                ),
                UserActivity(
                    username="manager_user",
                    activity_type="LOGIN",
                    role="Manager",
                    department="Executive",
                    status="SUCCESS",
                    timestamp=now - timedelta(hours=8),
                    details="Manager executive dashboard review session",
                ),
            ]
            db.add_all(initial_activity)
            db.commit()

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
    print("Database initial users, department statuses, and settings verified successfully.")
