"""Claim and risk exploration routes for the Next.js frontend."""

from __future__ import annotations

from fastapi import APIRouter, Query

from api.routes._errors import run_endpoint
from src.agent import tools
from src.explainability.explain_claim import explain_claim

router = APIRouter(prefix="/api", tags=["claims"])


@router.get("/claims")
def list_claims(limit: int = Query(default=50, ge=1, le=200)):
    return run_endpoint(lambda: tools.get_top_risky_claims(limit=limit))


@router.get("/claims/{id_siniestro}/explanation")
def claim_explanation(id_siniestro: str):
    return run_endpoint(lambda: explain_claim(id_siniestro))


@router.get("/rankings/providers")
def provider_ranking(limit: int = Query(default=10, ge=1, le=100)):
    return run_endpoint(lambda: tools.get_provider_risk_ranking(limit=limit))


@router.get("/risk/cities")
def city_risk_distribution():
    return run_endpoint(tools.get_city_risk_distribution)


@router.get("/risk/branches")
def branch_risk_distribution():
    return run_endpoint(tools.get_risk_by_branch)
