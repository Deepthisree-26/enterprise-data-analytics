from pathlib import Path
from pydantic_settings import BaseSettings

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_DB_PATH = (_BACKEND_DIR / "enterprise_data.db").as_posix()

class Settings(BaseSettings):
    # Core settings
    APP_NAME: str = "Enterprise Data Analytics & BI Platform"
    DEBUG: bool = True
    # JWT settings
    JWT_SECRET_KEY: str = "super-secret-key"  # In production, override via env variable
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    # Database URL (SQLite) - anchored to backend directory
    DATABASE_URL: str = f"sqlite:///{_DB_PATH}"
    # Ollama endpoint
    OLLAMA_URL: str = "http://localhost:11434/api/generate"
    # Model name for Ollama
    OLLAMA_MODEL: str = "llama3.2"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
