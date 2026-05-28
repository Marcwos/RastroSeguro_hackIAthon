"""Curated questions aligned to PDF §12."""

from __future__ import annotations

QUICK_QUESTIONS = [
    "¿Cuáles son los 10 siniestros con mayor riesgo de posible fraude?",
    "¿Por qué el siniestro SIN-001 fue marcado como alto riesgo?",
    "Genera expediente antifraude del siniestro SIN-001.",
    "¿Qué proveedores concentran más alertas?",
    "¿Qué ramos tienen mayor porcentaje de casos sospechosos?",
    "¿Qué ciudades presentan mayor concentración de alertas?",
    "¿Qué asegurados tienen mayor frecuencia de reclamos?",
    "¿Qué documentos faltan en los casos críticos?",
    "¿Qué casos tienen montos atípicos?",
    "¿Qué siniestros ocurrieron cerca del inicio de la póliza?",
    "¿Qué patrones se repiten en los reclamos sospechosos?",
    "Genera un resumen ejecutivo de los casos críticos.",
    "Muéstrame los casos estrella para la demo ejecutiva.",
    "¿Cuál es el impacto de negocio del top 10% priorizado?",
    "Recomienda qué casos debería revisar primero el analista.",
]


def get_quick_questions() -> list[str]:
    try:
        from src.agent import tools
        top_claims = tools.get_top_risky_claims(limit=1)
        if top_claims:
            top_id = top_claims[0]["id_siniestro"]
            questions = QUICK_QUESTIONS.copy()
            questions[1] = f"¿Por qué el siniestro {top_id} fue marcado como alto riesgo?"
            return questions
    except Exception:
        pass
    return QUICK_QUESTIONS.copy()
