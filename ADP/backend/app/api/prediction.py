import json
import uuid
from pathlib import Path

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.database_models import Dataset
from app.ml.model_selector import AutoModelSelector


router = APIRouter()


BASE_DIR = Path(__file__).resolve().parents[2]
REPORT_DIR = BASE_DIR / "reports"
REPORT_DIR.mkdir(exist_ok=True)


class DirectPredictPayload(BaseModel):
    file_id: str
    target_column: str
    task_type: str


def save_prediction_report(results: dict):
    report_id = str(uuid.uuid4())

    results["report_id"] = report_id
    results["report_download_url"] = f"/api/report/download/{report_id}"

    report_path = REPORT_DIR / f"{report_id}.json"

    with open(report_path, "w", encoding="utf-8") as file:
        json.dump(results, file, indent=2, ensure_ascii=False)

    return results


@router.post("/predict")
async def execute_explicit_prediction(
    payload: DirectPredictPayload,
    db: Session = Depends(get_db),
):
    record = db.query(Dataset).filter(Dataset.id == payload.file_id).first()

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Dataset record not found.",
        )

    file_path = record.file_path

    if not file_path:
        raise HTTPException(
            status_code=404,
            detail="Dataset file path missing.",
        )

    try:
        results = AutoModelSelector.map_intent_and_train(
            file_path=file_path,
            target_column=payload.target_column,
            discovered_intent=payload.task_type,
        )

        results = save_prediction_report(results)

        return results

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )