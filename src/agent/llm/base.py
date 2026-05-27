"""Small provider contract for optional conversational synthesis."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol


@dataclass(frozen=True)
class LLMRequest:
    """Structured context passed from deterministic tools to an LLM provider."""

    intent: str
    data: Any
    question: str


@dataclass(frozen=True)
class LLMResult:
    """Provider result that never raises into the antifraud agent facade."""

    message: str | None
    provider: str
    model: str | None = None
    status: str = "disabled"
    error: str | None = None

    @property
    def has_message(self) -> bool:
        return bool(self.message and self.message.strip())


class LLMProvider(Protocol):
    """Minimal interface for optional LLM-backed response synthesis."""

    def generate(self, request: LLMRequest) -> LLMResult:
        """Generate a natural-language response from verified tool output."""
