import json
import uuid
from pathlib import Path

import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parents[2]
REPORT_DIR = BASE_DIR / "reports"
REPORT_DIR.mkdir(exist_ok=True)


def make_one_hot_encoder():
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


def clean_dataframe(df):
    df = df.copy()

    df.columns = [str(column).strip() for column in df.columns]

    for column in df.columns:
        if df[column].dtype == "object":
            df[column] = df[column].astype(str).str.strip()
            df[column] = df[column].replace(["", "nan", "NaN", "None"], np.nan)

    return df


def detect_task_type(target_series, user_intent=None):
    if user_intent in ["regression", "classification"]:
        return user_intent

    clean_target = target_series.dropna()

    if clean_target.empty:
        return "classification"

    if pd.api.types.is_numeric_dtype(clean_target):
        unique_count = clean_target.nunique()

        if unique_count <= 10:
            return "classification"

        return "regression"

    return "classification"


def build_preprocessor(X):
    numeric_columns = X.select_dtypes(include=["number"]).columns.tolist()
    categorical_columns = X.select_dtypes(exclude=["number"]).columns.tolist()

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", make_one_hot_encoder()),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", numeric_pipeline, numeric_columns),
            ("categorical", categorical_pipeline, categorical_columns),
        ],
        remainder="drop",
    )

    return preprocessor, numeric_columns, categorical_columns


def get_feature_names(model_pipeline):
    try:
        return model_pipeline.named_steps["preprocessor"].get_feature_names_out().tolist()
    except Exception:
        return []


def get_feature_importance(model_pipeline):
    model = model_pipeline.named_steps["model"]
    feature_names = get_feature_names(model_pipeline)

    if not hasattr(model, "feature_importances_"):
        return []

    importances = model.feature_importances_

    result = []

    for index, importance in enumerate(importances):
        if index < len(feature_names):
            feature_name = feature_names[index]
        else:
            feature_name = f"feature_{index + 1}"

        clean_name = (
            feature_name.replace("numeric__", "")
            .replace("categorical__", "")
            .replace("encoder__", "")
        )

        result.append(
            {
                "feature": clean_name,
                "importance": round(float(importance), 6),
            }
        )

    result = sorted(result, key=lambda item: item["importance"], reverse=True)

    return result[:15]


def train_random_forest_prediction(df, target_column, user_intent=None):
    df = clean_dataframe(df)

    if target_column not in df.columns:
        raise ValueError(f"Target column '{target_column}' not found in dataset.")

    df = df.dropna(subset=[target_column])

    if len(df) < 10:
        raise ValueError("Dataset is too small for reliable prediction. Minimum 10 rows needed.")

    X = df.drop(columns=[target_column])
    y = df[target_column]

    task_type = detect_task_type(y, user_intent)

    preprocessor, numeric_columns, categorical_columns = build_preprocessor(X)

    if task_type == "regression":
        model = RandomForestRegressor(
            n_estimators=300,
            random_state=42,
            n_jobs=-1,
        )

        algorithm_name = "Random Forest Regressor"

    else:
        model = RandomForestClassifier(
            n_estimators=300,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )

        algorithm_name = "Random Forest Classifier"

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    stratify_value = None

    if task_type == "classification" and y.nunique() > 1:
        stratify_value = y

    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=stratify_value,
        )
    except Exception:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
        )

    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)

    if task_type == "regression":
        mae = mean_absolute_error(y_test, predictions)
        mse = mean_squared_error(y_test, predictions)
        rmse = float(np.sqrt(mse))
        r2 = r2_score(y_test, predictions)

        metrics = {
            "r2_score": round(float(r2), 4),
            "mae": round(float(mae), 4),
            "rmse": round(float(rmse), 4),
        }

        accuracy_score_for_ui = round(max(0, min(100, float(r2) * 100)), 2)

    else:
        accuracy = accuracy_score(y_test, predictions)
        f1 = f1_score(y_test, predictions, average="weighted", zero_division=0)
        precision = precision_score(y_test, predictions, average="weighted", zero_division=0)
        recall = recall_score(y_test, predictions, average="weighted", zero_division=0)

        metrics = {
            "accuracy": round(float(accuracy), 4),
            "f1_score": round(float(f1), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4),
        }

        accuracy_score_for_ui = round(float(accuracy) * 100, 2)

    feature_importance = get_feature_importance(pipeline)

    prediction_samples = []

    y_test_list = list(y_test.head(10))
    prediction_list = list(predictions[:10])

    for actual, predicted in zip(y_test_list, prediction_list):
        prediction_samples.append(
            {
                "actual": str(actual),
                "predicted": str(predicted),
            }
        )

    report_id = str(uuid.uuid4())

    report = {
        "report_id": report_id,
        "model_name": "Random Forest",
        "algorithm": algorithm_name,
        "task_type": task_type,
        "target_column": target_column,
        "total_rows": int(len(df)),
        "total_columns": int(len(df.columns)),
        "training_rows": int(len(X_train)),
        "testing_rows": int(len(X_test)),
        "numeric_features": numeric_columns,
        "categorical_features": categorical_columns,
        "metrics": metrics,
        "accuracy_score": accuracy_score_for_ui,
        "feature_importance": feature_importance,
        "prediction_samples": prediction_samples,
        "recommendations": [
            "Use more clean rows to improve prediction stability.",
            "Reduce missing values in important columns.",
            "Check top feature importance columns before final decision.",
            "Avoid ID, name, or phone-number columns as prediction features.",
        ],
        "chart_data": {
            "title": "Random Forest Feature Importance",
            "labels": [item["feature"] for item in feature_importance],
            "values": [item["importance"] for item in feature_importance],
        },
    }

    report_path = REPORT_DIR / f"{report_id}.json"

    with open(report_path, "w", encoding="utf-8") as file:
        json.dump(report, file, indent=2, ensure_ascii=False)

    report["download_report_file"] = str(report_path)

    return report