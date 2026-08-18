import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split


def can_use_stratify(y):
    try:
        value_counts = pd.Series(y).value_counts()
        return len(value_counts) > 1 and value_counts.min() >= 2
    except Exception:
        return False


def get_feature_importance(model, X):
    feature_names = list(X.columns)

    importance_data = []

    for feature, importance in zip(feature_names, model.feature_importances_):
        importance_data.append(
            {
                "feature": str(feature),
                "importance": round(float(importance), 6),
            }
        )

    importance_data = sorted(
        importance_data,
        key=lambda item: item["importance"],
        reverse=True,
    )

    return importance_data[:15]


def train_classification_model(X, y):
    stratify_value = y if can_use_stratify(y) else None

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

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    accuracy = accuracy_score(y_test, preds)
    precision = precision_score(y_test, preds, average="weighted", zero_division=0)
    recall = recall_score(y_test, preds, average="weighted", zero_division=0)
    f1 = f1_score(y_test, preds, average="weighted", zero_division=0)

    feature_importance = get_feature_importance(model, X)

    prediction_samples = []

    for actual, predicted in zip(list(y_test.head(10)), list(preds[:10])):
        prediction_samples.append(
            {
                "actual": str(actual),
                "predicted": str(predicted),
            }
        )

    return {
        "algorithm": "Random Forest Classifier",
        "model_type": "classification",
        "accuracy_score": round(float(accuracy) * 100, 2),

        "metrics": {
            "Accuracy": round(float(accuracy), 4),
            "Precision Weighted": round(float(precision), 4),
            "Recall Weighted": round(float(recall), 4),
            "F1 Score Weighted": round(float(f1), 4),
            "Training Rows": int(len(X_train)),
            "Testing Rows": int(len(X_test)),
        },

        "feature_importance": feature_importance,

        "prediction_samples": prediction_samples,

        "chart_data": {
            "labels": [item["feature"] for item in feature_importance],
            "values": [item["importance"] for item in feature_importance],
            "chart_type": "horizontalBar",
            "title": "Random Forest Feature Importance",
        },

        "report_summary": {
            "model_used": "Random Forest Classifier",
            "explanation": "This model predicts category-based target values such as Yes/No, Pass/Fail, Placed/Not Placed, or High/Medium/Low.",
            "why_random_forest": "Random Forest combines many decision trees and gives stable predictions with feature importance.",
        },
    }