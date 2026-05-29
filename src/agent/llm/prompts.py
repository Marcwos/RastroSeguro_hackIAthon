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

Formato (la interfaz ya renderiza los datos como tabla/tarjetas aparte):
- Responde en texto plano, NO uses Markdown: nada de encabezados (#), negritas (**), ni tablas.
- No repitas la tabla de datos; resume e interpreta. Da contexto, señala las 2-3 alertas o señales que más pesan y cierra con el siguiente paso de revisión.
- Si enumeras casos o señales, usa viñetas simples con guion (- ) y sé conciso (máximo ~6 líneas salvo que el analista pida detalle).
- Menciona los IDs de siniestro y cifras tal cual vienen en los datos, sin formato especial.
""".strip()


def build_user_input(intent: str, data: Any, question: str, history: Any = None) -> str:
    """Build a bounded prompt with verified tool output and recent conversation."""
    payload = _safe_json(data)
    if len(payload) > MAX_TOOL_PAYLOAD_CHARS:
        payload = payload[:MAX_TOOL_PAYLOAD_CHARS] + "\n... [payload truncado para síntesis conversacional]"

    history_block = _format_history(history)
    return (
        f"{history_block}"
        f"Pregunta del usuario:\n{question}\n\n"
        f"Intención detectada por el router:\n{intent}\n\n"
        "Resultado verificado de herramientas/RAG de RastroSeguro:\n"
        f"{payload}\n\n"
        "Redacta una respuesta útil para un analista humano. Si la pregunta es un seguimiento, "
        "apóyate en el historial para resolver referencias, pero responde solo con datos verificados arriba. "
        "Conserva las limitaciones del dato."
    )


def _format_history(history: Any, max_turns: int = 6) -> str:
    """Render the last conversation turns so the LLM can resolve follow-ups."""
    if not history:
        return ""
    turns = []
    for turn in list(history)[-max_turns:]:
        role = getattr(turn, "role", None) or (turn.get("role") if isinstance(turn, dict) else None)
        content = getattr(turn, "content", None) or (turn.get("content") if isinstance(turn, dict) else None)
        if not content:
            continue
        speaker = "Analista" if role == "user" else "RastroSeguro"
        turns.append(f"{speaker}: {str(content).strip()}")
    if not turns:
        return ""
    return "Historial reciente de la conversación:\n" + "\n".join(turns) + "\n\n"


def _safe_json(data: Any) -> str:
    try:
        return json.dumps(data, ensure_ascii=False, indent=2, default=str)
    except TypeError:
        return str(data)
