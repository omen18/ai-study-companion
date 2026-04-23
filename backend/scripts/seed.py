"""Populate the database with a demo user and sample content.

Run from the backend/ directory:

    python scripts/seed.py

Creates:
    email:    demo@aisc.dev
    password: demodemo
"""
from __future__ import annotations

import sys
from datetime import date, timedelta
from pathlib import Path

# Allow running as a script from backend/
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.database import Base, SessionLocal, engine  # noqa: E402
from app.models.activity import Activity  # noqa: E402
from app.models.flashcard import Deck, Flashcard  # noqa: E402
from app.models.notes import Note  # noqa: E402
from app.models.progress import Progress  # noqa: E402
from app.models.user import User  # noqa: E402
from app.utils.helpers import hash_password  # noqa: E402


DEMO_EMAIL = "demo@aisc.dev"
DEMO_PASSWORD = "demodemo"


def run() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if user:
            print(f"Demo user {DEMO_EMAIL} already exists (id={user.id}).")
            return

        user = User(
            email=DEMO_EMAIL,
            username="demo",
            hashed_password=hash_password(DEMO_PASSWORD),
        )
        db.add(user)
        db.flush()

        note = Note(
            user_id=user.id,
            title="Photosynthesis basics",
            subject="Biology",
            content=(
                "Photosynthesis converts light energy into chemical energy stored in glucose. "
                "It happens in the chloroplasts of plant cells. "
                "The two stages are the light-dependent reactions and the Calvin cycle."
            ),
        )
        db.add(note)
        db.flush()

        deck = Deck(user_id=user.id, name="Photosynthesis starter deck", source_note_id=note.id)
        db.add(deck)
        db.flush()
        db.add_all([
            Flashcard(deck_id=deck.id, question="Where does photosynthesis occur?", answer="Chloroplasts"),
            Flashcard(deck_id=deck.id, question="Name the two main stages.", answer="Light-dependent reactions and the Calvin cycle"),
            Flashcard(deck_id=deck.id, question="What molecule stores the chemical energy produced?", answer="Glucose"),
        ])

        db.add_all([
            Progress(user_id=user.id, topic="Biology: Photosynthesis", completion=0.3, score=72),
            Progress(user_id=user.id, topic="Math: Linear Algebra", completion=0.55, score=81),
            Progress(user_id=user.id, topic="CS: Data Structures", completion=0.8, score=90),
        ])

        today = date.today()
        for i in range(7):
            db.add(Activity(user_id=user.id, day=today - timedelta(days=i), minutes=20 + i, cards_reviewed=5))

        db.commit()
        print(f"Seeded demo user. Login with {DEMO_EMAIL} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    run()
