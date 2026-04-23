"""Flashcard generation service — turns note text into Q&A pairs via LLM."""
from __future__ import annotations

import json
import re
from typing import List

from app.core.config import settings

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None


GENERATION_SYSTEM = (
    "You are an expert tutor. Given study material, you produce high-quality "
    "question/answer flashcards that test understanding (not just recall). "
    "Respond ONLY with a JSON array of objects shaped like "
    '[{"question": "...", "answer": "..."}] — no prose, no markdown fences.'
)


def _offline_fallback(text: str, count: int) -> List[dict]:
    """Very dumb fallback when no API key is set — splits on sentences."""
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if len(s.strip()) > 20]
    cards: List[dict] = []
    for i, sent in enumerate(sentences[:count], start=1):
        cards.append(
            {
                "question": f"[stub #{i}] Summarize this point: {sent[:120]}…",
                "answer": sent,
            }
        )
    if not cards:
        cards.append(
            {"question": "What is this note about?", "answer": text[:200] or "(no content)"}
        )
    return cards


def _parse_cards(raw: str) -> List[dict]:
    """Best-effort parse: strip fences, find the first JSON array, parse it."""
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.MULTILINE)
    match = re.search(r"\[.*\]", cleaned, flags=re.DOTALL)
    if not match:
        return []
    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError:
        return []
    out: List[dict] = []
    for item in data if isinstance(data, list) else []:
        q = str(item.get("question", "")).strip()
        a = str(item.get("answer", "")).strip()
        if q and a:
            out.append({"question": q, "answer": a})
    return out


def generate_flashcards(note_text: str, count: int = 8) -> List[dict]:
    """Return a list of {question, answer} dicts."""
    if not note_text.strip():
        return []

    if not settings.OPENAI_API_KEY or OpenAI is None:
        return _offline_fallback(note_text, count)

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    user_prompt = (
        f"Create exactly {count} flashcards from the following study notes. "
        "Mix recall questions with 'why' and 'how' conceptual questions.\n\n"
        f"NOTES:\n{note_text[:8000]}"
    )
    resp = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": GENERATION_SYSTEM},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
    )
    content = resp.choices[0].message.content or ""
    cards = _parse_cards(content)
    if not cards:
        # Graceful fallback so the UX never breaks on malformed JSON.
        return _offline_fallback(note_text, count)
    return cards[:count]
