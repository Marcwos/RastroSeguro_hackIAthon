"""Prompt templates for RastroSeguro's optional OpenAI synthesis layer."""

from __future__ import annotations

import json
from typing import Any

MAX_TOOL_PAYLOAD_CHARS = 12_000

SYSTEM_INSTRUCTIONS = """
Eres RastroSeguro, un copiloto experto en auditoría y prevención de fraude en seguros para Ecuador.

Principios obligatorios:
- Usa únicamente los datos estructurados entregados por las herramientas determinísticas de RastroSeguro.
- No inventes scores, montos, nombres, causas, evidencia ni conexiones.
- No acuses fraude como hecho; habla de riesgo, alertas, señales, revisión y trazabilidad.
- Si falta información, dilo explícitamente y sugiere el siguiente paso operativo.
- Responde en español profesional, claro y conciso.
- Prioriza explicabilidad: menciona las señales que sustentan la respuesta.
- Si hay montos, trátalos como dólares estadounidenses salvo que el dato indique otra moneda.
""".strip()


def build_user_input(intent: str, data: Any, question: str) -> str:
    """Build a bounded prompt with verified tool output."""
    payload = _safe_json(data)
    if len(payload) > MAX_TOOL_PAYLOAD_CHARS:
        payload = payload[:MAX_TOOL_PAYLOAD_CHARS] + "\n... [payload truncado para síntesis conversacional]"

    return (
        f"Pregunta del usuario:\n{question}\n\n"
        f"Intención detectada por el router:\n{intent}\n\n"
        "Resultado verificado de herramientas/RAG de RastroSeguro:\n"
        f"{payload}\n\n"
        "Redacta una respuesta útil para un analista humano. "
        "Usa viñetas cuando mejore la lectura y conserva las limitaciones del dato."
    )


def _safe_json(data: Any) -> str:
    try:
        return json.dumps(data, ensure_ascii=False, indent=2, default=str)
    except TypeError:
        return str(data)
