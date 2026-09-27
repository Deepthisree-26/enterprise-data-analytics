import pandas as pd
from typing import List
from datetime import date, datetime

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Perform robust cleaning and normalization on the uploaded dataframe.
    Steps:
    1. Drop completely empty rows.
    2. Normalize column names to lowercase snake_case.
    3. Map common aliases to required schema columns.
    4. Fill missing values and enforce correct types.
    5. Deduplicate by order_id.
    """
    df = df.dropna(how="all").copy()

    # Normalize column names: strip whitespace, lowercase, replace spaces/hyphens with underscore
    df.columns = [
        str(c).strip().lower().replace(" ", "_").replace("-", "_")
        for c in df.columns
    ]

    # Alias mapping
    alias_map = {
        "orderid": "order_id",
        "id": "order_id",
        "order_num": "order_id",
        "order_number": "order_id",
        "order_date": "date",
        "timestamp": "date",
        "datetime": "date",
        "quantity": "units_sold",
        "qty": "units_sold",
        "units": "units_sold",
        "sales": "revenue",
        "total_revenue": "revenue",
        "amount": "revenue",
        "margin": "profit_margin",
        "profit": "profit_margin",
        "profitmargin": "profit_margin",
        "role": "customer_role",
        "customer": "customer_role",
        "customertype": "customer_role",
        "customer_type": "customer_role",
    }
    df = df.rename(columns={k: v for k, v in alias_map.items() if k in df.columns and v not in df.columns})

    # Default values for missing required columns
    defaults = {
        "order_id": lambda: [f"ORD_{i+1:04d}" for i in range(len(df))],
        "date": date.today().isoformat(),
        "region": "North America",
        "category": "Enterprise",
        "product": "Software Suite",
        "units_sold": 1,
        "revenue": 1000.0,
        "profit_margin": 0.25,
        "customer_role": "Corporate",
    }
    for col, default_val in defaults.items():
        if col not in df.columns:
            if callable(default_val):
                df[col] = default_val()
            else:
                df[col] = default_val

    # Strip whitespace from string columns
    str_cols = df.select_dtypes(include=["object"]).columns
    for col in str_cols:
        df[col] = df[col].astype(str).str.strip()

    # Fill missing values
    numeric_cols = ["units_sold", "revenue", "profit_margin"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Cast units_sold to int
    df["units_sold"] = df["units_sold"].astype(int)
    df["revenue"] = df["revenue"].astype(float)
    df["profit_margin"] = df["profit_margin"].astype(float)

    # Format date as YYYY-MM-DD string or datetime.date
    if "date" in df.columns:
        parsed_dates = pd.to_datetime(df["date"], errors="coerce")
        # Replace unparseable dates with today
        parsed_dates = parsed_dates.fillna(pd.Timestamp(date.today()))
        df["date"] = parsed_dates.dt.date

    # Deduplicate by order_id
    df = df.drop_duplicates(subset=["order_id"], keep="first")

    return df


def dataframe_to_records(df: pd.DataFrame) -> List[dict]:
    """Convert cleaned dataframe into a list of dicts conforming to DataRecord schema."""
    records = []
    for _, row in df.iterrows():
        rec = {
            "order_id": str(row.get("order_id", "")),
            "date": row.get("date") if isinstance(row.get("date"), date) else date.today(),
            "region": str(row.get("region", "Global")),
            "category": str(row.get("category", "General")),
            "product": str(row.get("product", "Item")),
            "units_sold": int(row.get("units_sold", 0)),
            "revenue": float(row.get("revenue", 0.0)),
            "profit_margin": float(row.get("profit_margin", 0.0)),
            "customer_role": str(row.get("customer_role", "Consumer")),
        }
        records.append(rec)
    return records
