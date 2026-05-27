"""Rule registry for branch-aware fraud rule execution."""

from __future__ import annotations

from typing import Any, Callable

from src.rules.base_rules import evaluate_base_rules
from src.rules.general_rules import evaluate_general_rules
from src.rules.health_rules import evaluate_health_rules
from src.rules.home_rules import evaluate_home_rules
from src.rules.life_rules import evaluate_life_rules
from src.rules.models import RuleResult
from src.rules.vehicle_rules import evaluate_vehicle_rules

Claim = dict[str, Any]
RuleEvaluator = Callable[[Claim], list[RuleResult]]

BRANCH_RULES: dict[str, list[RuleEvaluator]] = {
    "vehiculos": [evaluate_vehicle_rules],
    "vehículos": [evaluate_vehicle_rules],
    "vehicle": [evaluate_vehicle_rules],
    "auto": [evaluate_vehicle_rules],
    "autos": [evaluate_vehicle_rules],
    "salud": [evaluate_health_rules],
    "health": [evaluate_health_rules],
    "medico": [evaluate_health_rules],
    "médico": [evaluate_health_rules],
    "hogar": [evaluate_home_rules],
    "home": [evaluate_home_rules],
    "vivienda": [evaluate_home_rules],
    "vida": [evaluate_life_rules],
    "life": [evaluate_life_rules],
    "generales": [evaluate_general_rules],
    "general": [evaluate_general_rules],
    "otros": [evaluate_general_rules],
}


def evaluate_rules(claim: Claim) -> list[RuleResult]:
    """Evaluate base and branch-specific rules for a claim."""
    results = evaluate_base_rules(claim)
    branch = str(claim.get("ramo", "")).strip().lower()
    for evaluator in BRANCH_RULES.get(branch, []):
        results.extend(evaluator(claim))
    return results


def rules_score(results: list[RuleResult]) -> float:
    """Convert accumulated rule points into a 0-100 score.

    The cap keeps the scoring interpretable: 50 raw points means the rules alone
    represent critical accumulated risk.
    """
    total_points = sum(result.points for result in results)
    return round(min(100.0, (total_points / 50.0) * 100.0), 2)
