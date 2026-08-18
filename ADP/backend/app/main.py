import os
import uvicorn
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from google.oauth2 import id_token
from google.auth.transport import requests
from jose import jwt

from app.database.session import engine, Base
from app.api import upload, chat, prediction, report, prediction_manager

load_dotenv()

# Auto create database tables upon server startup initialization
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ADP-AI Multi-Task Predictive Framework Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
print("BACKEND GOOGLE CLIENT ID:", GOOGLE_CLIENT_ID)
SECRET_KEY = os.getenv("SECRET_KEY", "adp_ai_secret_key_12345")
ALGORITHM = "HS256"


class GoogleToken(BaseModel):
    token: str


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@app.post("/auth/google")
async def google_login(payload: GoogleToken):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_CLIENT_ID missing in backend .env file"
        )

    try:
        idinfo = id_token.verify_oauth2_token(
            payload.token,
            requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")
        google_id = idinfo.get("sub")

        if not email:
            raise HTTPException(status_code=400, detail="Email not found from Google account")

        access_token = create_access_token({
            "sub": email,
            "name": name,
            "google_id": google_id
        })

        return {
            "message": "Google login successful",
            "access_token": access_token,
            "user": {
                "email": email,
                "name": name,
                "picture": picture,
                "google_id": google_id
            }
        }

    except ValueError as e:
        print("GOOGLE TOKEN VERIFY ERROR:", e)
        raise HTTPException(status_code=401, detail="Invalid Google token")


# Route Mounting Layout Core Setup
app.include_router(upload.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(prediction.router, prefix="/api")
app.include_router(report.router, prefix="/api")
app.include_router(prediction_manager.router, prefix="/api")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)