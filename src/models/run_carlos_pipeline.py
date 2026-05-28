"""End-to-end Carlos deliverables pipeline."""

from __future__ import annotations

import argparse
import json

from pathlib import Path

import pandas as pd

from src.data.export_features import DEFAULT_OUTPUT as FEATURES_PATH
from src.data.export_features import export_features
from src.data.generate_synthetic_data import generate_dataset, validate_dataset
from src.data.generate_synthetic_data import DEFAULT_OUTPUT as SINIESTROS_PATH
from src.models.build_star_cases import build_star_cases, OUTPUT_PATH as STAR_CASES_PATH
from src.models.train_anomaly import train_anomaly
from src.models.train_classifier import train_classifier
from src.scoring.final_score import run_scoring


def _run_scoring_window(max_rows: int) -> Path:
    if max_rows <= 0:
        return run_scoring()
    df = pd.read_csv(SINIESTROS_PATH, nrows=max_rows)
    temp_input = SINIESTROS_PATH.parent / "siniestros_scoring_window.csv"
    temp_input.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(temp_input, index=False)
    return run_scoring(input_path=temp_input)


def run_all(rows: int = 25000, seed: int = 42, scoring_rows: int = 3000) -> dict:
    df = generate_dataset(rows=rows, seed=seed)
    SINIESTROS_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(SINIESTROS_PATH, index=False)
    qa_dataset = validate_dataset(df)

    features_path = export_features()
    classifier_path = train_classifier()
    anomaly_path = train_anomaly()
    scored_path = _run_scoring_window(scoring_rows)

    star_cases = build_star_cases(scored_path)
    STAR_CASES_PATH.write_text(json.dumps(star_cases, ensure_ascii=False, indent=2), encoding="utf-8")

    return {
        "dataset": str(SINIESTROS_PATH),
        "features": str(features_path),
        "features_meta": str(FEATURES_PATH.parent / "features_meta.json"),
        "classifier": str(classifier_path),
        "anomaly": str(anomaly_path),
        "scored": str(scored_path),
        "star_cases": str(STAR_CASES_PATH),
        "dataset_qa": qa_dataset,
        "scoring_rows": scoring_rows,
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
