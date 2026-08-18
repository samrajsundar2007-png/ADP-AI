import os
import json
import urllib.request
import urllib.error
from pathlib import Path


def load_env_file():
    env_path = Path(__file__).resolve().parents[2] / ".env"

    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        line = line.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        os.environ[key] = value


load_env_file()


class GeminiEngine:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")

        print("GEMINI KEY PREFIX:", self.api_key[:6] if self.api_key else "NO KEY")
        print("GEMINI KEY LENGTH:", len(self.api_key) if self.api_key else 0)

    def route_intent_and_explain(
        self,
        user_query: str,
        dataset_metadata: dict,
        health_report: dict,
        trained_metrics: dict = None,
    ) -> dict:
        if not self.api_key:
            return {
                "intent": "regression",
                "target_column": dataset_metadata.get("column_names", [""])[-1],
                "explanation": "Gemini API key missing. Please add GEMINI_API_KEY in backend/.env file.",
            }

        system_instruction = """
        You are an advanced expert Automated AI Data Architect.

        Reply ONLY as valid JSON with exactly these keys:
        {
          "intent": "regression | classification | clustering | forecasting",
          "target_column": "column name or empty string",
          "explanation": "short explanation"
        }

        Rules:
        - intent must be one of: regression, classification, clustering, forecasting
        - If the user asks to predict a numeric value, use regression
        - If the user asks to classify categories like yes/no, pass/fail, placement, churn, use classification
        - If the user asks to group records, use clustering
        - If the user asks future trend over time, use forecasting
        - If clustering, target_column must be empty
        """

        prompt = f"""
        User Request:
        {user_query}

        Dataset Structure:
        Columns: {dataset_metadata.get("column_names")}
        Numeric features: {dataset_metadata.get("types", {}).get("numeric")}
        Categorical features: {dataset_metadata.get("types", {}).get("categorical")}
        Missing values: {health_report.get("missing_values")}

        Previously Computed Pipeline Metrics:
        {json.dumps(trained_metrics, default=str) if trained_metrics else "None computed yet."}
        """

        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

        payload = {
            "systemInstruction": {
                "parts": [
                    {"text": system_instruction}
                ]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        data = json.dumps(payload).encode("utf-8")

        request = urllib.request.Request(
            url=url,
            data=data,
            method="POST",
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": self.api_key,
            },
        )

        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                response_body = response.read().decode("utf-8")
                result = json.loads(response_body)

            text = result["candidates"][0]["content"]["parts"][0]["text"]

            return json.loads(text)

        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8")
            return {
                "intent": "regression",
                "target_column": dataset_metadata.get("column_names", [""])[-1],
                "explanation": f"Gemini API HTTP error: {e.code} - {error_body}",
            }

        except Exception as e:
            return {
                "intent": "regression",
                "target_column": dataset_metadata.get("column_names", [""])[-1],
                "explanation": f"Structural analytical mapping engine pipeline fallback: {str(e)}",
            }