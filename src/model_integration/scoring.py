"""Safe ML/anomaly model scoring integration."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from src.model_integration.artifacts import load_joblib_artifact, unpack_model_artifact
from src.model_integration.features import as_model_input, select_feature_columns
from src.model_integration.paths import ANOMALY_PATH, CLASSIFIER_PATH
from src.model_integration.predictors import anomaly_scores, classifier_scores

NEUTRAL_MODEL_SCORE = 50.0


def enrich_claims_with_model_scores(
    claims: list[dict[str, Any]],
    classifier_path: Path = CLASSIFIER_PATH,
    anomaly_path: Path = ANOMALY_PATH,
) -> list[dict[str, Any]]:
    enriched = [dict(claim) for claim in claims]
    _apply_classifier(enriched, load_joblib_artifact(classifier_path))
    _apply_anomaly(enriched, load_joblib_artifact(anomaly_path))
    return enriched


def enrich_claims_with_loaded_models(
    claims: list[dict[str, Any]],
    classifier_artifact: Any | None = None,
    anomaly_artifact: Any | None = None,
) -> list[dict[str, Any]]:
    enriched = [dict(claim) for claim in claims]
    _apply_classifier(enriched, classifier_artifact)
    _apply_anomaly(enriched, anomaly_artifact)
    return enriched


def _apply_classifier(claims: list[dict[str, Any]], artifact: Any | None) -> None:
    if artifact is None:
        for claim in claims:
            claim.setdefault("score_modelo", NEUTRAL_MODEL_SCORE)
            claim["modelo_disponible"] = False
        return

    model, feature_columns, _metadata = unpack_model_artifact(artifact)
    if model is None:
        _apply_classifier(claims, None)
        return

    columns = select_feature_columns(claims, feature_columns)
    scores = classifier_scores(model, as_model_input(claims, columns))
    for claim, score in zip(claims, scores):
        claim["score_modelo"] = score
        claim["modelo_disponible"] = True
        claim["modelo_features"] = columns


def _apply_anomaly(claims: list[dict[str, Any]], artifact: Any | None) -> None:
    if artifact is None:
        for claim in claims:
            claim.setdefault("score_anomalia", NEUTRAL_MODEL_SCORE)
            claim["anomalia_disponible"] = False
        return

    model, feature_columns, _metadata = unpack_model_artifact(artifact)
    if model is None:
        _apply_anomaly(claims, None)
        return

    columns = select_feature_columns(claims, feature_columns)
    scores = anomaly_scores(model, as_model_input(claims, columns))
    for claim, score in zip(claims, scores):
        claim["score_anomalia"] = score
        claim["anomalia_disponible"] = True
        claim["anomalia_features"] = columns
