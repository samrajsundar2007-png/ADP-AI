from fastapi import APIRouter
from app.database.database import file_registry_db

router = APIRouter()

@router.get("/datasets/{file_id}")
async def get_dataset_metadata_index(file_id: str):
    return file_registry_db.get_file_meta(file_id)
