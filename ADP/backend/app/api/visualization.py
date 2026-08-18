from fastapi import APIRouter

router = APIRouter()

@router.get("/visualization/schema")
async def get_visualization_rendering_schema():
    return {"plots_supported": ["scatter", "bar", "matrix_heatmaps"]}
