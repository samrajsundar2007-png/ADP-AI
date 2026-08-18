import os
import pandas as pd
from app.core.config import settings
from app.ai.llm import llm_client

class ChatService:
    @staticmethod
    def consult_with_context(file_id: str, query: str) -> str:
        file_path = os.path.join(settings.UPLOAD_DIR, file_id)
        if not os.path.exists(file_path):
            return "Dataset active profile reference lost."
            
        df = pd.read_csv(file_path)
        schema_context = f"Columns available: {list(df.columns)}. Summary: {df.head(2).to_string()}"
        return llm_client.generate_response(schema_context, query)
