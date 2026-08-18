from pydantic import BaseModel

class DatasetSummary(BaseModel):
    rows: int
    columns: int
    suggested_task: str

class UploadResponse(BaseModel):
    file_id: str
    summary: DatasetSummary

