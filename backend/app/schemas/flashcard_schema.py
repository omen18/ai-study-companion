"""Flashcard schemas."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class FlashcardBase(BaseModel):
    question: str
    answer: str


class FlashcardCreate(FlashcardBase):
    pass


class FlashcardOut(FlashcardBase):
    id: int
    deck_id: int
    ease: int
    last_reviewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DeckCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    source_note_id: Optional[int] = None
    cards: List[FlashcardCreate] = []


class DeckOut(BaseModel):
    id: int
    user_id: int
    name: str
    source_note_id: Optional[int] = None
    created_at: datetime
    cards: List[FlashcardOut] = []

    class Config:
        from_attributes = True


class GenerateDeckRequest(BaseModel):
    note_id: int
    name: Optional[str] = None
    count: int = Field(8, ge=1, le=30)


class ReviewRequest(BaseModel):
    rating: str = Field(..., pattern="^(again|good|easy)$")
