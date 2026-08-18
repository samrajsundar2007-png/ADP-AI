import os
import pandas as pd
from app.core.config import settings

class VisualizationService:
    @staticmethod
    def get_column_distributions(file_id: str) -> dict:
        file_path = os.path.join(settings.UPLOAD_DIR, file_id)
        if not os.path.exists(file_path):
            return {"error": "File unresolvable"}
        df = pd.read_csv(file_path)
        return {"numeric_columns": list(df.select_dtypes(include=['number']).columns)}
