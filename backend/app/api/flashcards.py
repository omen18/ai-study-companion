"""Flashcard deck + review routes."""
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.flashcard import Deck, Flashcard
from app.models.notes import Note
from app.models.user import User
from app.schemas.flashcard_schema import (
    DeckCreate,
    DeckOut,
    FlashcardOut,
    GenerateDeckRequest,
    ReviewRequest,
)
from app.services.flashcard_service import generate_flashcards

router = APIRouter()


@router.get("", response_model=List[DeckOut])
def list_decks(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(Deck)
        .filter(Deck.user_id == user.id)
        .order_by(Deck.created_at.desc())
        .all()
    )


@router.post("", response_model=DeckOut, status_code=status.HTTP_201_CREATED)
def create_deck(
    payload: DeckCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    deck = Deck(user_id=user.id, name=payload.name, source_note_id=payload.source_note_id)
    db.add(deck)
    db.flush()
    for c in payload.cards:
        db.add(Flashcard(deck_id=deck.id, question=c.question, answer=c.answer))
    db.commit()
    db.refresh(deck)
    return deck


@router.post("/generate", response_model=DeckOut, status_code=status.HTTP_201_CREATED)
def generate_deck(
    payload: GenerateDeckRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """AI-generate a deck from an existing note."""
    note = (
        db.query(Note)
        .filter(Note.id == payload.note_id, Note.user_id == user.id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    cards = generate_flashcards(note.content or "", count=payload.count)
    if not cards:
        raise HTTPException(status_code=400, detail="Could not generate cards from this note")

    deck = Deck(
        user_id=user.id,
        name=payload.name or f"{note.title} — flashcards",
        source_note_id=note.id,
    )
    db.add(deck)
    db.flush()
    for c in cards:
        db.add(Flashcard(deck_id=deck.id, question=c["question"], answer=c["answer"]))
    db.commit()
    db.refresh(deck)
    return deck


@router.get("/{deck_id}", response_model=DeckOut)
def get_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    return deck


@router.delete("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    db.delete(deck)
    db.commit()
    return None


@router.post("/cards/{card_id}/review", response_model=FlashcardOut)
def review_card(
    card_id: int,
    payload: ReviewRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    card = (
        db.query(Flashcard)
        .join(Deck, Flashcard.deck_id == Deck.id)
        .filter(Flashcard.id == card_id, Deck.user_id == user.id)
        .first()
    )
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    delta = {"again": -1, "good": 1, "easy": 2}[payload.rating]
    card.ease = (card.ease or 0) + delta
    card.last_reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(card)
    return card
