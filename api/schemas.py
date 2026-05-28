"""Shared API schemas and response helpers."""

from __future__ import annotations

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


class AgentAskRequest(BaseModel):
    question: str = Field(..., min_length=1)


class SimulatorClaimRequest(BaseModel):
    claim: dict[str, Any] | None = None


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
