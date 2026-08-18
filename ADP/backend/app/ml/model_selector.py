import pandas as pd

try:
    from app.ml.preprocessing import clean_and_split_pipeline
except ImportError:
    from app.ml.preproccesing import clean_and_split_pipeline

from app.ml.regression import train_regression_model
from app.ml.classification import train_classification_model
from app.ml.clustering import train_clustering_model
from app.ml.forecasting import train_forecasting_model
from app.ml.recommendation_engine import generate_recommendations


class AutoModelSelector:

    @staticmethod
    def read_dataset(file_path: str):
        if file_path.endswith(".csv"):
            return pd.read_csv(file_path)

        if file_path.endswith(".xlsx") or file_path.endswith(".xls"):
            return pd.read_excel(file_path)

        raise ValueError("Unsupported file format. Please upload CSV or Excel file.")

    @staticmethod
    def find_target_column(df, target_column):
        if not target_column:
            return None

        target_column = str(target_column).strip()

        if target_column in df.columns:
            return target_column

        lower_map = {}

        for column in df.columns:
            lower_map[str(column).strip().lower()] = column

        target_lower = target_column.lower()

        if target_lower in lower_map:
            return lower_map[target_lower]

        raise ValueError(
            f"Target column '{target_column}' not found in dataset. "
            f"Available columns: {list(df.columns)}"
        )

    @staticmethod
    def decide_task_type(y, discovered_intent):
        discovered_intent = str(discovered_intent or "").lower().strip()

        if discovered_intent == "classification":
            return "classification"

        if discovered_intent == "regression":
            return "regression"

        if discovered_intent == "forecasting":
            return "forecasting"

        if discovered_intent == "clustering":
            return "clustering"

        if y.dtype == "object":
            return "classification"

        unique_count = y.nunique()

        if unique_count <= 15:
            return "classification"

        return "regression"

    @staticmethod
    def get_decision_reason(task_type):
        if task_type == "classification":
            return (
                "The target column is category-based or has limited unique values, "
                "so ADP AI selected Random Forest Classifier."
            )

        if task_type == "regression":
            return (
                "The target column is numeric and continuous, "
                "so ADP AI selected Random Forest Regressor."
            )

        if task_type == "forecasting":
            return (
                "The user requested future trend prediction, "
                "so ADP AI selected forecasting pipeline."
            )

        if task_type == "clustering":
            return (
                "The user requested grouping or segmentation, "
                "so ADP AI selected clustering pipeline."
            )

        return "ADP AI selected the suitable model based on dataset structure."

    @staticmethod
    def add_report_details(
        result,
        df,
        target_column,
        task_type,
        discovered_intent,
        decision_reason,
    ):
        result["dataset_details"] = {
            "total_rows": int(df.shape[0]),
            "total_columns": int(df.shape[1]),
            "columns": [str(column) for column in df.columns],
            "target_column": target_column,
        }

        result["model_selection"] = {
            "ai_detected_intent": discovered_intent,
            "final_task_type": task_type,
            "decision_reason": decision_reason,
        }

        try:
            recommendation_output = generate_recommendations(
                df=df,
                target_column=target_column,
                model_result=result,
            )

            result["recommendations"] = recommendation_output.get(
                "recommendations",
                [],
            )

            result["recommendation_sections"] = recommendation_output.get(
                "recommendation_sections",
                {},
            )

        except Exception as error:
            result["recommendations"] = [
                f"Recommendation engine could not complete analysis: {str(error)}"
            ]

            result["recommendation_sections"] = {
                "data_quality": [],
                "target_analysis": [],
                "domain_strategy": [],
                "goal_strategy": [],
            }

        result["prediction_flow"] = [
            "User uploaded dataset",
            "ADP AI read rows and columns",
            "ADP AI checked target column",
            "ADP AI cleaned missing values",
            "ADP AI prepared numeric and categorical features",
            "ADP AI selected suitable ML model",
            "Random Forest model trained using train-test split",
            "Model predictions generated",
            "Evaluation metrics calculated",
            "Feature importance generated",
            "Recommendation intelligence generated",
            "Prediction report prepared",
        ]

        result["report_ready"] = True

        return result
    @staticmethod
    def map_intent_and_train(file_path: str, target_column: str, discovered_intent: str) -> dict:
        df = AutoModelSelector.read_dataset(file_path)

        df.columns = [str(column).strip() for column in df.columns]

        discovered_intent = str(discovered_intent or "").lower().strip()

        if discovered_intent == "clustering":
            result = train_clustering_model(df)

            result["dataset_details"] = {
                "total_rows": int(df.shape[0]),
                "total_columns": int(df.shape[1]),
                "columns": [str(column) for column in df.columns],
                "target_column": "",
            }

            result["model_selection"] = {
                "ai_detected_intent": discovered_intent,
                "final_task_type": "clustering",
                "decision_reason": AutoModelSelector.get_decision_reason("clustering"),
            }

            result["report_ready"] = True

            return result

        final_target_column = AutoModelSelector.find_target_column(df, target_column)

        if not final_target_column:
            raise ValueError("Target column is required for prediction.")

        if discovered_intent == "forecasting":
            result = train_forecasting_model(df, final_target_column)

            return AutoModelSelector.add_report_details(
                result=result,
                df=df,
                target_column=final_target_column,
                task_type="forecasting",
                discovered_intent=discovered_intent,
                decision_reason=AutoModelSelector.get_decision_reason("forecasting"),
            )

        X, y = clean_and_split_pipeline(df, final_target_column)

        task_type = AutoModelSelector.decide_task_type(y, discovered_intent)

        if task_type == "classification":
            result = train_classification_model(X, y)

        elif task_type == "regression":
            result = train_regression_model(X, y)

        else:
            task_type = "regression"
            result = train_regression_model(X, y)

        return AutoModelSelector.add_report_details(
            result=result,
            df=df,
            target_column=final_target_column,
            task_type=task_type,
            discovered_intent=discovered_intent,
            decision_reason=AutoModelSelector.get_decision_reason(task_type),
        )