from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.database_models import Dataset, ChatHistory, PredictionJob
from app.ai.llm import GeminiEngine
from app.ml.model_selector import AutoModelSelector

router = APIRouter()
gemini = GeminiEngine()

class ChatPayload(BaseModel):
    file_id: str
    message: str

@router.post("/chat")
async def execute_intelligent_chat(payload: ChatPayload, db: Session = Depends(get_db)):
    record = db.query(Dataset).filter(Dataset.id == payload.file_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Active dataset identity hash reference unresolvable.")

    # 1. Ask Gemini to read user query and determine intent + target column
    intent_analysis = gemini.route_intent_and_explain(payload.message, record.metadata_summary, record.health_report)
    
    discovered_intent = intent_analysis.get("intent", "regression")
    target_column = intent_analysis.get("target_column")

    # Fallback to last column if empty and not clustering
    if not target_column and discovered_intent != "clustering":
        target_column = record.metadata_summary.get("column_names", [""])[-1]

    # 2. Train selected ML model dynamically based on routed intent
    try:
        ml_results = AutoModelSelector.map_intent_and_train(record.file_path, target_column, discovered_intent)
    except Exception as e:
        # Fallback to clustering if target resolution threw errors
        ml_results = AutoModelSelector.map_intent_and_train(record.file_path, "", "clustering")

    # 3. Ask Gemini to formulate the tailored explanation with the actual metrics
    final_analysis = gemini.route_intent_and_explain(
        payload.message, 
        record.metadata_summary, 
        record.health_report, 
        trained_metrics=ml_results
    )

    # 4. Update Chat Log tables to maintain chronological tracking
    db.add(ChatHistory(dataset_id=payload.file_id, role="user", content=payload.message))
    db.add(ChatHistory(dataset_id=payload.file_id, role="assistant", content=final_analysis.get("explanation")))
    
    # Log job artifact footprint
    db.add(PredictionJob(
        dataset_id=payload.file_id, 
        target_column=target_column or "N/A", 
        task_type=discovered_intent, 
        metrics=ml_results
    ))
    db.commit()

    return {
        "explanation": final_analysis.get("explanation"),
        "model_results": ml_results  # Contains engine, scores, and complete frontend graphing coordinates
    }
