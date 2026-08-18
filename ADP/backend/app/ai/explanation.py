def explain_metrics(metrics: dict) -> str:
    return f"The algorithm trained with a score density of {metrics.get('accuracy', metrics.get('r2_score', 'N/A'))}."
