from pydantic import BaseModel
from typing import List, Dict

class ChatHistoryModel(BaseModel):
    session_id: str
    dataset_id: str
    history_log: List[Dict[str, str]] = []
