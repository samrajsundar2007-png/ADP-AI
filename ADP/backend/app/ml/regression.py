import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import (
    r2_score,
    mean_absolute_error,
    mean_squared_error,
)
from sklearn.model_selection import train_test_split


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


def train_regression_model(X, y):
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )

    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1,
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    r2 = r2_score(y_test, preds)
    mae = mean_absolute_error(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    rmse = float(np.sqrt(mse))

    accuracy_for_ui = round(max(0, min(100, float(r2) * 100)), 2)

    feature_importance = get_feature_importance(model, X)

    prediction_samples = []

    for actual, predicted in zip(list(y_test.head(10)), list(preds[:10])):
        prediction_samples.append(
            {
                "actual": round(float(actual), 4),
                "predicted": round(float(predicted), 4),
            }
        )

    return {
        "algorithm": "Random Forest Regressor",
        "model_type": "regression",
        "accuracy_score": accuracy_for_ui,

        "metrics": {
            "R2 Score": round(float(r2), 4),
            "Mean Absolute Error": round(float(mae), 4),
            "Root Mean Squared Error": round(float(rmse), 4),
            "Training Rows": int(len(X_train)),
            "Testing Rows": int(len(X_test)),
        },

        "feature_importance": feature_importance,

        "prediction_samples": prediction_samples,

        "chart_data": {
            "labels": [item["feature"] for item in feature_importance],
            "values": [item["importance"] for item in feature_importance],
            "chart_type": "bar",
            "title": "Random Forest Feature Importance",
        },

        "report_summary": {
            "model_used": "Random Forest Regressor",
            "explanation": "This model predicts continuous numeric target values such as marks, price, sales, salary, CGPA, or amount.",
            "why_random_forest": "Random Forest Regressor learns non-linear relationships and gives feature importance for better explainability.",
        },
    }