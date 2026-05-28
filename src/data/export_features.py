"""Export model-ready feature table from synthetic claims."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

from src.data.feature_engineering import MODEL_FEATURE_COLUMNS, build_feature_frame

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_INPUT = ROOT / "data" / "synthetic" / "siniestros.csv"
DEFAULT_OUTPUT = ROOT / "data" / "processed" / "features.csv"


def export_features(input_path: Path = DEFAULT_INPUT, output_path: Path = DEFAULT_OUTPUT) -> Path:
    df = pd.read_csv(input_path)
    features = build_feature_frame(df)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    features.to_csv(output_path, index=False)
    meta = {
        "rows": len(features),
        "feature_columns": MODEL_FEATURE_COLUMNS,
        "output": str(output_path),
    }
    meta_path = output_path.parent / "features_meta.json"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    return output_path


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Exporta data/processed/features.csv")
    p.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    p.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    return p.parse_args()


def main() -> None:
    args = parse_args()
    path = export_features(args.input, args.output)
    print(f"Features exportadas en {path}")


if __name__ == "__main__":
    main()
