"""Antifraud agent routes."""

from __future__ import annotations

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from api.routes._errors import run_endpoint
from api.schemas import AgentAskRequest, AgentChatRequest, failure, success
from src.agent.antifraud_agent import answer_question, get_quick_questions
from src.agent.chat_history import ChatHistoryStore
from src.agent.entities import extract_claim_id

router = APIRouter(prefix="/api/agent", tags=["agent"])


def _chat_store() -> ChatHistoryStore:
    return ChatHistoryStore()


@router.get("/quick-questions")
def quick_questions() -> dict:
    return success(get_quick_questions())


@router.post("/ask")
def ask_agent(payload: AgentAskRequest):
    history = [turn.model_dump() for turn in payload.history] if payload.history else None
    response = answer_question(
        payload.question,
        history=history,
        selected_claim_id=payload.selected_claim_id,
        runtime=payload.runtime,
    )
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


@router.get("/threads/{thread_id}")
def get_agent_thread(thread_id: str, user_id: str = Query(default="anonymous")):
    return run_endpoint(lambda: _chat_store().get_thread(thread_id, user_id=user_id))


@router.get("/sessions")
def list_agent_sessions(user_id: str = Query(default="anonymous"), limit: int = Query(default=25, ge=1, le=100)):
    return run_endpoint(lambda: _chat_store().list_threads(user_id=user_id, limit=limit))


@router.post("/chat")
def chat_agent(payload: AgentChatRequest):
    def _handle() -> dict:
        store = _chat_store()
        user_id = payload.user_id or "anonymous"
        thread = store.prepare_thread(
            payload.thread_id,
            user_id=user_id,
            selected_claim_id=payload.selected_claim_id,
            runtime=payload.runtime,
        )
        thread_id = thread["thread_id"]
        history = thread["history"]

        if payload.persist:
            store.append_message(
                thread_id,
                user_id=user_id,
                role=payload.role,
                content=payload.message,
            )
            store.rename_thread_from_first_message(thread_id, user_id=user_id, message=payload.message)

        updated_history = [*history, {"role": payload.role, "content": payload.message}]
        reply = answer_question(
            payload.message,
            history=updated_history,
            selected_claim_id=payload.selected_claim_id or thread["context"].get("last_claim_id"),
            thread_id=thread_id,
            runtime=payload.runtime,
        )

        assistant_source = reply.get("source", "agent")
        context = reply.get("context") or {}
        resolved_claim_id = context.get("resolved_claim_id") or extract_claim_id(payload.message)
        section = None
        if payload.persist:
            section = store.choose_section(
                thread,
                user_id=user_id,
                intent=reply.get("intent"),
                claim_id=resolved_claim_id,
                message=payload.message,
            )
            store.assign_latest_user_message_to_section(
                thread_id,
                user_id=user_id,
                section_id=section["section_id"],
            )
            store.append_message(
                thread_id,
                user_id=user_id,
                section_id=section["section_id"],
                role="assistant",
                content=str(reply.get("message", "")),
                intent=reply.get("intent"),
                source=assistant_source,
                metadata={
                    "ok": reply.get("ok", False),
                    "runtime": reply.get("runtime"),
                    "llm": reply.get("llm"),
                },
                data=reply.get("data"),
            )

        selected_claim_id = payload.selected_claim_id or thread["context"].get("selected_claim_id")
        if payload.persist:
            updated_thread = store.update_context(
                thread_id,
                user_id=user_id,
                selected_claim_id=selected_claim_id,
                last_claim_id=resolved_claim_id,
                last_intent=reply.get("intent"),
                current_section_id=section["section_id"] if section else None,
                runtime=(reply.get("runtime") or {}).get("active"),
                state={
                    "last_ok": bool(reply.get("ok")),
                    "last_source": assistant_source,
                    "section_intent": reply.get("intent"),
                    "section_claim_id": resolved_claim_id,
                },
            )
        else:
            updated_thread = thread

        return {
            "thread_id": thread_id,
            "user_id": updated_thread["user_id"],
            "title": updated_thread["title"],
            "reply": reply,
            "history": updated_thread["history"],
            "sections": updated_thread["sections"],
            "context": updated_thread["context"],
            "created_at": updated_thread["created_at"],
            "updated_at": updated_thread["updated_at"],
        }

    return run_endpoint(_handle)
