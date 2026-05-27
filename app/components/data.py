"""Datos mock para el boceto de UI."""

from __future__ import annotations

from pathlib import Path

import pandas as pd
import streamlit as st

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MOCK_CSV = PROJECT_ROOT / "data" / "synthetic" / "mock_siniestros_scored.csv"
PROCESSED_CSV = PROJECT_ROOT / "data" / "processed" / "siniestros_scored.csv"


@st.cache_data
def load_claims() -> pd.DataFrame:
    if PROCESSED_CSV.exists():
        return pd.read_csv(PROCESSED_CSV)
    if MOCK_CSV.exists():
        return pd.read_csv(MOCK_CSV)
    return _build_mock_dataframe()


def _build_mock_dataframe() -> pd.DataFrame:
    rows = [
        {
            "id_siniestro": "SIN-0045",
            "ramo": "vehiculos",
            "cobertura": "robo",
            "ciudad": "Guayaquil",
            "id_proveedor": "PROV-12",
            "monto_reclamado": 18500,
            "suma_asegurada": 19000,
            "score_reglas": 92,
            "score_modelo": 88,
            "score_anomalia": 80,
            "score_nlp": 91,
            "score_grafo": 75,
            "score_categorico": 70,
            "score_final": 87,
            "nivel_riesgo": "Rojo",
            "alertas_activadas": "Inicio póliza|Monto alto|Proveedor recurrente|Narrativa similar",
            "explicacion": "Siniestro 2 días después del inicio de póliza, monto al 97% de suma asegurada.",
            "accion_sugerida": "Escalar a revisión antifraude especializada.",
        },
        {
            "id_siniestro": "SIN-0112",
            "ramo": "vehiculos",
            "cobertura": "choque",
            "ciudad": "Quito",
            "id_proveedor": "PROV-03",
            "monto_reclamado": 4200,
            "suma_asegurada": 12000,
            "score_reglas": 35,
            "score_modelo": 78,
            "score_anomalia": 82,
            "score_nlp": 74,
            "score_grafo": 68,
            "score_categorico": 55,
            "score_final": 62,
            "nivel_riesgo": "Amarillo",
            "alertas_activadas": "Anomalía detectada|Proveedor en red",
            "explicacion": "Pocas reglas activas, pero anomalía y grafo sugieren revisión.",
            "accion_sugerida": "Revisión documental.",
        },
        {
            "id_siniestro": "SIN-0201",
            "ramo": "salud",
            "cobertura": "atencion_medica",
            "ciudad": "Cuenca",
            "id_proveedor": "PROV-21",
            "monto_reclamado": 890,
            "suma_asegurada": 5000,
            "score_reglas": 18,
            "score_modelo": 22,
            "score_anomalia": 15,
            "score_nlp": 10,
            "score_grafo": 12,
            "score_categorico": 8,
            "score_final": 16,
            "nivel_riesgo": "Verde",
            "alertas_activadas": "",
            "explicacion": "Sin señales relevantes de riesgo.",
            "accion_sugerida": "Continuar flujo normal.",
        },
        {
            "id_siniestro": "SIN-0330",
            "ramo": "hogar",
            "cobertura": "incendio",
            "ciudad": "Manta",
            "id_proveedor": "PROV-08",
            "monto_reclamado": 9800,
            "suma_asegurada": 10000,
            "score_reglas": 70,
            "score_modelo": 65,
            "score_anomalia": 58,
            "score_nlp": 62,
            "score_grafo": 55,
            "score_categorico": 60,
            "score_final": 64,
            "nivel_riesgo": "Amarillo",
            "alertas_activadas": "Reporte tardío|Monto cercano a suma asegurada",
            "explicacion": "Señales moderadas; revisar documentación de inspección.",
            "accion_sugerida": "Revisión documental.",
        },
        {
            "id_siniestro": "SIN-0418",
            "ramo": "vehiculos",
            "cobertura": "choque",
            "ciudad": "Guayaquil",
            "id_proveedor": "PROV-12",
            "monto_reclamado": 5100,
            "suma_asegurada": 15000,
            "score_reglas": 55,
            "score_modelo": 72,
            "score_anomalia": 68,
            "score_nlp": 88,
            "score_grafo": 70,
            "score_categorico": 50,
            "score_final": 68,
            "nivel_riesgo": "Amarillo",
            "alertas_activadas": "Narrativa clonada|Proveedor recurrente",
            "explicacion": "Narrativa similar a otros reclamos del mismo proveedor.",
            "accion_sugerida": "Revisión documental.",
        },
        {
            "id_siniestro": "SIN-0502",
            "ramo": "vida",
            "cobertura": "fallecimiento",
            "ciudad": "Quito",
            "id_proveedor": "PROV-30",
            "monto_reclamado": 45000,
            "suma_asegurada": 50000,
            "score_reglas": 85,
            "score_modelo": 79,
            "score_anomalia": 70,
            "score_nlp": 40,
            "score_grafo": 65,
            "score_categorico": 72,
            "score_final": 78,
            "nivel_riesgo": "Rojo",
            "alertas_activadas": "Beneficiario recurrente|Documentos inconsistentes",
            "explicacion": "Beneficiario aparece en varios casos observados.",
            "accion_sugerida": "Escalar a revisión antifraude especializada.",
        },
    ]
    return pd.DataFrame(rows)


def read_uploaded_claims_file(uploaded_file) -> pd.DataFrame:
    filename = uploaded_file.name.lower()
    if filename.endswith(".csv"):
        return pd.read_csv(uploaded_file)
    if filename.endswith(".xlsx"):
        return pd.read_excel(uploaded_file, engine="openpyxl")
    raise ValueError("Formato no soportado. Usa CSV o Excel (.xlsx).")


def ensure_mock_csv() -> None:
    MOCK_CSV.parent.mkdir(parents=True, exist_ok=True)
    if not MOCK_CSV.exists():
        _build_mock_dataframe().to_csv(MOCK_CSV, index=False)
