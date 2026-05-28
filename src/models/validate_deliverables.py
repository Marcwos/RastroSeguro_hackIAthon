"""Validate Carlos deliverables contract and artifact integrity."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd

from src.data.ecuador_context import ECUADOR_EXTENSION_COLUMNS
from src.data.generate_synthetic_data import PDF_EXTENSION_COLUMNS

ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = ROOT / "data" / "synthetic" / "siniestros.csv"
FEATURES_PATH = ROOT / "data" / "processed" / "features.csv"
CLASSIFIER_PATH = ROOT / "models" / "fraud_classifier.joblib"
ANOMALY_PATH = ROOT / "models" / "anomaly_detector.joblib"
METRICS_PATH = ROOT / "reports" / "model_metrics.json"
STAR_CASES_PATH = ROOT / "reports" / "casos_estrella.json"
BENCHMARK_PATH = ROOT / "reports" / "benchmark_preguntas_pdf.json"
SCORED_PATH = ROOT / "data" / "processed" / "siniestros_scored.csv"
QA_PATH = ROOT / "data" / "synthetic" / "siniestros_qa.json"
SYNTHETIC_DIR = ROOT / "data" / "synthetic"
DOCS_DIR = ROOT / "docs"
NOTEBOOKS_DIR = ROOT / "notebooks"

PDF_DATASET_COLUMNS = PDF_EXTENSION_COLUMNS
COMPLEMENTARY_TABLES = ["polizas.csv", "asegurados.csv", "proveedores.csv", "documentos.csv", "dataset_manifest.json"]
REQUIRED_DOCS = ["reglas_negocio.md", "modelo_datos.md", "limitaciones.md"]
REQUIRED_NOTEBOOKS = [
    "01_exploracion_datos.ipynb",
    "02_modelo_fraude.ipynb",
    "03_evaluacion_modelo.ipynb",
]

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

    missing_ecuador = [c for c in ECUADOR_EXTENSION_COLUMNS if c not in df.columns]
    summary["ecuador_extension_columns_present"] = [c for c in ECUADOR_EXTENSION_COLUMNS if c in df.columns]
    if missing_ecuador:
        errors.append(f"missing ecuador extension columns: {missing_ecuador}")

    missing_pdf = [c for c in PDF_DATASET_COLUMNS if c not in df.columns]
    summary["pdf_extension_columns_present"] = [c for c in PDF_DATASET_COLUMNS if c in df.columns]
    if missing_pdf:
        errors.append(f"missing pdf extension columns: {missing_pdf}")

    for table in COMPLEMENTARY_TABLES:
        path = SYNTHETIC_DIR / table
        if not path.exists():
            errors.append(f"missing complementary table {path}")
        elif path.suffix == ".csv":
            rows = len(pd.read_csv(path))
            summary[f"rows_{table.replace('.csv', '')}"] = rows
            if rows < 1:
                errors.append(f"empty complementary table {table}")

    for doc in REQUIRED_DOCS:
        if not (DOCS_DIR / doc).exists():
            errors.append(f"missing doc {doc}")

    for nb in REQUIRED_NOTEBOOKS:
        if not (NOTEBOOKS_DIR / nb).exists():
            errors.append(f"missing notebook {nb}")

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

    if not QA_PATH.exists():
        errors.append(f"missing {QA_PATH}")
    else:
        qa = json.loads(QA_PATH.read_text(encoding="utf-8"))
        summary["qa_ok"] = bool(qa.get("ok"))
        summary["ecuador_coverage"] = qa.get("ecuador_coverage", {})
        coverage = qa.get("signal_coverage", {})
        weak = [k for k, v in coverage.items() if float(v) < 0.01]
        if weak:
            errors.append(f"signal coverage too low: {weak}")
        ecuador = qa.get("ecuador_coverage", {})
        if ecuador.get("supplier_ruc_real_rate", 0) < 0.5:
            errors.append("ecuador supplier_ruc_real_rate below 0.5")
        if ecuador.get("lista_restrictiva_rate", 0) < 0.001:
            errors.append("ecuador lista_restrictiva_rate below 0.001")

    if STAR_CASES_PATH.exists():
        payload = json.loads(STAR_CASES_PATH.read_text(encoding="utf-8"))
        levels = {str(item.get("nivel_riesgo", "")).lower() for item in payload.get("cases", [])}
        if "rojo" not in levels or "amarillo" not in levels:
            errors.append("casos_estrella must include both Rojo and Amarillo")
        summary["star_cases_count"] = int(payload.get("count", 0))

    if not BENCHMARK_PATH.exists():
        errors.append(f"missing {BENCHMARK_PATH}")
    else:
        bench = json.loads(BENCHMARK_PATH.read_text(encoding="utf-8"))
        q_count = len(bench.get("questions", []))
        summary["benchmark_questions"] = q_count
        if q_count < 12:
            errors.append("benchmark preguntas insuficiente (<12)")

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

