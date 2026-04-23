"""Notes / chat / progress schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# --- Notes ---
class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: str = ""
    subject: Optional[str] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    subject: Optional[str] = None


class NoteOut(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Chat ---
class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    note_id: Optional[int] = None  # if the chat is grounded in a specific note


class ChatResponse(BaseModel):
    reply: str


# --- Progress ---
class ProgressBase(BaseModel):
    topic: str
    completion: float = Field(0.0, ge=0.0, le=1.0)
    score: float = Field(0.0, ge=0.0, le=100.0)


class ProgressCreate(ProgressBase):
    pass


class ProgressOut(ProgressBase):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True
