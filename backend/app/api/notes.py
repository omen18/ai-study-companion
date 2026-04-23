"""Notes CRUD + PDF upload routes."""
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.notes import Note
from app.models.user import User
from app.schemas.notes_schema import NoteCreate, NoteOut, NoteUpdate
from app.services.ai_service import summarize_text
from app.services.pdf_service import extract_text_from_bytes

router = APIRouter()


@router.get("", response_model=List[NoteOut])
def list_notes(
    q: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Note).filter(Note.user_id == user.id)
    if q:
        pattern = f"%{q}%"
        query = query.filter((Note.title.ilike(pattern)) | (Note.content.ilike(pattern)))
    return query.order_by(Note.updated_at.desc()).all()


@router.post("", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    note = Note(user_id=user.id, **payload.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/{note_id}", response_model=NoteOut)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(note, k, v)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return None


@router.post("/upload", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Upload a PDF, extract text, and save as a note."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF uploads are supported")

    raw = await file.read()
    try:
        text = extract_text_from_bytes(raw)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {exc}")

    note = Note(
        user_id=user.id,
        title=file.filename.rsplit(".", 1)[0],
        content=text,
        subject="Uploaded PDF",
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.post("/{note_id}/summarize")
def summarize_note(
    note_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return an AI-generated study-guide-style summary of the note."""
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"summary": summarize_text(note.content or "")}
