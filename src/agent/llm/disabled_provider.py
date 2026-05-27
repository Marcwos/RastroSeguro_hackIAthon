"""No-op LLM provider used when conversational synthesis is disabled."""

from __future__ import annotations

from src.agent.llm.base import LLMRequest, LLMResult


class DisabledProvider:
    """Preserves deterministic behavior when no LLM is configured."""

    def __init__(self, reason: str = "disabled") -> None:
        self.reason = reason

    def generate(self, request: LLMRequest) -> LLMResult:
        return LLMResult(message=None, provider="disabled", status=self.reason)
