from fastapi import APIRouter

router = APIRouter()

@router.post("/auth/handshake")
async def system_node_handshake():
    return {"authenticated": True, "token_type": "bearer"}
