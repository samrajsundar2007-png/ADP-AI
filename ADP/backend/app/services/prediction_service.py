from app.ml.model_selector import AutomatedModelSelector

class PredictionService:
    @staticmethod
    def execute_ml_pipeline(file_id: str, target: str) -> dict:
        selector = AutomatedModelSelector(file_id, target)
        return selector.process()
