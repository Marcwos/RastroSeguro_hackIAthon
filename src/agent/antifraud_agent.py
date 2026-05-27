"""Tool-backed antifraud agent facade with optional LLM conversational synthesis."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from src.agent import tools
from src.agent.entities import extract_claim_id, extract_limit
from src.agent.quick_questions import get_quick_questions
from src.agent.rag import search_docs
from src.agent.responses import error, success
from src.agent.router import route


def _load_env() -> None:
    """Load key-value pairs from .env into environment variables without external library."""
    env_path = Path(".env")
    if env_path.exists():
        try:
            for line in env_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip().strip('"').strip("'")
        except Exception:
            pass


# Load environment variables on import
_load_env()


def _generate_llm_response(intent: str, data: Any, question: str, api_key: str) -> str | None:
    """Send structured tool output and RAG documents to Gemini API for a natural language summary."""
    import requests

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

    prompt = (
        "Sos RastroSeguro, un copiloto experto en auditoría y prevención de fraudes en seguros vehiculares de Ecuador. "
        "Tu rol es actuar como asistente consultivo profesional de un analista humano, justificando tus hallazgos de forma trazable y ética, sin acusar falsamente. "
        f"El usuario hizo esta pregunta: '{question}'\n\n"
        f"El pipeline determinístico de RastroSeguro ejecutó la herramienta '{intent}' y devolvió estos datos estructurados de dominio:\n"
        f"{json.dumps(data, ensure_ascii=False, indent=2)}\n\n"
        "Redactá una respuesta conversacional, profesional, directa y muy explicable en español. "
        "Usa viñetas si hay listas o clasificaciones, y explica el sustento técnico de las alertas si las hay. "
        "Si hay montos, mencionalos en dólares americanos. Mantén tu respuesta concisa pero sumamente profesional."
    )

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    try:
        resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=10)
        if resp.status_code == 200:
            result = resp.json()
            candidates = result.get("candidates", [])
            if candidates:
                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                if parts:
                    return parts[0].get("text").strip()
    except Exception:
        pass
    return None


def answer_question(question: str) -> dict[str, Any]:
    """Process user queries, routing to deterministic tools and optionally summarizing with Gemini."""
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

    # Check if Gemini API key is configured in the environment or .env
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        llm_msg = _generate_llm_response(intent.name, data, question, api_key)
        if llm_msg:
            return success(intent.name, llm_msg, data, source="llm")

    # Fallback to local deterministic response if LLM is missing or failed
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
