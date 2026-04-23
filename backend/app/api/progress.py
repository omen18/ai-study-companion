"""Progress tracking routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.progress import Progress
from app.models.user import User
from app.schemas.notes_schema import ProgressCreate, ProgressOut
from app.services.recommendation import recommend_topics

router = APIRouter()


@router.get("", response_model=List[ProgressOut])
def list_progress(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(Progress).filter(Progress.user_id == user.id).all()


@router.post("", response_model=ProgressOut, status_code=status.HTTP_201_CREATED)
def upsert_progress(
    payload: ProgressCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    row = (
        db.query(Progress)
        .filter(Progress.user_id == user.id, Progress.topic == payload.topic)
        .first()
    )
    if row:
        row.completion = payload.completion
        row.score = payload.score
    else:
        row = Progress(user_id=user.id, **payload.model_dump())
        db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/{progress_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_progress(
    progress_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    row = (
        db.query(Progress)
        .filter(Progress.id == progress_id, Progress.user_id == user.id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Progress entry not found")
    db.delete(row)
    db.commit()
    return None


@router.get("/recommendations", response_model=List[str])
def recommendations(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = db.query(Progress).filter(Progress.user_id == user.id).all()
    return recommend_topics(rows)
