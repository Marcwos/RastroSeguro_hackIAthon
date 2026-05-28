"""Claim and risk exploration routes for the Next.js frontend."""

from __future__ import annotations

from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, Query
from fastapi import File, UploadFile

from api.routes._errors import run_endpoint
from src.agent import tools
from src.explainability.explain_claim import explain_claim
from src.scoring.final_score import OUTPUT_PATH, run_scoring

router = APIRouter(prefix="/api", tags=["claims"])


@router.get("/claims")
def list_claims(limit: int = Query(default=50, ge=1, le=200)):
    return run_endpoint(lambda: tools.get_top_risky_claims(limit=limit))


@router.get("/claims/{id_siniestro}/explanation")
def claim_explanation(id_siniestro: str):
    return run_endpoint(lambda: explain_claim(id_siniestro))


@router.get("/claims/{id_siniestro}/dossier")
def claim_dossier(id_siniestro: str):
    return run_endpoint(lambda: tools.get_claim_dossier(id_siniestro))


@router.get("/rankings/providers")
def provider_ranking(limit: int = Query(default=10, ge=1, le=100)):
    return run_endpoint(lambda: tools.get_provider_risk_ranking(limit=limit))


@router.get("/risk/cities")
def city_risk_distribution():
    return run_endpoint(tools.get_city_risk_distribution)


@router.get("/risk/branches")
def branch_risk_distribution():
    return run_endpoint(tools.get_risk_by_branch)


@router.post("/claims/upload-csv")
async def upload_claims_csv(file: UploadFile = File(...)):
    def _process() -> dict:
        filename = (file.filename or "").lower()
        if not filename.endswith(".csv"):
            raise ValueError("El archivo debe ser CSV.")

        payload = file.file.read()
        if not payload:
            raise ValueError("El CSV está vacío.")

        with NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
            tmp.write(payload)
            temp_path = Path(tmp.name)

        try:
            output_path = run_scoring(input_path=temp_path, output_path=OUTPUT_PATH)
            import pandas as pd
            rows = len(pd.read_csv(output_path))
        finally:
            temp_path.unlink(missing_ok=True)

        return {
            "uploaded": True,
            "filename": file.filename,
            "rows_processed": rows,
            "scored_output_path": str(output_path),
        }

    return run_endpoint(_process)
