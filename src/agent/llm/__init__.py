"""Optional LLM synthesis providers for the antifraud agent."""

from __future__ import annotations

from src.agent.llm.base import LLMProvider, LLMRequest, LLMResult
from src.agent.llm.disabled_provider import DisabledProvider
from src.agent.llm.openai_provider import OpenAIProvider
from src.agent.llm.settings import LLMSettings, load_settings


def build_llm_provider(settings: LLMSettings | None = None) -> LLMProvider:
    """Create the configured provider, falling back to deterministic no-op behavior."""
    resolved = settings or load_settings()
    if not resolved.enabled:
        return DisabledProvider("disabled_by_config")
    if resolved.provider != "openai":
        return DisabledProvider(f"unsupported_provider:{resolved.provider}")
    if not resolved.api_key:
        return DisabledProvider("missing_openai_api_key")
    return OpenAIProvider(resolved)


__all__ = [
    "DisabledProvider",
    "LLMProvider",
    "LLMRequest",
    "LLMResult",
    "LLMSettings",
    "OpenAIProvider",
    "build_llm_provider",
    "load_settings",
]
