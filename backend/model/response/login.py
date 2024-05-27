from typing import Optional

from pydantic import BaseModel


class LoginResponse(BaseModel):
    status: str
    access_token: str
    token_type: str
    expires_in: int  # Time in seconds until the token expires
    username: Optional[int] = None  # Optional user-related information
