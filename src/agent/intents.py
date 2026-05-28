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
    "explicar_siniestro": ["explica", "explicame", "explícame", "por que", "por qué", "detalle", "porque", "por que este", "por qué este", "marcado como alto"],
    "expediente_siniestro": ["expediente", "ficha antifraude", "dossier", "investigacion", "investigación"],
    "ranking_proveedores": ["proveedor", "proveedores", "taller", "clinica", "clínica", "concentran", "alertas rojas"],
    "ranking_ciudades": ["ciudad", "ciudades", "zona", "concentracion", "concentración"],
    "riesgo_por_ramo": ["ramo", "ramos", "multi ramo", "multiramo", "sospechosos", "porcentaje"],
    "documentos_faltantes": ["documento", "documentos", "faltan", "incompletos", "criticos", "críticos"],
    "narrativas_similares": ["narrativa", "narrativas", "relato", "relatos", "similares", "clonada", "clonadas"],
    "conexiones_grafo": ["grafo", "relacion", "relación", "conexiones", "red"],
    "resumen_ejecutivo": ["resumen", "ejecutivo", "gerencia", "casos criticos", "casos críticos"],
    "casos_estrella": ["casos estrella", "demo ejecutiva", "casos demo", "caso rojo evidente", "rojo no evidente"],
    "impacto_negocio": ["impacto", "negocio", "ahorro", "exposicion", "exposición", "top 10%"],
    "recomendar_revision": ["recomienda", "revisar primero", "revisar primero", "orden de revision", "orden de revisión", "deberia revisar", "debería revisar"],
    "frecuencia_asegurados": ["asegurados", "frecuencia de reclamos", "mas reclamos", "más reclamos"],
    "montos_atipicos": ["montos atipicos", "montos atípicos", "monto atipico", "monto atípico"],
    "borde_vigencia": ["cerca del inicio", "inicio de la poliza", "inicio de la póliza", "borde de vigencia"],
    "patrones_repetidos": ["patrones", "patron", "patrón", "se repiten", "repetidos"],
    "simular_siniestro": ["simula", "simular", "simulación", "simulacion", "nuevo siniestro"],
    "documentacion": ["regla", "reglas", "score", "metodologia", "metodología", "limitacion", "limitación", "etica", "ética"],
}

CLAIM_REQUIRED_INTENTS = {"explicar_siniestro", "expediente_siniestro", "narrativas_similares", "conexiones_grafo"}
DOC_INTENTS = {"documentacion"}
