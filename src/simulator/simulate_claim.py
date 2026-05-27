"""Simulation entrypoint for evaluating a new claim without persisting it.

The simulator runs the real-time RastroSeguro pipeline against an unsaved claim
and returns both the legacy explanation fields and UI-ready sections for Justin.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any

from src.categorical.scoring import enrich_claims_with_categorical
from src.explainability.explain_claim import explain_unsaved_claim
from src.graph.scoring import enrich_claims_with_graph
from src.model_integration.scoring import enrich_claims_with_model_scores
from src.nlp.scoring import enrich_claims_with_nlp
from src.scoring.final_score import OUTPUT_PATH
from src.simulator.context import load_historical_claims
from src.simulator.normalization import normalize_simulated_claim
from src.simulator.response import build_simulation_response


def simulate_new_claim(claim_data: dict[str, Any], data_path: Path = OUTPUT_PATH) -> dict[str, Any]:
    """Evaluate a new claim through rules, model scores, NLP, graph and categories."""
    claim = normalize_simulated_claim(claim_data)
    database_claims, context = load_historical_claims(data_path)

    all_claims = database_claims + [claim]
    all_claims = enrich_claims_with_graph(all_claims)
    all_claims = enrich_claims_with_categorical(all_claims)
    all_claims = enrich_claims_with_model_scores(all_claims)

    if any(item.get("descripcion") for item in all_claims):
        all_claims = enrich_claims_with_nlp(all_claims)

    simulated_enriched = all_claims[-1]
    explanation = explain_unsaved_claim(simulated_enriched)
    return build_simulation_response(explanation, simulated_enriched, claim, context)
