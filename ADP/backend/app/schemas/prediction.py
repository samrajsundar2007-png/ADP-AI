from pydantic import BaseModel
from typing import Optional, Dict, Any

class PredictionRequestSchema(BaseModel):
    file_id: str
    target_column: str

class PredictionResponseSchema(BaseModel):
    algorithm: str
    accuracy: Optional[float] = None
    r2_score: Optional[float] = None
    f1_score: Optional[float] = None
    mae: Optional[float] = None
