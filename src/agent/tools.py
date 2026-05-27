"""Deterministic analytical tools used by the antifraud agent and UI."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

from src.explainability.explain_claim import explain_claim
from src.scoring.final_score import OUTPUT_PATH
from src.simulator.simulate_claim import simulate_new_claim
from src.utils.serialization import from_json_list


def _load_scored(data_path: Path = OUTPUT_PATH) -> pd.DataFrame:
    if not data_path.exists():
        raise FileNotFoundError(f"No se encontró {data_path}. Ejecuta python -m src.scoring.final_score")
    return pd.read_csv(data_path)


def get_top_risky_claims(limit: int = 10, data_path: Path = OUTPUT_PATH) -> list[dict[str, Any]]:
    df = _load_scored(data_path)
    columns = [col for col in ["id_siniestro", "ramo", "ciudad", "id_proveedor", "score_final", "nivel_riesgo", "accion_sugerida"] if col in df.columns]
    return df.sort_values("score_final", ascending=False).head(limit)[columns].to_dict("records")


def get_risk_by_branch(data_path: Path = OUTPUT_PATH) -> list[dict[str, Any]]:
    df = _load_scored(data_path)
    grouped = df.groupby("ramo", dropna=False).agg(
        total_siniestros=("id_siniestro", "count"),
        score_promedio=("score_final", "mean"),
        casos_rojos=("nivel_riesgo", lambda s: int((s == "Rojo").sum())),
    ).reset_index()
    grouped["score_promedio"] = grouped["score_promedio"].round(2)
    return grouped.to_dict("records")


def get_provider_risk_ranking(limit: int = 10, data_path: Path = OUTPUT_PATH) -> list[dict[str, Any]]:
    df = _load_scored(data_path)
    if "id_proveedor" not in df.columns:
        return []
    grouped = df.groupby("id_proveedor", dropna=False).agg(
        total_siniestros=("id_siniestro", "count"),
        score_promedio=("score_final", "mean"),
        casos_rojos=("nivel_riesgo", lambda s: int((s == "Rojo").sum())),
    ).reset_index()
    grouped["score_promedio"] = grouped["score_promedio"].round(2)
    return grouped.sort_values(["casos_rojos", "score_promedio"], ascending=False).head(limit).to_dict("records")


def get_city_risk_distribution(data_path: Path = OUTPUT_PATH) -> list[dict[str, Any]]:
    df = _load_scored(data_path)
    if "ciudad" not in df.columns:
        return []
    grouped = df.groupby("ciudad", dropna=False).agg(
        total_siniestros=("id_siniestro", "count"),
        score_promedio=("score_final", "mean"),
        casos_rojos=("nivel_riesgo", lambda s: int((s == "Rojo").sum())),
    ).reset_index()
    grouped["score_promedio"] = grouped["score_promedio"].round(2)
    return grouped.sort_values(["casos_rojos", "score_promedio"], ascending=False).to_dict("records")


def get_missing_documents(data_path: Path = OUTPUT_PATH) -> list[dict[str, Any]]:
    df = _load_scored(data_path)
    if "documentos_completos" not in df.columns:
        return []
    mask = df["documentos_completos"].astype(str).str.lower().isin(["false", "0", "no", "nan"])
    columns = [col for col in ["id_siniestro", "ramo", "score_final", "nivel_riesgo", "documentos_completos"] if col in df.columns]
    return df[mask].sort_values("score_final", ascending=False)[columns].to_dict("records")


def recommend_review_order(limit: int = 20, data_path: Path = OUTPUT_PATH) -> list[dict[str, Any]]:
    return get_top_risky_claims(limit=limit, data_path=data_path)


def generate_executive_summary(data_path: Path = OUTPUT_PATH) -> dict[str, Any]:
    df = _load_scored(data_path)
    total = len(df)
    red = int((df["nivel_riesgo"] == "Rojo").sum())
    yellow = int((df["nivel_riesgo"] == "Amarillo").sum())
    green = int((df["nivel_riesgo"] == "Verde").sum())
    amount_red = float(df.loc[df["nivel_riesgo"] == "Rojo", "monto_reclamado"].sum()) if "monto_reclamado" in df.columns else 0.0
    return {
        "total_siniestros": total,
        "casos_rojos": red,
        "casos_amarillos": yellow,
        "casos_verdes": green,
        "porcentaje_rojo": round((red / total) * 100, 2) if total else 0,
        "monto_reclamado_casos_rojos": round(amount_red, 2),
        "top_casos": get_top_risky_claims(limit=5, data_path=data_path),
        "top_proveedores": get_provider_risk_ranking(limit=5, data_path=data_path),
    }


def get_similar_narratives(id_siniestro: str, data_path: Path = OUTPUT_PATH) -> list[dict[str, Any]]:
    df = _load_scored(data_path)
    if "siniestros_similares" not in df.columns:
        return []
    row = df[df["id_siniestro"].astype(str) == str(id_siniestro)]
    if row.empty:
        return []
    return from_json_list(row.iloc[0].get("siniestros_similares"))


def get_graph_connections(id_siniestro: str, data_path: Path = OUTPUT_PATH) -> dict[str, Any]:
    df = _load_scored(data_path)
    row = df[df["id_siniestro"].astype(str) == str(id_siniestro)]
    if row.empty:
        return {"id_siniestro": id_siniestro, "connections": []}
    record = row.iloc[0].to_dict()
    connections = []
    for field in ["id_asegurado", "id_proveedor", "beneficiario", "id_vehiculo", "ciudad", "ramo", "cobertura"]:
        if field in record and pd.notna(record[field]):
            connections.append({"type": field, "value": record[field]})
    return {"id_siniestro": id_siniestro, "connections": connections}


def compare_branches(data_path: Path = OUTPUT_PATH) -> list[dict[str, Any]]:
    return get_risk_by_branch(data_path=data_path)
