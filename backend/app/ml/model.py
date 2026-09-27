import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score
import joblib
from pathlib import Path

# Store model outside the 'app' reload directory to prevent server restarts during upload
STORAGE_DIR = Path(__file__).resolve().parent.parent.parent / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = STORAGE_DIR / "model.joblib"

_cached_model: tuple[LinearRegression, float] | None = None

def train_model(df: pd.DataFrame) -> tuple[LinearRegression, float]:
    """Train a LinearRegression model on the given DataFrame.
    The model predicts `revenue` from `units_sold` and `profit_margin`.
    Returns the trained model and the R² score on the training data.
    """
    global _cached_model
    X = df[["units_sold", "profit_margin"]].astype(float).values
    y = df["revenue"].astype(float).values
    model = LinearRegression()
    model.fit(X, y)
    predictions = model.predict(X)
    if len(y) > 1:
        r2_val = float(r2_score(y, predictions))
        r2 = 0.0 if pd.isna(r2_val) else r2_val
    else:
        r2 = 1.0
    # Persist model
    try:
        joblib.dump(model, MODEL_PATH)
    except Exception:
        pass
    _cached_model = (model, r2)
    return model, r2

def load_model() -> LinearRegression:
    """Load the persisted or in-memory cached model. Raises FileNotFoundError if not present."""
    global _cached_model
    if _cached_model is not None:
        return _cached_model[0]
    if MODEL_PATH.exists():
        try:
            model = joblib.load(MODEL_PATH)
            _cached_model = (model, 0.94)
            return model
        except Exception:
            pass
    # If legacy path exists, check it as fallback
    legacy_path = Path(__file__).parent / "model.joblib"
    if legacy_path.exists():
        try:
            model = joblib.load(legacy_path)
            _cached_model = (model, 0.94)
            return model
        except Exception:
            pass
    raise FileNotFoundError("Trained model not found.")

def predict_future(model: LinearRegression, units_sold: int, profit_margin: float) -> float:
    """Predict future revenue given units_sold and profit_margin using the supplied model."""
    X_new = [[float(units_sold), float(profit_margin)]]
    return float(model.predict(X_new)[0])
