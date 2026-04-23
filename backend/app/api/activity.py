"""Study activity tracking — daily rows + streak computation."""
from datetime import date, datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.models.activity import Activity
from app.models.user import User

router = APIRouter()


class ActivityIn(BaseModel):
    minutes: int = 0
    cards_reviewed: int = 0


class DailyActivity(BaseModel):
    day: date
    minutes: int
    cards_reviewed: int


class ActivitySummary(BaseModel):
    current_streak: int
    longest_streak: int
    total_minutes: int
    total_cards: int
    last_30_days: List[DailyActivity]


def _compute_streak(days: List[date]) -> tuple[int, int]:
    """Return (current_streak_ending_today, longest_streak_ever)."""
    if not days:
        return 0, 0
    unique = sorted(set(days))
    longest = 1
    run = 1
    for i in range(1, len(unique)):
        if (unique[i] - unique[i - 1]).days == 1:
            run += 1
            longest = max(longest, run)
        else:
            run = 1

    # current streak ending today (or yesterday if user hasn't logged today yet)
    today = date.today()
    if unique[-1] not in (today, today - timedelta(days=1)):
        return 0, longest

    current = 1
    for i in range(len(unique) - 1, 0, -1):
        if (unique[i] - unique[i - 1]).days == 1:
            current += 1
        else:
            break
    return current, longest


@router.post("/log", response_model=DailyActivity)
def log_activity(
    payload: ActivityIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()
    row = (
        db.query(Activity)
        .filter(Activity.user_id == user.id, Activity.day == today)
        .first()
    )
    if not row:
        row = Activity(
            user_id=user.id,
            day=today,
            minutes=payload.minutes,
            cards_reviewed=payload.cards_reviewed,
            created_at=datetime.utcnow(),
        )
        db.add(row)
    else:
        row.minutes = (row.minutes or 0) + payload.minutes
        row.cards_reviewed = (row.cards_reviewed or 0) + payload.cards_reviewed
    db.commit()
    db.refresh(row)
    return DailyActivity(day=row.day, minutes=row.minutes, cards_reviewed=row.cards_reviewed)


@router.get("/summary", response_model=ActivitySummary)
def activity_summary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = (
        db.query(Activity)
        .filter(Activity.user_id == user.id)
        .order_by(Activity.day.asc())
        .all()
    )
    current, longest = _compute_streak([r.day for r in rows])

    cutoff = date.today() - timedelta(days=29)
    recent = [r for r in rows if r.day >= cutoff]

    return ActivitySummary(
        current_streak=current,
        longest_streak=longest,
        total_minutes=sum(r.minutes or 0 for r in rows),
        total_cards=sum(r.cards_reviewed or 0 for r in rows),
        last_30_days=[
            DailyActivity(day=r.day, minutes=r.minutes or 0, cards_reviewed=r.cards_reviewed or 0)
            for r in recent
        ],
    )
