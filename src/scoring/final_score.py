"""Final scoring pipeline for RastroSeguro."""

from __future__ import annotations

from pathlib import Path
from typing import Any


from src.categorical.scoring import enrich_claims_with_categorical
from src.graph.scoring import enrich_claims_with_graph
from src.model_integration.scoring import enrich_claims_with_model_scores
from src.nlp.scoring import enrich_claims_with_nlp
from src.rules.rule_registry import evaluate_rules, rules_score
from src.utils.risk_levels import clamp_score, risk_level, suggested_action
from src.utils.serialization import to_json

INPUT_PATH = Path("data/synthetic/siniestros.csv")
OUTPUT_PATH = Path("data/processed/siniestros_scored.csv")
NEUTRAL_COMPONENT_SCORE = 50.0

COMPONENT_WEIGHTS = {
    "score_reglas": 0.30,
    "score_modelo": 0.25,
    "score_anomalia": 0.15,
    "score_nlp": 0.15,
    "score_grafo": 0.10,
    "score_categorico": 0.05,
}

TARGET_RISK_DISTRIBUTION = {
    "verde": 0.60,
    "amarillo": 0.25,
    "rojo": 0.15,
}


def compute_final_score(components: dict[str, float | int | None]) -> float:
    score = 0.0
    for name, weight in COMPONENT_WEIGHTS.items():
        value = components.get(name, NEUTRAL_COMPONENT_SCORE)
        score += clamp_score(value) * weight
    return round(clamp_score(score), 2)


def build_explanation(row: dict[str, Any], alerts: list[dict[str, Any]]) -> str:
    claim_id = row.get("id_siniestro", "el siniestro")
    level = row.get("nivel_riesgo", "Sin clasificar")
    if not alerts:
        return f"El siniestro {claim_id} fue clasificado como {level} sin alertas críticas activadas. Mantener revisión habitual."

    top_alerts = sorted(alerts, key=lambda item: item.get("points", 0), reverse=True)[:4]
    reasons = "; ".join(item.get("message", item.get("name", "alerta")) for item in top_alerts)
    return (
        f"El siniestro {claim_id} fue clasificado como {level} porque acumula señales de riesgo: "
        f"{reasons}. El resultado es una priorización para revisión humana, no una acusación de fraude."
    )


def score_claim(claim: dict[str, Any]) -> dict[str, Any]:
    rule_results = evaluate_rules(claim)
    alerts = [result.to_dict() for result in rule_results]
    score_reglas = rules_score(rule_results)

    components = {
        "score_reglas": score_reglas,
        "score_modelo": claim.get("score_modelo", NEUTRAL_COMPONENT_SCORE),
        "score_anomalia": claim.get("score_anomalia", NEUTRAL_COMPONENT_SCORE),
        "score_nlp": claim.get("score_nlp", NEUTRAL_COMPONENT_SCORE),
        "score_grafo": claim.get("score_grafo", NEUTRAL_COMPONENT_SCORE),
        "score_categorico": claim.get("score_categorico", NEUTRAL_COMPONENT_SCORE),
    }
    final = compute_final_score(components)
    # Guardrail: strong audited rules should be able to escalate even while
    # ML/NLP/graph components are still neutral or unavailable.
    if score_reglas >= 90:
        final = max(final, 80.0)
    elif score_reglas >= 75:
        final = max(final, 76.0)
    level = risk_level(final)

    scored = dict(claim)
    scored.update(components)
    scored["score_final"] = final
    scored["nivel_riesgo"] = level
    scored["alertas_activadas"] = alerts
    scored["rule_trace"] = [
        {
            "code": alert.get("code"),
            "pdf_ref": alert.get("pdf_ref"),
            "points": alert.get("points"),
            "severity": alert.get("severity"),
            "category": alert.get("category"),
            "evidence": alert.get("evidence", {}),
        }
        for alert in alerts
    ]
    scored["explicacion"] = build_explanation(scored, alerts)
    scored["accion_sugerida"] = suggested_action(level)
    return scored


def _apply_portfolio_risk_calibration(df):
    """Calibrate portfolio mix to avoid unrealistically red-heavy outputs."""
    if df.empty or "score_final" not in df.columns:
        return df
    calibrated = df.copy()
    rank_desc = calibrated["score_final"].rank(method="first", ascending=False)
    pct_desc = (rank_desc - 1) / max(len(calibrated) - 1, 1)

    red_cut = TARGET_RISK_DISTRIBUTION["rojo"]
    amber_cut = TARGET_RISK_DISTRIBUTION["rojo"] + TARGET_RISK_DISTRIBUTION["amarillo"]

    def level_from_pct(p: float) -> str:
        if p <= red_cut:
            return "Rojo"
        if p <= amber_cut:
            return "Amarillo"
        return "Verde"

    calibrated["nivel_riesgo"] = pct_desc.map(level_from_pct)

    # Keep strongly audited rule cases escalated.
    if "score_reglas" in calibrated.columns:
        strong = calibrated["score_reglas"].astype(float) >= 90
        medium = calibrated["score_reglas"].astype(float) >= 75
        calibrated.loc[strong, "nivel_riesgo"] = "Rojo"
        calibrated.loc[~strong & medium, "nivel_riesgo"] = calibrated.loc[~strong & medium, "nivel_riesgo"].replace(
            {"Verde": "Amarillo"}
        )

    mapped_score = calibrated["nivel_riesgo"].map({"Verde": 30.0, "Amarillo": 60.0, "Rojo": 85.0}).astype(float)
    calibrated["score_final"] = calibrated["score_final"].astype(float) * 0.35 + mapped_score * 0.65
    calibrated["score_final"] = calibrated["score_final"].clip(0, 100).round(2)
    calibrated["accion_sugerida"] = calibrated["nivel_riesgo"].map(suggested_action)
    return calibrated


def score_dataframe(df):
    import pandas as pd

    claims = [row.dropna().to_dict() for _, row in df.iterrows()]
    if claims:
        claims = enrich_claims_with_graph(claims)
        claims = enrich_claims_with_categorical(claims)
        claims = enrich_claims_with_model_scores(claims)
    if claims and any(claim.get("descripcion") for claim in claims):
        claims = enrich_claims_with_nlp(claims)
    scored_rows = [score_claim(claim) for claim in claims]
    result = pd.DataFrame(scored_rows)
    result = _apply_portfolio_risk_calibration(result)
    for column in ("alertas_activadas", "siniestros_similares", "entidades_recurrentes", "conexiones_grafo", "senales_categoricas", "modelo_features", "anomalia_features"):
        if column in result.columns:
            result[column] = result[column].apply(to_json)
    if "rule_trace" in result.columns:
        result["rule_trace"] = result["rule_trace"].apply(to_json)
    return result


def run_scoring(input_path: Path = INPUT_PATH, output_path: Path = OUTPUT_PATH) -> Path:
    if not input_path.exists():
        raise FileNotFoundError(
            f"No se encontró {input_path}. Pide a Carlos generar el dataset oficial con: "
            "python -m src.data.generate_synthetic_data"
        )
    import pandas as pd

    df = pd.read_csv(input_path)
    scored = score_dataframe(df)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    scored.to_csv(output_path, index=False)
    return output_path


if __name__ == "__main__":
    try:
        path = run_scoring()
    except FileNotFoundError as exc:
        print(str(exc))
        raise SystemExit(1) from None
    print(f"Scoring generado en {path}")
