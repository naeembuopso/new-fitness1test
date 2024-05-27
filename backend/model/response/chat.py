from pydantic import BaseModel


class MessageResponse(BaseModel):
    conversation_id: str
    thread_id: str
    reply: str
    access_token: str