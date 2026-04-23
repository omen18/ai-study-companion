"""Study recommendation service — simple heuristic for which topics to focus on."""
from typing import List

from app.models.progress import Progress


def recommend_topics(progress_rows: List[Progress], top_n: int = 3) -> List[str]:
    """Return the topics the user should focus on next.

    Heuristic: prioritize topics with lowest (completion * 0.7 + score/100 * 0.3).
    """
    if not progress_rows:
        return []

    scored = [
        (row.topic, (row.completion * 0.7) + ((row.score or 0) / 100.0) * 0.3)
        for row in progress_rows
    ]
    scored.sort(key=lambda x: x[1])  # lowest first = weakest
    return [topic for topic, _ in scored[:top_n]]
