"""Shared API schemas and response helpers."""

from __future__ import annotations

from typing import Literal
from typing import Any

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    message: str
    hint: str | None = None
    details: Any | None = None


class ApiEnvelope(BaseModel):
    ok: bool
    data: Any | None = None
    error: ErrorDetail | None = None


class ChatTurn(BaseModel):
    role: str
    content: str


class AgentAskRequest(BaseModel):
    question: str = Field(..., min_length=1)
    history: list[ChatTurn] | None = None
    selected_claim_id: str | None = None
    runtime: Literal["classic", "langgraph"] = "classic"


class AgentChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    user_id: str = "anonymous"
    thread_id: str | None = None
    selected_claim_id: str | None = None
    role: Literal["user"] = "user"
    runtime: Literal["classic", "langgraph"] = "classic"
    persist: bool = True
    ui_context: dict[str, Any] | None = None


class SimulatorClaimRequest(BaseModel):
    claim: dict[str, Any] | None = None


class ConfirmExtractedDocumentRequest(BaseModel):
    document_id: str | None = None
    filename: str | None = None
    claim: dict[str, Any] = Field(default_factory=dict)


class ReportResponseFormat(BaseModel):
    format: str = "dict"


def success(data: Any) -> dict[str, Any]:
    return {"ok": True, "data": data, "error": None}


def failure(message: str, hint: str | None = None, details: Any | None = None) -> dict[str, Any]:
    return {
        "ok": False,
        "data": None,
        "error": {
            "message": message,
            "hint": hint,
            "details": details,
        },
    }
