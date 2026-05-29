"""Use case: re-score a new claim (or batch) against the existing portfolio.

Scoring signals (graph, recurrence, categorical baselines, portfolio
calibration) are population-relative: a claim scored in isolation gets
meaningless graph/recurrence values. Re-scoring the combined portfolio gives
each new claim real context and keeps the existing dataset intact instead of
overwriting it with a single row.

This lives in the application layer so it can be exercised without an HTTP
request: the FastAPI handler is just a thin adapter over ``rescore_with_population``.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from src.documents.claim_extraction import CANONICAL_FIELDS
from src.infrastructure.repositories.scored_claims_repository import ScoredClaimsRepository
from src.scoring.final_score import score_dataframe


def rescore_with_population(
    new_claims: list[dict],
    repository: ScoredClaimsRepository | None = None,
) -> tuple[Path, int, int]:
    """Append new claims to the scored portfolio and re-score the whole set.

    Returns ``(output_path, total_rows, rows_added)``. Raises ``ValueError`` if
    no claims are provided.
    """
    if not new_claims:
        raise ValueError("No hay siniestros para procesar.")

    repo = repository or ScoredClaimsRepository()
    base = repo.read_or_empty()
    # Reconstruct the raw portfolio by keeping only canonical input fields.
    raw_cols = [column for column in base.columns if column in CANONICAL_FIELDS]
    population = base[raw_cols].copy() if not base.empty and raw_cols else pd.DataFrame()

    new_df = pd.DataFrame(new_claims)
    combined = pd.concat([population, new_df], ignore_index=True, sort=False)
    # A re-confirmed/re-uploaded claim updates its row instead of duplicating.
    if "id_siniestro" in combined.columns:
        combined = combined.drop_duplicates(subset="id_siniestro", keep="last").reset_index(drop=True)

    scored = score_dataframe(combined)
    output_path = repo.save(scored)
    return output_path, len(scored), len(new_df)
