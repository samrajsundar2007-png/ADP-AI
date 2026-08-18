from pydantic import BaseModel
from typing import Optional

class UserModel(BaseModel):
    user_id: str
    username: str
    is_active: bool = True
