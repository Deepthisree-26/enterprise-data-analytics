import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
# Import all model modules so that tables are registered on Base.metadata
from app.auth import models as auth_models
from app.data import models as data_models
from app.data import department_models as dept_models
from app.data import admin_models
from app.seed import seed_database

# Ensure database tables exist and default users are ready (no demo data)
Base.metadata.create_all(bind=engine)
try:
    seed_database()
except Exception as e:
    print(f"Warning: Database user check encountered: {e}")

from app.auth.routes import router as auth_router
from app.api import upload, predict, ai_chat, reports, kpis, data_records, admin, ingestion_routes, analytics_routes

app = FastAPI(title="Enterprise Data Analytics & BI Platform", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(ingestion_routes.router, prefix="/api", tags=["ingestion"])
app.include_router(analytics_routes.router, prefix="/api", tags=["analytics"])
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(predict.router, prefix="/api", tags=["predict"])
app.include_router(ai_chat.router, prefix="/api", tags=["ai-chat"])
app.include_router(reports.router, prefix="/api", tags=["reports"])
app.include_router(kpis.router, prefix="/api", tags=["kpis"])
app.include_router(data_records.router, prefix="/api", tags=["data-records"])
app.include_router(admin.router, prefix="/api", tags=["admin"])

# Root endpoint for health check
@app.get("/", tags=["root"])
async def read_root():
    return {"message": "Enterprise Data Analytics & BI Platform is running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
