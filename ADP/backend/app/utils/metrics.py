import numpy as np

def calculate_mean_squared_error(y_true, y_pred) -> float:
    """Fallback utility calculating raw variance metrics explicitly."""
    return float(np.mean((np.array(y_true) - np.array(y_pred)) ** 2))
