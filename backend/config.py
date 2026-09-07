import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "fallback-dev-secret-key")
    # Automatically uses PostgreSQL if available in env (Render/Vercel), defaults to SQLite locally
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///students.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False