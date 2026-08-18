from pydantic import BaseModel
from typing import List

class DatasetMetadataSchema(BaseModel):
    file_id: str
    columns: List[str]
    row_count: int
