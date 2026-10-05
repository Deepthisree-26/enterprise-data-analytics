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


# ==========================================
# MULTI-DEPARTMENT PREDICTIVE ANALYTICS
# ==========================================

from pydantic import BaseModel
from app.data.department_models import Customer, InventoryItem, MarketingCampaign
from sklearn.linear_model import LogisticRegression, LinearRegression
import numpy as np

class ChurnPredictionRequest(BaseModel):
    age: int = 35
    total_orders: int = 2
    total_spend: float = 1200.0
    days_since_last_purchase: int = 45

class ChurnPredictionResponse(BaseModel):
    churn_probability: float
    risk_level: str
    key_drivers: List[str]
    retention_strategy: str

@router.post("/predict/churn", response_model=ChurnPredictionResponse)
def predict_customer_churn(
    input: ChurnPredictionRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Predict customer churn risk using ML trained on customer behavioral telemetry."""
    customers = db.query(Customer).all()
    
    # Base heuristic feature weights
    # Risk factors: high days since last purchase, low total orders, low spend
    recency_factor = min(1.0, max(0.0, input.days_since_last_purchase / 120.0))
    orders_factor = max(0.0, 1.0 - (input.total_orders / 10.0))
    spend_factor = max(0.0, 1.0 - (input.total_spend / 3000.0))

    if len(customers) >= 5:
        try:
            # Build training dataset from live database records
            X_train = []
            y_train = []
            for c in customers:
                days_inactive = 30 if c.customer_status == "Active" else 90
                X_train.append([c.age or 35, c.total_orders or 1, c.total_spend or 500.0, days_inactive])
                y_train.append(1 if c.customer_status == "Churned" else 0)

            if sum(y_train) > 0 and len(set(y_train)) > 1:
                clf = LogisticRegression()
                clf.fit(X_train, y_train)
                prob = float(clf.predict_proba([[input.age, input.total_orders, input.total_spend, input.days_since_last_purchase]])[0][1])
            else:
                prob = float(0.5 * recency_factor + 0.3 * orders_factor + 0.2 * spend_factor)
        except Exception:
            prob = float(0.5 * recency_factor + 0.3 * orders_factor + 0.2 * spend_factor)
    else:
        prob = float(0.5 * recency_factor + 0.3 * orders_factor + 0.2 * spend_factor)

    prob = min(0.98, max(0.04, round(prob, 3)))
    if prob >= 0.65:
        risk_level = "High"
        strategy = "Initiate immediate executive re-engagement campaign, offer 20% loyalty incentive."
    elif prob >= 0.35:
        risk_level = "Medium"
        strategy = "Send proactive account health check and product update newsletter."
    else:
        risk_level = "Low"
        strategy = "Account is healthy. Present cross-sell upgrades and premium tier options."

    drivers = []
    if input.days_since_last_purchase > 60:
        drivers.append(f"High inactivity period ({input.days_since_last_purchase} days since last purchase)")
    if input.total_orders < 3:
        drivers.append(f"Low purchase frequency ({input.total_orders} total orders)")
    if input.total_spend < 1000.0:
        drivers.append(f"Low historical customer spend (${input.total_spend:,.2f})")
    if not drivers:
        drivers.append("Strong purchase consistency and account activity")

    return ChurnPredictionResponse(
        churn_probability=prob,
        risk_level=risk_level,
        key_drivers=drivers,
        retention_strategy=strategy,
    )


class StockoutPredictionRequest(BaseModel):
    product_name: str = "Enterprise Suite"
    stock_quantity: int = 45
    daily_run_rate: float = 3.5
    lead_time_days: int = 14

class StockoutPredictionResponse(BaseModel):
    days_until_stockout: float
    stockout_risk: str
    recommended_reorder_qty: int
    reorder_urgency: str

@router.post("/predict/stockout", response_model=StockoutPredictionResponse)
def predict_stockout_risk(
    input: StockoutPredictionRequest,
    current_user: TokenData = Depends(get_current_user),
):
    """Predict inventory stockout risk and replenish lead-time requirements."""
    run_rate = max(0.1, input.daily_run_rate)
    days_supply = round(input.stock_quantity / run_rate, 1)

    if days_supply <= input.lead_time_days:
        risk = "Critical Stockout Risk"
        urgency = "Immediate Purchase Order Required"
    elif days_supply <= (input.lead_time_days * 1.5):
        risk = "Elevated Stockout Risk"
        urgency = "Queue PO with Supplier This Week"
    else:
        risk = "Safe Inventory Buffer"
        urgency = "Normal Monitoring"

    # Recommended reorder = 30 days of sales + lead time safety stock
    reorder_qty = int(np.ceil((30 + input.lead_time_days) * run_rate - input.stock_quantity))
    reorder_qty = max(0, reorder_qty)

    return StockoutPredictionResponse(
        days_until_stockout=days_supply,
        stockout_risk=risk,
        recommended_reorder_qty=reorder_qty,
        reorder_urgency=urgency,
    )


class MarketingPredictRequest(BaseModel):
    channel: str = "Search"
    marketing_spend: float = 5000.0
    target_customers: int = 25000

class MarketingPredictResponse(BaseModel):
    projected_leads: int
    projected_conversions: int
    projected_revenue: float
    projected_roi: float
    channel_efficiency: str

@router.post("/predict/marketing", response_model=MarketingPredictResponse)
def predict_marketing_performance(
    input: MarketingPredictRequest,
    db: Session = Depends(get_db),
    current_user: TokenData = Depends(get_current_user),
):
    """Forecast campaign leads, conversions, and expected ROI."""
    campaigns = db.query(MarketingCampaign).all()
    channel_mult = {
        "search": 1.2,
        "email": 1.5,
        "social": 0.9,
        "display": 0.7,
        "event": 1.1,
    }.get(input.channel.lower(), 1.0)

    # Estimate based on channel efficiency
    cost_per_lead = 25.0 / channel_mult
    proj_leads = int(max(1, input.marketing_spend / cost_per_lead))
    conv_rate = 0.08 * channel_mult
    proj_conversions = int(max(1, proj_leads * conv_rate))
    avg_order_val = 320.0
    proj_rev = round(proj_conversions * avg_order_val, 2)
    proj_roi = round(((proj_rev - input.marketing_spend) / input.marketing_spend * 100) if input.marketing_spend > 0 else 0.0, 1)

    efficiency = "High Performance Channel" if proj_roi > 50 else ("Moderate Efficiency" if proj_roi > 0 else "Low ROI Risk")

    return MarketingPredictResponse(
        projected_leads=proj_leads,
        projected_conversions=proj_conversions,
        projected_revenue=proj_rev,
        projected_roi=proj_roi,
        channel_efficiency=efficiency,
    )

