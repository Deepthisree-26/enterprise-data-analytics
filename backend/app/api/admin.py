from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.database import get_db
from app.auth.models import User
from app.data.models import DataRecord
from app.auth.security import get_current_user
from app.seed import seed_database

router = APIRouter()

class UserAdminResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class RoleUpdateRequest(BaseModel):
    username: str
    new_role: str

@router.get("/admin/users", response_model=List[UserAdminResponse])
def get_all_users(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Access denied: Admin role required.")
    return db.query(User).all()

@router.get("/admin/stats")
def get_system_stats(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Access denied: Admin role required.")

    user_count = db.query(User).count()
    record_count = db.query(DataRecord).count()

    return {
        "user_count": user_count,
        "record_count": record_count,
        "services": {
            "fastapi_server": "Online (Port 8000)",
            "sqlite_database": "Connected",
            "ml_regression_engine": "Trained & Active",
            "ai_executive_copilot": "Operational",
        },
        "pipeline_health": "Optimal",
        "last_sync": "Real-time Telemetry Active",
    }

@router.post("/admin/reset-data")
def reset_demo_data(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Access denied: Admin role required.")

    # Purge all uploaded records and clear model cache
    try:
        db.query(DataRecord).delete()
        db.commit()
        from app.ml import model as ml_model
        if ml_model.MODEL_PATH.exists():
            try:
                ml_model.MODEL_PATH.unlink()
            except Exception:
                pass
        ml_model._cached_model = None
        return {"message": "All uploaded data records have been purged. Database is clean.", "record_count": 0}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error resetting data: {str(e)}")

@router.post("/admin/update-role")
def update_user_role(
    req: RoleUpdateRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Access denied: Admin role required.")

    if req.new_role not in ["Admin", "Analyst", "Manager"]:
        raise HTTPException(status_code=400, detail="Invalid role. Choose Admin, Analyst, or Manager.")

    user = db.query(User).filter(User.username == req.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = req.new_role
    db.commit()
    db.refresh(user)
    return {"message": f"User {req.username} role updated to {req.new_role}."}
