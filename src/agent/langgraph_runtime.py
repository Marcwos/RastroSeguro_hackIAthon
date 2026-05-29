"""Optional LangGraph runtime for routing agent turns through an explicit graph."""

from __future__ import annotations

from functools import lru_cache
from typing import Any, Callable, TypedDict

from src.agent.router import route


class GraphTurnState(TypedDict, total=False):
    question: str
    selected_claim_id: str | None
    claim_id: str | None
    limit: int
    intent: str
    uses_documentation: bool
    data: Any
    source: str


class LangGraphUnavailableError(RuntimeError):
    """Raised when LangGraph was requested but is not installed."""


def _import_langgraph():
    try:
        from langgraph.graph import END, START, StateGraph
    except ModuleNotFoundError as exc:
        raise LangGraphUnavailableError(
            "LangGraph no esta instalado. Agrega la dependencia para activar este runtime."
        ) from exc
    return StateGraph, START, END


@lru_cache(maxsize=1)
def _compile_graph(
    tool_dispatcher: Callable[[str, str | None, int, str], Any],
    docs_dispatcher: Callable[[str], Any],
):
    StateGraph, START, END = _import_langgraph()

    def supervisor_node(state: GraphTurnState) -> GraphTurnState:
        intent = route(state["question"])
        return {
            "intent": intent.name,
            "uses_documentation": intent.uses_documentation,
        }

    def tool_node(state: GraphTurnState) -> GraphTurnState:
        data = tool_dispatcher(
            state["intent"],
            state.get("claim_id"),
            state.get("limit", 10),
            state["question"],
        )
        return {"data": data, "source": "tools"}

    def docs_node(state: GraphTurnState) -> GraphTurnState:
        data = docs_dispatcher(state["question"])
        return {"data": data, "source": "rag"}

    graph = StateGraph(GraphTurnState)
    graph.add_node("supervisor", supervisor_node)
    graph.add_node("tool_worker", tool_node)
    graph.add_node("docs_worker", docs_node)
    graph.add_edge(START, "supervisor")
    graph.add_conditional_edges(
        "supervisor",
        lambda state: "docs_worker" if state.get("uses_documentation") else "tool_worker",
        {
            "docs_worker": "docs_worker",
            "tool_worker": "tool_worker",
        },
    )
    graph.add_edge("tool_worker", END)
    graph.add_edge("docs_worker", END)
    return graph.compile()


def run_langgraph_turn(
    *,
    question: str,
    claim_id: str | None,
    selected_claim_id: str | None,
    limit: int,
    tool_dispatcher: Callable[[str, str | None, int, str], Any],
    docs_dispatcher: Callable[[str], Any],
) -> dict[str, Any]:
    graph = _compile_graph(tool_dispatcher, docs_dispatcher)
    state = graph.invoke(
        {
            "question": question,
            "claim_id": claim_id or selected_claim_id,
            "selected_claim_id": selected_claim_id,
            "limit": limit,
        }
    )
    return {
        "intent": state["intent"],
        "data": state["data"],
        "source": state.get("source", "tools"),
        "runtime": {
            "requested": "langgraph",
            "active": "langgraph",
            "status": "ok",
        },
    }
