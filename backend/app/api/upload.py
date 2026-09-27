from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
import pandas as pd
import io

from app.database import get_db
from app.data import crud, preprocessing, schemas as data_schemas, models as data_models
from app.auth.schemas import TokenData
from app.auth.security import get_current_active_user
from app.ml import model as ml_model

router = APIRouter()

@router.post("/upload", response_model=list[data_schemas.DataRecordResponse], status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_active_user),
):
    # Only Analyst and Admin can upload
    if current_user.role not in ["Admin", "Analyst"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions for upload. Only Analyst or Admin roles can ingest datasets.")

    # Validate file type by extension and content-type
    filename = (file.filename or "").lower()
    valid_ext = filename.endswith(('.csv', '.xlsx', '.xls'))
    valid_content_types = [
        "text/csv",
        "text/plain",
        "application/csv",
        "text/comma-separated-values",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/octet-stream",
    ]
    
    if not (valid_ext or (file.content_type and file.content_type in valid_content_types)):
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.")

    try:
        content = await file.read()
        if filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            try:
                df = pd.read_csv(io.BytesIO(content), encoding="utf-8", encoding_errors="replace")
            except Exception:
                df = pd.read_csv(io.BytesIO(content), encoding="latin-1", encoding_errors="replace")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing file: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded file contains no data rows.")

    # Clean data
    df_clean = preprocessing.clean_dataframe(df)
    records = preprocessing.dataframe_to_records(df_clean)

    if not records:
        raise HTTPException(status_code=400, detail="No valid data records found in uploaded file.")

    # Fast batch insertion/updating with single commit
    existing_map = {
        r.order_id: r
        for r in db.query(data_models.DataRecord).filter(
            data_models.DataRecord.order_id.in_([rec['order_id'] for rec in records])
        ).all()
    }

    created_responses = []
    new_db_objects = []

    for rec in records:
        oid = rec.get('order_id')
        if oid in existing_map:
            existing = existing_map[oid]
            for k, v in rec.items():
                setattr(existing, k, v)
            created_responses.append(existing)
        else:
            new_obj = data_models.DataRecord(**rec)
            db.add(new_obj)
            created_responses.append(new_obj)

    # Commit all changes at once
    db.commit()

    # Auto-retrain ML model if sufficient records exist
    try:
        all_records = crud.get_all_records(db)
        if len(all_records) >= 2:
            sample_records = all_records[-1500:]  # Train on latest 1,500 records for fast convergence
            records_df = pd.DataFrame([
                {
                    "units_sold": r.units_sold,
                    "profit_margin": r.profit_margin,
                    "revenue": r.revenue,
                }
                for r in sample_records
            ])
            ml_model.train_model(records_df)
    except Exception:
        pass

    # Return validated responses (limiting serialization to first 100 for speed if massive)
    return [data_schemas.DataRecordResponse.model_validate(r) for r in created_responses[:100]]
