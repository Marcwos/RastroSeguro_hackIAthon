"""Simple intent router for the antifraud agent."""

from __future__ import annotations


def route_intent(question: str) -> str:
    text = question.lower()
    if "proveedor" in text:
        return "ranking_proveedores"
    if "ciudad" in text:
        return "ranking_ciudades"
    if "ramo" in text or "ramos" in text:
        return "riesgo_por_ramo"
    if "document" in text:
        return "documentos_faltantes"
    if "resumen" in text or "ejecutivo" in text:
        return "resumen_ejecutivo"
    if "simula" in text:
        return "simular_siniestro"
    if "explica" in text or "por qué" in text or "porque" in text:
        return "explicar_siniestro"
    return "top_riesgo"
