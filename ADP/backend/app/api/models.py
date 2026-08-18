from fastapi import APIRouter

router = APIRouter()

@router.get("/models/supported")
async def list_supported_algorithms():
    return {"models": ["LinearRegression", "RandomForestClassifier", "KMeans", "IsolationForest"]}
