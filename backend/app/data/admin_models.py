from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False, index=True)  # USER_LOGIN, ROLE_CHANGED, DATASET_IMPORT, etc.
    resource = Column(String, nullable=True)  # e.g., user:analyst_user, dataset:sales.csv
    details = Column(Text, nullable=True)
    status = Column(String, default="SUCCESS", index=True)  # SUCCESS, FAILURE, WARNING, DENIED
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class SystemAlert(Base):
    __tablename__ = "system_alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    severity = Column(String, nullable=False, default="warning", index=True)  # critical, error, warning, info
    category = Column(String, nullable=False, default="data_quality", index=True)  # data_quality, system_service, security, import_failure
    department = Column(String, nullable=True, index=True)
    message = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="open", index=True)  # open, acknowledged, resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by = Column(String, nullable=True)


class UserActivity(Base):
    __tablename__ = "user_activity"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, nullable=False, index=True)
    activity_type = Column(String, nullable=False, index=True)  # LOGIN, FAILED_LOGIN, LOGOUT, ACCESS_DENIED, etc.
    role = Column(String, nullable=True)
    department = Column(String, nullable=True)
    status = Column(String, default="SUCCESS")
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    details = Column(Text, nullable=True)


class DepartmentStatus(Base):
    __tablename__ = "department_statuses"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    key = Column(String, unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    category = Column(String, default="general", index=True)  # general, upload, security, ai, reports
    description = Column(String, nullable=True)
    is_secret = Column(Boolean, default=False)
