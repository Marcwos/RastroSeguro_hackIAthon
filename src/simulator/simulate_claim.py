"""Simulation entrypoint for evaluating a new claim without persisting it."""

from __future__ import annotations

from typing import Any

from src.explainability.explain_claim import explain_unsaved_claim


def simulate_new_claim(claim_data: dict[str, Any]) -> dict[str, Any]:
    claim = {"id_siniestro": "SIMULADO", **claim_data}
    return explain_unsaved_claim(claim)
