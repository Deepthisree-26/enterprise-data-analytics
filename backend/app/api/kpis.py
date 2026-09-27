from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import pandas as pd
from sklearn.metrics import r2_score

from app.database import get_db
from app.data.models import DataRecord
from app.auth.security import get_current_user
from app.ml import model as ml_model

router = APIRouter()

@router.get("/kpis", response_model=List[dict])
def get_kpis(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(DataRecord).all()
    if not records:
        return [
            {"label": "Total Revenue", "value": "$0.00"},
            {"label": "Units Sold", "value": "0"},
            {"label": "Model R² Accuracy", "value": "N/A"},
        ]

    total_revenue = sum(float(r.revenue or 0.0) for r in records)
    total_units = sum(int(r.units_sold or 0) for r in records)
    
    r2_str = "N/A"
    if len(records) >= 2:
        try:
            df = pd.DataFrame([
                {"units_sold": r.units_sold, "profit_margin": r.profit_margin, "revenue": r.revenue}
                for r in records
            ])
            try:
                model = ml_model.load_model()
            except FileNotFoundError:
                model, _ = ml_model.train_model(df)
            
            X = df[["units_sold", "profit_margin"]].astype(float).values
            y = df["revenue"].astype(float).values
            preds = model.predict(X)
            score = float(r2_score(y, preds))
            r2_val = max(0.0, score) if not pd.isna(score) else 0.0
            r2_str = f"{r2_val:.2f}"
        except Exception:
            r2_str = "N/A"

    return [
        {"label": "Total Revenue", "value": f"${total_revenue:,.2f}"},
        {"label": "Units Sold", "value": f"{total_units:,}"},
        {"label": "Model R² Accuracy", "value": r2_str},
    ]
