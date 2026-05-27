"""Tool-backed antifraud agent facade."""

from __future__ import annotations

from typing import Any

from src.agent import tools
from src.agent.entities import extract_claim_id, extract_limit
from src.agent.quick_questions import get_quick_questions
from src.agent.rag import search_docs
from src.agent.responses import error, success
from src.agent.router import route


def answer_question(question: str) -> dict[str, Any]:
    intent = route(question)
    claim_id = extract_claim_id(question)
    limit = extract_limit(question)

    if intent.requires_claim_id and not claim_id:
        return error(
            intent.name,
            "Necesito el id del siniestro para responder esa pregunta.",
            "Ejemplo: Explícame el siniestro SIN-0045.",
        )

    try:
        data = _dispatch(intent.name, claim_id=claim_id, limit=limit, question=question)
    except FileNotFoundError as exc:
        return error(intent.name, str(exc), "Ejecuta primero el scoring para generar data/processed/siniestros_scored.csv.")
    except ValueError as exc:
        return error(intent.name, str(exc))

    return success(intent.name, _message_for(intent.name), data, source="rag" if intent.uses_documentation else "tools")


def _dispatch(intent: str, claim_id: str | None, limit: int, question: str) -> Any:
    if intent == "ranking_proveedores":
        return tools.get_provider_risk_ranking(limit=limit)
    if intent == "ranking_ciudades":
        return tools.get_city_risk_distribution()
    if intent == "riesgo_por_ramo":
        return tools.get_risk_by_branch()
    if intent == "documentos_faltantes":
        return tools.get_missing_documents()
    if intent == "resumen_ejecutivo":
        return tools.generate_executive_summary()
    if intent == "explicar_siniestro":
        return tools.explain_claim(claim_id or "")
    if intent == "narrativas_similares":
        return tools.get_similar_narratives(claim_id or "")
    if intent == "conexiones_grafo":
        return tools.get_graph_connections(claim_id or "")
    if intent == "simular_siniestro":
        return error(intent, "Para simular necesito recibir los datos del nuevo siniestro desde el formulario de Justin.")
    if intent == "documentacion":
        return search_docs(question)
    return tools.get_top_risky_claims(limit=limit)


def _message_for(intent: str) -> str:
    messages = {
        "top_riesgo": "Casos priorizados por mayor score de riesgo.",
        "ranking_proveedores": "Ranking de proveedores por concentración de riesgo.",
        "ranking_ciudades": "Distribución de riesgo por ciudad.",
        "riesgo_por_ramo": "Comparación de riesgo por ramo.",
        "documentos_faltantes": "Casos con documentos faltantes o incompletos.",
        "resumen_ejecutivo": "Resumen ejecutivo generado desde datos procesados.",
        "explicar_siniestro": "Explicación trazable del siniestro solicitado.",
        "narrativas_similares": "Narrativas similares detectadas para el siniestro solicitado.",
        "conexiones_grafo": "Conexiones y entidades recurrentes del siniestro solicitado.",
        "documentacion": "Respuesta basada en documentación interna del proyecto.",
    }
    return messages.get(intent, "Respuesta generada desde herramientas verificables.")


__all__ = ["answer_question", "get_quick_questions"]
