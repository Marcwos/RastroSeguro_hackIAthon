"""Simulation entrypoint for evaluating a new claim without persisting it.

This module runs the entire real-time pipeline (models, NLP, graph, and categorical)
on a simulated claim, dynamically comparing it against the historical database
of claims to detect recurrences or duplicates.
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


def simulate_new_claim(claim_data: dict[str, Any], data_path: Path = OUTPUT_PATH) -> dict[str, Any]:
    """Simulate a new claim by passing it through the complete RastroSeguro enrichment pipeline."""
    # Ensure ID is preserved if provided, or default to SIMULADO
    claim_id = claim_data.get("id_siniestro", "SIMULADO")
    claim = {**claim_data, "id_siniestro": claim_id}

    # Try to load existing database claims to perform Graph and NLP comparisons against history
    database_claims: list[dict[str, Any]] = []
    if data_path.exists():
        try:
            import pandas as pd
            df = pd.read_csv(data_path)
            # Remove pre-serialized columns to avoid schema conflicts
            for col in [
                "alertas_activadas", "siniestros_similares", "entidades_recurrentes",
                "conexiones_grafo", "senales_categoricas", "modelo_features", "anomalia_features"
            ]:
                if col in df.columns:
                    df = df.drop(columns=[col])
            database_claims = df.to_dict("records")
        except Exception:
            database_claims = []

    # Combine database claims with the new simulated claim for contextual scoring (nlp/graph)
    all_claims = database_claims + [claim]

    # Run the dynamic pipeline modules
    all_claims = enrich_claims_with_graph(all_claims)
    all_claims = enrich_claims_with_categorical(all_claims)
    all_claims = enrich_claims_with_model_scores(all_claims)

    if claim.get("descripcion"):
        all_claims = enrich_claims_with_nlp(all_claims)

    # Extract the enriched simulated claim (which is the last element in the combined list)
    simulated_enriched = all_claims[-1]

    return explain_unsaved_claim(simulated_enriched)
