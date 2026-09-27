from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
from datetime import date, timedelta
from sklearn.metrics import r2_score
from app.database import get_db
from app.ml import model as ml_model
from app.auth.schemas import TokenData
from app.auth.security import get_current_user, get_current_active_user
from app.data import crud, schemas as data_schemas

router = APIRouter()

class PredictionRequest(data_schemas.DataRecordBase):
    pass

class PredictionResponse(data_schemas.DataRecordBase):
    predicted_revenue: float
    r2_score: float

class ForecastItem(data_schemas.BaseModel):
    date: str
    forecast: float

@router.post("/predict", response_model=PredictionResponse)
async def predict(
    input: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_active_user),
):
    # Only Analyst, Manager, Admin allowed
    if current_user.role not in ["Admin", "Analyst", "Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions for prediction")

    # Fetch all existing records for training
    records = crud.get_all_records(db)
    if not records:
        raise HTTPException(status_code=400, detail="No dataset has been uploaded yet. Please upload a dataset to train the regression model.")
    
    df = pd.DataFrame([
        {
            "units_sold": r.units_sold,
            "profit_margin": r.profit_margin,
            "revenue": r.revenue,
        }
        for r in records
    ])

    try:
        model = ml_model.load_model()
        X = df[["units_sold", "profit_margin"]].astype(float).values
        y = df["revenue"].astype(float).values
        predictions = model.predict(X)
        if len(y) > 1:
            r2_val = float(r2_score(y, predictions))
            r2 = 0.0 if pd.isna(r2_val) else r2_val
        else:
            r2 = 1.0
    except FileNotFoundError:
        model, r2 = ml_model.train_model(df)

    predicted_rev = ml_model.predict_future(model, input.units_sold, input.profit_margin)
    return PredictionResponse(
        **input.model_dump(),
        predicted_revenue=predicted_rev,
        r2_score=r2,
    )

@router.get("/forecast", response_model=List[ForecastItem])
def get_forecast(
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Generate forecast trajectory points for the ForecastChart."""
    records = crud.get_all_records(db)
    if not records:
        return []

    # Convert records to DataFrame
    df = pd.DataFrame([
        {
            "date": r.date,
            "units_sold": r.units_sold,
            "profit_margin": r.profit_margin,
            "revenue": r.revenue,
        }
        for r in records
    ])
    
    try:
        model = ml_model.load_model()
    except FileNotFoundError:
        model, _ = ml_model.train_model(df)

    # Sort by date
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.dropna(subset=["date"]).sort_values("date")

    if df.empty:
        return []

    # Group by date and calculate average or projection
    daily = df.groupby("date").agg({
        "units_sold": "mean",
        "profit_margin": "mean",
        "revenue": "sum",
    }).reset_index()

    results = []
    # Historical points
    for _, row in daily.tail(6).iterrows():
        d_str = row["date"].strftime("%Y-%m-%d")
        results.append({"date": d_str, "forecast": round(float(row["revenue"]), 2)})

    # Generate 3 future points
    last_date = daily["date"].max()
    avg_units = float(daily["units_sold"].mean() or 10)
    avg_margin = float(daily["profit_margin"].mean() or 0.25)

    for i in range(1, 4):
        future_date = (last_date + timedelta(days=i * 7)).strftime("%Y-%m-%d")
        projected_units = avg_units * (1 + (i * 0.05))
        pred_rev = ml_model.predict_future(model, int(projected_units), avg_margin)
        results.append({"date": future_date, "forecast": round(max(0.0, pred_rev), 2)})

    return results
