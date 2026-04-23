"""LLM interaction service — completions, streaming, and summarization."""
from typing import Generator, List, Dict

from app.core.config import settings

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None


SYSTEM_PROMPT = (
    "You are a helpful AI study companion. You answer student questions clearly, "
    "explain concepts step by step, and can quiz the student on topics they are learning. "
    "When given note context, you prefer to ground your answers in that context."
)

SUMMARY_SYSTEM = (
    "You are a study assistant. Summarize the following study notes into a concise, "
    "well-structured study guide. Use short headings and bullet points. Keep it tight."
)


def _get_client():
    if OpenAI is None:
        raise RuntimeError("openai package not installed")
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    return OpenAI(api_key=settings.OPENAI_API_KEY)


def _build_messages(messages: List[Dict[str, str]], note_context: str | None):
    convo: List[Dict[str, str]] = [{"role": "system", "content": SYSTEM_PROMPT}]
    if note_context:
        convo.append(
            {
                "role": "system",
                "content": f"Relevant study notes:\n\n{note_context[:8000]}",
            }
        )
    convo.extend(messages)
    return convo


def chat_completion(messages: List[Dict[str, str]], note_context: str | None = None) -> str:
    """One-shot chat completion."""
    if not settings.OPENAI_API_KEY:
        last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        return f"[offline stub] You said: {last_user}"

    client = _get_client()
    resp = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=_build_messages(messages, note_context),
        temperature=0.7,
    )
    return resp.choices[0].message.content or ""


def chat_stream(
    messages: List[Dict[str, str]], note_context: str | None = None
) -> Generator[str, None, None]:
    """Yield text deltas for streaming responses."""
    if not settings.OPENAI_API_KEY:
        last_user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        for chunk in f"[offline stub] You said: {last_user}".split(" "):
            yield chunk + " "
        return

    client = _get_client()
    stream = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=_build_messages(messages, note_context),
        temperature=0.7,
        stream=True,
    )
    for event in stream:
        try:
            delta = event.choices[0].delta.content
        except (IndexError, AttributeError):
            delta = None
        if delta:
            yield delta


def summarize_text(text: str) -> str:
    """Summarize a long piece of study material."""
    if not text.strip():
        return ""

    if not settings.OPENAI_API_KEY:
        # Offline heuristic: take first ~400 chars of each paragraph.
        paras = [p.strip() for p in text.split("\n\n") if p.strip()][:5]
        return "\n\n".join(p[:400] + ("…" if len(p) > 400 else "") for p in paras)

    client = _get_client()
    resp = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SUMMARY_SYSTEM},
            {"role": "user", "content": text[:16000]},
        ],
        temperature=0.3,
    )
    return resp.choices[0].message.content or ""
