from pydantic import BaseModel

class ReportModel(BaseModel):
    report_id: str
    dataset_id: str
    file_path: str
