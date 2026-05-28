"""Common recurrence and frequency risk rules."""

from __future__ import annotations

from typing import Any

from src.rules.common.coercion import as_bool, as_number
from src.rules.models import RuleResult

Claim = dict[str, Any]


def evaluate_recurrence_rules(claim: Claim) -> list[RuleResult]:
    results: list[RuleResult] = []
    results.extend(_insured_history_rule(claim))
    results.extend(_recurrent_party_rules(claim))
    results.extend(_sercop_sanctions_rule(claim))
    return results


def _insured_history_rule(claim: Claim) -> list[RuleResult]:
    history = int(as_number(claim.get("historial_siniestros_asegurado")))
    if history >= 3:
        return [RuleResult(
            code="RB-008",
            name="Alta frecuencia de reclamos del asegurado",
            points=8,
            severity="alta",
            message=f"El asegurado registra {history} siniestros previos.",
            evidence={"historial_siniestros_asegurado": history},
            category="frecuencia",
        )]
    if history == 2:
        return [RuleResult(
            code="RB-009",
            name="Frecuencia moderada de reclamos del asegurado",
            points=4,
            severity="media",
            message="El asegurado registra 2 siniestros previos.",
            evidence={"historial_siniestros_asegurado": history},
            category="frecuencia",
        )]
    return []


def _recurrent_party_rules(claim: Claim) -> list[RuleResult]:
    results: list[RuleResult] = []
    for field, code, name in (
        ("proveedor_recurrente", "RB-010", "Proveedor recurrente"),
        ("beneficiario_recurrente", "RB-011", "Beneficiario recurrente"),
    ):
        if as_bool(claim.get(field)):
            results.append(RuleResult(
                code=code,
                name=name,
                points=6,
                severity="alta",
                message=f"El caso está asociado a un {name.lower()} en casos observados.",
                evidence={field: claim.get(field)},
                category="recurrencia",
            ))
    return results


def _sercop_sanctions_rule(claim: Claim) -> list[RuleResult]:
    if as_bool(claim.get("lista_restrictiva_sercop")):
        return [RuleResult(
            code="RB-012",
            name="Proveedor en lista restrictiva SERCOP",
            points=10,
            severity="critica",
            message="El proveedor coincide con la lista restrictiva SERCOP.",
            evidence={
                "supplier_ruc": claim.get("supplier_ruc"),
                "lista_restrictiva_sercop": True,
            },
            category="legal",
            pdf_ref="RF-03",
        )]
    return []
