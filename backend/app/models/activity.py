"""Daily study activity — used to compute streaks and heatmaps."""
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, UniqueConstraint

from app.db.database import Base


class Activity(Base):
    __tablename__ = "activity"
    __table_args__ = (UniqueConstraint("user_id", "day", name="uq_activity_user_day"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    day = Column(Date, nullable=False, default=date.today)
    minutes = Column(Integer, default=0)
    cards_reviewed = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
