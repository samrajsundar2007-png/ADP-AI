from pydantic import BaseModel
from typing import Dict, Any

class DatasetModel(BaseModel):
    id: str
    filename: str
    metadata_summary: Dict[str, Any]
