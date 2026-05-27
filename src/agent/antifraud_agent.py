"""Tool-backed antifraud agent facade."""

from __future__ import annotations

import re
from typing import Any

from src.agent import tools
from src.agent.router import route_intent
from src.agent.rag import search_docs


def answer_question(question: str) -> Any:
    intent = route_intent(question)
    if intent == "ranking_proveedores":
        return tools.get_provider_risk_ranking()
    if intent == "ranking_ciudades":
        return tools.get_city_risk_distribution()
    if intent == "riesgo_por_ramo":
        return tools.get_risk_by_branch()
    if intent == "documentos_faltantes":
        return tools.get_missing_documents()
    if intent == "resumen_ejecutivo":
        return tools.generate_executive_summary()
    if intent == "explicar_siniestro":
        match = re.search(r"SIN[-_]?\d+", question.upper())
        if not match:
            return {"error": "Indica un id de siniestro, por ejemplo SIN-0045."}
        return tools.explain_claim(match.group(0).replace("_", "-"))
    if "regla" in question.lower() or "score" in question.lower() or "limitacion" in question.lower():
        return search_docs(question)
    return tools.get_top_risky_claims()
