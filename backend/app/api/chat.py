"""Chat routes — plain completion + server-sent-event streaming."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.notes import Note
from app.models.user import User
from app.schemas.notes_schema import ChatRequest, ChatResponse
from app.services.ai_service import chat_completion, chat_stream

router = APIRouter()


def _resolve_context(db: Session, user: User, note_id: int | None) -> str | None:
    if note_id is None:
        return None
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note.content


@router.post("", response_model=ChatResponse)
def send_message(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    note_context = _resolve_context(db, user, payload.note_id)
    messages = [m.model_dump() for m in payload.messages]
    try:
        reply = chat_completion(messages, note_context=note_context)
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"AI service error: {exc}")
    return ChatResponse(reply=reply)


@router.post("/stream")
def stream_message(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Streams the assistant reply as newline-delimited text chunks."""
    note_context = _resolve_context(db, user, payload.note_id)
    messages = [m.model_dump() for m in payload.messages]

    def generator():
        try:
            for delta in chat_stream(messages, note_context=note_context):
                yield delta
        except Exception as exc:  # pragma: no cover
            yield f"\n\n[error] {exc}"

    return StreamingResponse(generator(), media_type="text/plain; charset=utf-8")
