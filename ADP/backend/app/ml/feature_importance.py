from sklearn.ensemble import RandomForestRegressor

def calculate_feature_importance(X, y):
    X_numeric = X.select_dtypes(include=['int64', 'float64'])
    if X_numeric.empty:
        return {}
        
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X_numeric, y)
    
    importances = {}
    for col, score in zip(X_numeric.columns, model.feature_importances_):
        importances[col] = round(float(score), 4)
        
    return dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))
