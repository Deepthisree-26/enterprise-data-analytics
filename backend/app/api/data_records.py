from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.auth.security import get_current_user
from app.database import get_db
from app.data.models import DataRecord
from app.data.schemas import DataRecordResponse

router = APIRouter()

@router.get("/data/records", response_model=list[DataRecordResponse])
def get_data_records(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(DataRecord).all()
    return records
