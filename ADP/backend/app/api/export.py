from fastapi import APIRouter

router = APIRouter()

@router.post("/export/artifacts")
async def export_pipeline_artifacts():
    return {"message": "Model serialization payload archived."}
