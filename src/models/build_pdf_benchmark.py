"""Build benchmark Q&A set aligned to reto PDF questions."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
INPUT_PATH = ROOT / "data" / "processed" / "siniestros_scored.csv"
OUTPUT_PATH = ROOT / "reports" / "benchmark_preguntas_pdf.json"


def build_benchmark(input_path: Path = INPUT_PATH) -> dict:
    df = pd.read_csv(input_path)
    df = df.sort_values("score_final", ascending=False)

    top10 = df[["id_siniestro", "score_final", "nivel_riesgo"]].head(10).to_dict(orient="records")
    providers = (
        df.groupby("id_proveedor", dropna=False)
        .agg(alertas_rojas=("nivel_riesgo", lambda s: int((s.astype(str).str.lower() == "rojo").sum())))
        .sort_values("alertas_rojas", ascending=False)
        .head(10)
        .reset_index()
        .to_dict(orient="records")
    )
    cities = (
        df.groupby("ciudad", dropna=False)
        .agg(casos=("id_siniestro", "count"), score_promedio=("score_final", "mean"))
        .sort_values("casos", ascending=False)
        .head(10)
        .reset_index()
        .to_dict(orient="records")
    )
    branches = (
        df.groupby("ramo", dropna=False)
        .agg(casos=("id_siniestro", "count"), sospechosos=("nivel_riesgo", lambda s: int((s != "Verde").sum())))
        .reset_index()
    )
    branches["pct_sospechosos"] = (branches["sospechosos"] / branches["casos"] * 100).round(2)

    docs_missing = df[df["documentos_completos"].astype(str).str.lower().isin({"no", "false", "0"})][
        ["id_siniestro", "nivel_riesgo", "descripcion"]
    ].head(10)

    return {
        "questions": [
            {
                "question": "¿Cuáles son los 10 siniestros con mayor riesgo de posible fraude?",
                "expected_output": top10,
            },
            {
                "question": "¿Qué proveedores concentran más alertas?",
                "expected_output": providers,
            },
            {
                "question": "¿Qué ciudades presentan mayor concentración de alertas?",
                "expected_output": cities,
            },
            {
                "question": "¿Qué ramos tienen mayor porcentaje de casos sospechosos?",
                "expected_output": branches.to_dict(orient="records"),
            },
            {
                "question": "¿Qué documentos faltan en los casos críticos?",
                "expected_output": docs_missing.to_dict(orient="records"),
            },
        ],
        "rows_scored": int(len(df)),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera benchmark de preguntas del PDF en JSON")
    parser.add_argument("--input", type=Path, default=INPUT_PATH)
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    args = parser.parse_args()
    payload = build_benchmark(args.input)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(args.output), "rows_scored": payload["rows_scored"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()

