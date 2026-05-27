"""Curated questions for Justin's UI quick actions."""

from __future__ import annotations

QUICK_QUESTIONS = [
    "¿Cuáles son los 10 siniestros con mayor riesgo?",
    "¿Qué proveedores concentran más alertas rojas?",
    "¿Qué ciudades tienen mayor concentración de riesgo?",
    "¿Qué ramo concentra mayor riesgo?",
    "Genera un resumen ejecutivo de los casos críticos.",
    "¿Qué documentos faltan en los casos críticos?",
    "Explícame el siniestro SIN-0001.",
    "¿Qué narrativas son similares para SIN-0001?",
    "¿Qué conexiones de grafo tiene SIN-0001?",
]


def get_quick_questions() -> list[str]:
    return QUICK_QUESTIONS.copy()
