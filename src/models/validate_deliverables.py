"""Validate Carlos deliverables contract and artifact integrity."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = ROOT / "data" / "synthetic" / "siniestros.csv"
FEATURES_PATH = ROOT / "data" / "processed" / "features.csv"
CLASSIFIER_PATH = ROOT / "models" / "fraud_classifier.joblib"
ANOMALY_PATH = ROOT / "models" / "anomaly_detector.joblib"
METRICS_PATH = ROOT / "reports" / "model_metrics.json"
STAR_CASES_PATH = ROOT / "reports" / "casos_estrella.json"
SCORED_PATH = ROOT / "data" / "processed" / "siniestros_scored.csv"

REQUIRED_DATASET_COLUMNS = [
    "id_siniestro",
    "id_poliza",
    "id_asegurado",
    "ramo",
    "cobertura",
    "ciudad",
    "id_proveedor",
    "beneficiario",
    "fecha_inicio_poliza",
    "fecha_fin_poliza",
    "fecha_ocurrencia",
    "fecha_reporte",
    "monto_reclamado",
    "monto_estimado",
    "suma_asegurada",
    "descripcion",
    "documentos_completos",
    "documentos_inconsistentes",
    "historial_siniestros_asegurado",
    "etiqueta_fraude_simulada",
]


def _artifact_contract_ok(path: Path) -> tuple[bool, list[str]]:
    errors: list[str] = []
    if not path.exists():
        return False, [f"missing {path}"]
    artifact = joblib.load(path)
    if not isinstance(artifact, dict):
        return False, [f"{path.name} no es dict compatible"]
    for key in ("model", "feature_columns", "metrics"):
        if key not in artifact:
            errors.append(f"{path.name} missing key {key}")
    return not errors, errors


def validate() -> dict:
    errors: list[str] = []
    summary: dict[str, object] = {}

    if not DATASET_PATH.exists():
        errors.append("missing dataset")
        return {"ok": False, "errors": errors}

    df = pd.read_csv(DATASET_PATH)
    summary["dataset_rows"] = int(len(df))
    missing_cols = [c for c in REQUIRED_DATASET_COLUMNS if c not in df.columns]
    if missing_cols:
        errors.append(f"missing dataset columns: {missing_cols}")
    if df["id_siniestro"].duplicated().any():
        errors.append("duplicate id_siniestro")
    if df["id_siniestro"].isna().any():
        errors.append("null id_siniestro")

    if not FEATURES_PATH.exists():
        errors.append("missing features.csv")
    else:
        fdf = pd.read_csv(FEATURES_PATH)
        summary["features_rows"] = int(len(fdf))

    clf_ok, clf_errors = _artifact_contract_ok(CLASSIFIER_PATH)
    an_ok, an_errors = _artifact_contract_ok(ANOMALY_PATH)
    if not clf_ok:
        errors.extend(clf_errors)
    if not an_ok:
        errors.extend(an_errors)

    for required in (METRICS_PATH, STAR_CASES_PATH, SCORED_PATH):
        if not required.exists():
            errors.append(f"missing {required}")

    summary["ok"] = not errors
    summary["errors"] = errors
    return summary


def main() -> None:
    report = validate()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if not report["ok"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

