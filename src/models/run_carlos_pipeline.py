"""End-to-end Carlos deliverables pipeline."""

from __future__ import annotations

import argparse
import json

from pathlib import Path

import pandas as pd

from src.data.export_complementary_tables import export_complementary_tables
from src.data.export_features import DEFAULT_OUTPUT as FEATURES_PATH
from src.data.export_features import export_features
from src.data.generate_synthetic_data import generate_dataset, validate_dataset
from src.data.generate_synthetic_data import DEFAULT_OUTPUT as SINIESTROS_PATH
from src.models.build_star_cases import build_star_cases, OUTPUT_PATH as STAR_CASES_PATH
from src.models.build_pdf_benchmark import build_benchmark, OUTPUT_PATH as BENCHMARK_PATH
from src.models.train_anomaly import train_anomaly
from src.models.train_classifier import train_classifier
from src.scoring.final_score import run_scoring

ROOT = Path(__file__).resolve().parents[2]
CURATED_ECUADOR = ROOT / "data" / "curated" / "ecuador"
AGENT_READY_DIR = ROOT / "data" / "processed" / "agent_ready"
CANONICAL_SOURCE = AGENT_READY_DIR / "siniestros_canonico.csv"


def _ensure_ecuador_curated() -> None:
    required = [
        CURATED_ECUADOR / "supplier_risk_features.csv",
        CURATED_ECUADOR / "sercop_sanciones_curated.csv",
        CURATED_ECUADOR / "ocds_contratos_curated.csv",
    ]
    if all(path.exists() for path in required):
        return
    from src.ingestion.model_curated_dataset import DEFAULT_OUT, run as run_curation

    run_curation(
        DEFAULT_OUT,
        skip_ecu911=True,
        ecu911_max_rows=0,
        skip_inec=False,
        inec_max_rows=0,
    )


def _ensure_agent_ready(rows: int, seed: int) -> None:
    from src.ingestion.build_agent_ready_dataset import (
        CANONICAL_FIELDS,
        OUT_DIR_DEFAULT,
        build_agent_ready_siniestros,
        write_rag_chunks,
        _write_csv,
    )

    AGENT_READY_DIR.mkdir(parents=True, exist_ok=True)
    sin_rows, prov_rows, qa = build_agent_ready_siniestros(target_rows=rows, seed=seed)
    sin_path = OUT_DIR_DEFAULT / "siniestros_canonico.csv"
    prov_path = OUT_DIR_DEFAULT / "proveedores_contexto.csv"
    qa_path = OUT_DIR_DEFAULT / "qa_agent_ready.json"
    rag_path = OUT_DIR_DEFAULT / "rag_chunks_siniestros.jsonl"

    _write_csv(sin_path, sin_rows, CANONICAL_FIELDS)
    _write_csv(
        prov_path,
        prov_rows,
        [
            "supplier_ruc",
            "supplier_risk_signal_score",
            "supplier_risk_band",
            "sanciones_total",
            "contratos_total",
            "provincia_muestra",
        ],
    )
    qa["paths"] = {
        "siniestros_canonico": str(sin_path.relative_to(ROOT)),
        "proveedores_contexto": str(prov_path.relative_to(ROOT)),
        "rag_chunks": str(rag_path.relative_to(ROOT)),
    }
    qa["rag_chunks"] = write_rag_chunks(sin_rows, rag_path, limit=min(rows, 50000))
    qa_path.write_text(json.dumps(qa, ensure_ascii=False, indent=2), encoding="utf-8")


def _run_scoring_window(max_rows: int) -> Path:
    if max_rows <= 0:
        return run_scoring()
    df = pd.read_csv(SINIESTROS_PATH, nrows=max_rows)
    temp_input = SINIESTROS_PATH.parent / "siniestros_scoring_window.csv"
    temp_input.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(temp_input, index=False)
    scored = run_scoring(input_path=temp_input)
    try:
        temp_input.unlink(missing_ok=True)
    except Exception:
        pass
    return scored


def run_all(rows: int = 25000, seed: int = 42, scoring_rows: int = 3000) -> dict:
    _ensure_ecuador_curated()
    _ensure_agent_ready(rows=rows, seed=seed)

    df = generate_dataset(rows=rows, seed=seed, source=CANONICAL_SOURCE)
    SINIESTROS_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(SINIESTROS_PATH, index=False)
    qa_dataset = validate_dataset(df)
    qa_path = SINIESTROS_PATH.parent / "siniestros_qa.json"
    qa_path.write_text(json.dumps(qa_dataset, ensure_ascii=False, indent=2), encoding="utf-8")

    complementary_paths = export_complementary_tables(SINIESTROS_PATH)

    features_path = export_features()
    classifier_path = train_classifier()
    anomaly_path = train_anomaly()
    scored_path = _run_scoring_window(scoring_rows)

    star_cases = build_star_cases(scored_path)
    STAR_CASES_PATH.write_text(json.dumps(star_cases, ensure_ascii=False, indent=2), encoding="utf-8")
    benchmark = build_benchmark(scored_path)
    BENCHMARK_PATH.write_text(json.dumps(benchmark, ensure_ascii=False, indent=2), encoding="utf-8")

    return {
        "dataset": str(SINIESTROS_PATH),
        "features": str(features_path),
        "features_meta": str(FEATURES_PATH.parent / "features_meta.json"),
        "classifier": str(classifier_path),
        "anomaly": str(anomaly_path),
        "scored": str(scored_path),
        "star_cases": str(STAR_CASES_PATH),
        "benchmark": str(BENCHMARK_PATH),
        "dataset_qa": qa_dataset,
        "scoring_rows": scoring_rows,
        "ecuador_lineage": df["data_source_lineage"].iloc[0] if "data_source_lineage" in df.columns and len(df) else "",
        "complementary_tables": complementary_paths,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Pipeline completo de entregables Carlos")
    parser.add_argument("--rows", type=int, default=25000)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--scoring-rows", type=int, default=3000)
    args = parser.parse_args()
    summary = run_all(rows=args.rows, seed=args.seed, scoring_rows=args.scoring_rows)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
