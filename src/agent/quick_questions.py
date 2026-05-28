"""Curated questions aligned to PDF §12."""

from __future__ import annotations

QUICK_QUESTIONS = [
    "¿Cuáles son los 10 siniestros con mayor riesgo de posible fraude?",
    "¿Por qué el siniestro SIN-000001 fue marcado como alto riesgo?",
    "¿Qué proveedores concentran más alertas?",
    "¿Qué ramos tienen mayor porcentaje de casos sospechosos?",
    "¿Qué ciudades presentan mayor concentración de alertas?",
    "¿Qué asegurados tienen mayor frecuencia de reclamos?",
    "¿Qué documentos faltan en los casos críticos?",
    "¿Qué casos tienen montos atípicos?",
    "¿Qué siniestros ocurrieron cerca del inicio de la póliza?",
    "¿Qué patrones se repiten en los reclamos sospechosos?",
    "Genera un resumen ejecutivo de los casos críticos.",
    "Recomienda qué casos debería revisar primero el analista.",
]


def get_quick_questions() -> list[str]:
    return QUICK_QUESTIONS.copy()
