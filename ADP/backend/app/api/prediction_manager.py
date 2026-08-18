from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.database_models import Dataset, PredictionJob

router = APIRouter()

@router.get("/datasets")
async def list_active_datasets(db: Session = Depends(get_db)):
    entries = db.query(Dataset).all()
    return [{"id": e.id, "filename": e.filename, "metadata": e.metadata_summary} for e in entries]

@router.get("/models")
async def list_historical_trained_models(db: Session = Depends(get_db)):
    jobs = db.query(PredictionJob).all()
    return [{"job_id": j.id, "dataset_id": j.dataset_id, "task": j.task_type, "metrics": j.metrics} for j in jobs]

@router.delete("/dataset/{id}")
async def flush_dataset_instance(id: str, db: Session = Depends(get_db)):
    record = db.query(Dataset).filter(Dataset.id == id).first()
    if record:
        db.delete(record)
        db.commit()
        return {"success": True, "message": "Dataset cleared from storage nodes."}
    return {"success": False, "message": "Record target unresolvable."}
