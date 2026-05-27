"""Intent definitions for the tool-backed antifraud agent."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class IntentMatch:
    name: str
    confidence: float
    requires_claim_id: bool = False
    uses_documentation: bool = False


INTENT_ALIASES = {
    "top_riesgo": ["top", "mayor riesgo", "mas riesgo", "más riesgo", "prioridad", "priorizar"],
    "explicar_siniestro": ["explica", "explicame", "explícame", "por que", "por qué", "detalle", "porque"],
    "ranking_proveedores": ["proveedor", "proveedores", "taller", "clinica", "clínica"],
    "ranking_ciudades": ["ciudad", "ciudades", "zona"],
    "riesgo_por_ramo": ["ramo", "ramos", "multi ramo", "multiramo"],
    "documentos_faltantes": ["documento", "documentos", "faltan", "incompletos"],
    "narrativas_similares": ["narrativa", "narrativas", "relato", "relatos", "similares", "clonada", "clonadas"],
    "conexiones_grafo": ["grafo", "relacion", "relación", "conexiones", "red"],
    "resumen_ejecutivo": ["resumen", "ejecutivo", "gerencia"],
    "simular_siniestro": ["simula", "simular", "simulación", "simulacion", "nuevo siniestro"],
    "documentacion": ["regla", "reglas", "score", "metodologia", "metodología", "limitacion", "limitación", "etica", "ética"],
}

CLAIM_REQUIRED_INTENTS = {"explicar_siniestro", "narrativas_similares", "conexiones_grafo"}
DOC_INTENTS = {"documentacion"}
