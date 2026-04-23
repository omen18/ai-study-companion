"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import Base, engine
from app.api import activity, auth, chat, flashcards, notes, progress

# Create tables on startup (for dev convenience — use Alembic in prod)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="0.2.0",
    description=(
        "An AI-powered study companion — chat, notes, flashcards, "
        "progress tracking, and study streaks."
    ),
)

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(notes.router, prefix="/notes", tags=["notes"])
app.include_router(progress.router, prefix="/progress", tags=["progress"])
app.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
app.include_router(activity.router, prefix="/activity", tags=["activity"])


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME}", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
