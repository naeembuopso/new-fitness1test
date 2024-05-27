from pydantic import BaseModel

class ChatRequest(BaseModel):
    conversation_id: str
    thread_id: str
    message: str = ''
