import os
import pandas as pd
from fastapi import UploadFile
from app.core.config import settings

class DatasetService:
    @staticmethod
    def process_and_save(file: UploadFile, unique_id: str) -> dict:
        save_path = os.path.join(settings.UPLOAD_DIR, unique_id)
        with open(save_path, "wb") as buffer:
            buffer.write(file.file.read())
            
        df = pd.read_csv(save_path)
        suggested = "classification" if df.iloc[:, -1].nunique() < 15 else "regression"
        
        return {
            "rows": len(df),
            "columns": len(df.columns),
            "suggested_task": suggested
        }
