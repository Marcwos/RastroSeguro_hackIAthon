"""Claim-level explainability helpers."""

from __future__ import annotations

from pathlib import Path
from typing import Any


from src.scoring.final_score import OUTPUT_PATH, score_claim
from src.utils.serialization import from_json_list


def explain_claim(id_siniestro: str, data_path: Path = OUTPUT_PATH) -> dict[str, Any]:
    if not data_path.exists():
        raise FileNotFoundError(
            f"No se encontró {data_path}. Ejecuta primero: python -m src.scoring.final_score"
        )

    import pandas as pd

    df = pd.read_csv(data_path)
    matches = df[df["id_siniestro"].astype(str) == str(id_siniestro)]
    if matches.empty:
        raise ValueError(f"No se encontró el siniestro {id_siniestro} en {data_path}.")

    row = matches.iloc[0].to_dict()
    alerts = from_json_list(row.get("alertas_activadas"))
    return {
        "id_siniestro": row.get("id_siniestro"),
        "score_final": row.get("score_final"),
        "nivel_riesgo": row.get("nivel_riesgo"),
        "alertas": alerts,
        "explicacion": row.get("explicacion"),
        "accion_sugerida": row.get("accion_sugerida"),
        "componentes_score": {
            "reglas": row.get("score_reglas"),
            "modelo": row.get("score_modelo"),
            "anomalia": row.get("score_anomalia"),
            "nlp": row.get("score_nlp"),
            "grafo": row.get("score_grafo"),
            "categorico": row.get("score_categorico"),
        },
    }


def explain_unsaved_claim(claim: dict[str, Any]) -> dict[str, Any]:
    scored = score_claim(claim)
    return {
        "id_siniestro": scored.get("id_siniestro", "SIMULADO"),
        "score_final": scored["score_final"],
        "nivel_riesgo": scored["nivel_riesgo"],
        "alertas": scored["alertas_activadas"],
        "explicacion": scored["explicacion"],
        "accion_sugerida": scored["accion_sugerida"],
        "componentes_score": {
            "reglas": scored["score_reglas"],
            "modelo": scored["score_modelo"],
            "anomalia": scored["score_anomalia"],
            "nlp": scored["score_nlp"],
            "grafo": scored["score_grafo"],
            "categorico": scored["score_categorico"],
        },
    }
