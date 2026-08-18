import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

class Settings(BaseSettings):
    PROJECT_NAME: str = "ADP-AI Platform"
    API_V1_STR: str = "/api"
    
    # Security Configurations
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB Maximum
    ALLOWED_EXTENSIONS: set = {"csv", "xlsx"}
    
    # Environment Variables (Sourced from backend/app/.env)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/adpai")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Workspace Directory Constants
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    REPORT_DIR: str = os.path.join(BASE_DIR, "reports")

settings = Settings()

# Bootstrap filesystem infrastructure
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.REPORT_DIR, exist_ok=True)
