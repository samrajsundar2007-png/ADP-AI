from pydantic import BaseModel

class ChatRequestSchema(BaseModel):
    file_id: str
    message: str

class ChatResponseSchema(BaseModel):
    response: str
