import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import get_db
from app.models.database_models import Dataset, SystemLog
from app.ml.preprocessing import run_automated_analysis

router = APIRouter()

@router.post("/upload")
async def handle_dataset_upload(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Hackathon Security Validation Rules
    ext = file.filename.split(".")[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Malicious or unsupported matrix file format detected.")

    generated_id = str(uuid.uuid4())
    filename = f"{generated_id}_{file.filename}"
    save_path = os.path.join(settings.UPLOAD_DIR, filename)

    # Stream write to enforce maximum threshold constraints safely
    file_size = 0
    with open(save_path, "wb") as buffer:
        while chunk := await file.read(8192):
            file_size += len(chunk)
            if file_size > settings.MAX_FILE_SIZE:
                os.remove(save_path)
                raise HTTPException(status_code=413, detail="File volume index exceeds 50MB runtime allowances.")
            buffer.write(chunk)

    try:
        # Auto-compute immediate Dataset Health Report
        meta_summary, health_report = run_automated_analysis(save_path)
        
        # Save structural entries cleanly to database tables
        new_record = Dataset(
            id=generated_id,
            filename=file.filename,
            file_path=save_path,
            metadata_summary=meta_summary,
            health_report=health_report
        )
        db.add(new_record)
        db.commit()

        return {"file_id": generated_id, "summary": meta_summary, "health_report": health_report}
    except Exception as e:
        if os.path.exists(save_path):
            os.remove(save_path)
        raise HTTPException(status_code=500, detail=f"Computational tracking pipeline failure: {str(e)}")
