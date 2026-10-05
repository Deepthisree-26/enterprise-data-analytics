from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timezone

from app.auth import schemas, models, security
from app.database import get_db
from app.config import settings
from app.data.admin_models import AuditLog, UserActivity

router = APIRouter()

# Dependency to get current user and verify role
def get_current_user(token: str = Depends(security.oauth2_scheme)):
    token_data = security.decode_access_token(token)
    if not token_data.username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    return token_data

def get_current_active_user(current_user: schemas.TokenData = Depends(get_current_user)):
    return current_user

@router.post("/signup", response_model=schemas.Token)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username or email already exists
    existing_user = db.query(models.User).filter((models.User.username == user.username) | (models.User.email == user.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        department="Operations" if user.role == "Analyst" else ("Executive" if user.role == "Manager" else "Administration"),
        full_name=user.username.replace("_", " ").title(),
        created_at=datetime.now(timezone.utc),
    )
    db.add(db_user)
    
    # Audit log
    audit = AuditLog(
        user=user.username,
        action="USER_SIGNUP",
        resource=f"user:{user.username}",
        details=f"Self-registration with role {user.role}",
        status="SUCCESS",
    )
    db.add(audit)
    db.commit()
    db.refresh(db_user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": db_user.username, "role": db_user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        # Log failed attempt
        try:
            db.add(UserActivity(
                username=form_data.username,
                activity_type="FAILED_LOGIN",
                status="FAILED",
                details="Authentication failed: invalid credentials",
            ))
            db.commit()
        except Exception:
            db.rollback()
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    if not user.is_active:
        try:
            db.add(UserActivity(
                username=user.username,
                activity_type="LOGIN_REJECTED",
                role=user.role,
                status="DENIED",
                details="Account deactivated by administrator",
            ))
            db.commit()
        except Exception:
            db.rollback()
        raise HTTPException(status_code=403, detail="Account is deactivated. Please contact an administrator.")

    # Update last login and record activity
    now = datetime.now(timezone.utc)
    user.last_login = now
    try:
        db.add(UserActivity(
            username=user.username,
            activity_type="LOGIN",
            role=user.role,
            department=user.department,
            status="SUCCESS",
            details="User logged in successfully",
        ))
        db.add(AuditLog(
            user=user.username,
            action="USER_LOGIN",
            resource="auth:session",
            details=f"Session established for {user.username} ({user.role})",
            status="SUCCESS",
        ))
        db.commit()
    except Exception:
        db.rollback()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
