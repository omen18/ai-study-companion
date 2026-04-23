"""PDF text extraction service using PyMuPDF (fitz)."""
from pathlib import Path
from typing import Union

try:
    import fitz  # PyMuPDF
except ImportError:  # pragma: no cover
    fitz = None


def extract_text_from_pdf(path: Union[str, Path]) -> str:
    """Extract plain text from a PDF file path."""
    if fitz is None:
        raise RuntimeError("PyMuPDF (pymupdf) is not installed")

    text_parts: list[str] = []
    with fitz.open(path) as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n\n".join(text_parts).strip()


def extract_text_from_bytes(data: bytes) -> str:
    """Extract text from an in-memory PDF byte stream."""
    if fitz is None:
        raise RuntimeError("PyMuPDF (pymupdf) is not installed")

    text_parts: list[str] = []
    with fitz.open(stream=data, filetype="pdf") as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n\n".join(text_parts).strip()
