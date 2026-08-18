from pydantic import BaseModel
from typing import Dict, Any

class PredictionModel(BaseModel):
    prediction_id: str
    dataset_id: str
    target_column: str
    output_metrics: Dict[str, Any]
