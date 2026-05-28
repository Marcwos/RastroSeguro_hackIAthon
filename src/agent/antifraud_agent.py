"""Tool-backed antifraud agent facade with optional LLM conversational synthesis."""

from __future__ import annotations

from typing import Any

from src.agent import tools
from src.agent.entities import extract_claim_id, extract_limit
from src.agent.llm import LLMRequest, build_llm_provider
from src.agent.quick_questions import get_quick_questions
from src.agent.rag import search_docs
from src.agent.responses import error, success
from src.agent.router import route


def answer_question(question: str) -> dict[str, Any]:
    """Process user queries through deterministic tools and optional OpenAI synthesis."""
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

    llm_result = build_llm_provider().generate(LLMRequest(intent=intent.name, data=data, question=question))
    llm_metadata = {"llm": llm_result.metadata()}
    if llm_result.has_message:
        return success(intent.name, llm_result.message or "", data, source="llm", metadata=llm_metadata)

    return success(
        intent.name,
        _message_for(intent.name),
        data,
        source="rag" if intent.uses_documentation else "tools",
        metadata=llm_metadata,
    )


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
    if intent == "casos_estrella":
        return tools.get_demo_star_cases()
    if intent == "impacto_negocio":
        return tools.get_business_impact()
    if intent == "explicar_siniestro":
        return tools.explain_claim(claim_id or "")
    if intent == "expediente_siniestro":
        return tools.get_claim_dossier(claim_id or "")
    if intent == "narrativas_similares":
        return tools.get_similar_narratives(claim_id or "")
    if intent == "conexiones_grafo":
        return tools.get_graph_connections(claim_id or "")
    if intent == "simular_siniestro":
        return error(intent, "Para simular necesito recibir los datos del nuevo siniestro desde el formulario de Justin.")
    if intent == "documentacion":
        return search_docs(question)
    if intent == "recomendar_revision":
        return tools.recommend_review_order(limit=limit)
    if intent == "frecuencia_asegurados":
        return tools.get_insured_claim_frequency(limit=limit)
    if intent == "montos_atipicos":
        return tools.get_atypical_amount_claims(limit=limit)
    if intent == "borde_vigencia":
        return tools.get_policy_start_border_cases(limit=limit)
    if intent == "patrones_repetidos":
        return tools.get_repeated_patterns(limit=limit)
    if intent == "concentracion_rojos":
        return tools.get_provider_red_concentration(threshold=0.8)
    if intent == "ahorro_potencial":
        return tools.simulate_portfolio_savings()
    return tools.get_top_risky_claims(limit=limit)


def _message_for(intent: str) -> str:
    messages = {
        "top_riesgo": "Casos priorizados por mayor score de riesgo.",
        "ranking_proveedores": "Ranking de proveedores por concentración de riesgo.",
        "ranking_ciudades": "Distribución de riesgo por ciudad.",
        "riesgo_por_ramo": "Comparación de riesgo por ramo.",
        "documentos_faltantes": "Casos con documentos faltantes o incompletos.",
        "resumen_ejecutivo": "Resumen ejecutivo generado desde datos procesados.",
        "casos_estrella": "Casos estrella seleccionados para demo ejecutiva.",
        "impacto_negocio": "Impacto de priorización expresado como exposición a revisar, no ahorro automático.",
        "explicar_siniestro": "Explicación trazable del siniestro solicitado.",
        "expediente_siniestro": "Expediente antifraude con evidencias, próximos pasos y guardrail ético.",
        "narrativas_similares": "Narrativas similares detectadas para el siniestro solicitado.",
        "conexiones_grafo": "Conexiones y entidades recurrentes del siniestro solicitado.",
        "documentacion": "Respuesta basada en documentación interna del proyecto.",
        "recomendar_revision": "Casos recomendados para revisión prioritaria.",
        "frecuencia_asegurados": "Asegurados con mayor frecuencia de reclamos.",
        "montos_atipicos": "Casos con montos atípicos frente a la suma asegurada.",
        "borde_vigencia": "Siniestros ocurridos cerca del inicio de la póliza.",
        "patrones_repetidos": "Patrones recurrentes en reclamos sospechosos.",
        "concentracion_rojos": "Proveedores que concentran la mayoría de alertas rojas.",
        "ahorro_potencial": "Estimación de ahorro potencial por revisión temprana de casos rojos.",
    }
    return messages.get(intent, "Respuesta generada desde herramientas verificables.")


__all__ = ["answer_question", "get_quick_questions"]
