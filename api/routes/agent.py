"""Antifraud agent routes."""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from api.schemas import AgentAskRequest, failure, success
from src.agent.antifraud_agent import answer_question, get_quick_questions

router = APIRouter(prefix="/api/agent", tags=["agent"])


@router.get("/quick-questions")
def quick_questions() -> dict:
    return success(get_quick_questions())


@router.post("/ask")
def ask_agent(payload: AgentAskRequest):
    history = [turn.model_dump() for turn in payload.history] if payload.history else None
    response = answer_question(payload.question, history=history)
    if response.get("ok") is False:
        return JSONResponse(
            status_code=400,
            content=failure(
                str(response.get("message", "El agente no pudo responder.")),
                hint=response.get("hint"),
                details=response,
            ),
        )
    return success(response)
