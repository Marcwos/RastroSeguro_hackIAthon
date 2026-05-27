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
    from pathlib import Path
    import csv

    # Path to Carlos' newly extracted SERCOP CSV
    sercop_path = Path("data/raw/ecuador/sercop_sanciones_2021_2026.csv")
    if not sercop_path.exists():
        return []

    provider_id = str(claim.get("id_proveedor", "")).strip()
    if not provider_id:
        return []

    try:
        # Load sanctioned RUCs from the CSV
        sanctioned_rucs: dict[str, dict[str, str]] = {}
        with sercop_path.open(encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                ruc = str(row.get("ruc", "")).strip()
                if ruc:
                    sanctioned_rucs[ruc] = row

        # Check if claimant's provider matches any RUC in the SERCOP database
        if provider_id in sanctioned_rucs:
            record = sanctioned_rucs[provider_id]
            reason = record.get("motivo_corto", "Sancionado por SERCOP")
            tipo = record.get("tipo_sancion", "Sanción")
            plazo = record.get("plazo_dias", "")
            msg = f"El proveedor {provider_id} está oficialmente sancionado por SERCOP. Motivo: {reason}."
            if plazo:
                msg += f" Plazo de inhabilitación: {plazo} días."

            return [RuleResult(
                code="RB-012",
                name="Proveedor sancionado por SERCOP",
                points=10,  # Critical point weight since it is a real-world legal sanction!
                severity="critica",
                message=msg,
                evidence={
                    "id_proveedor": provider_id,
                    "sercop_motivo": reason,
                    "sercop_tipo": tipo,
                    "sercop_plazo_dias": plazo,
                    "sercop_fecha_emision": record.get("fecha_emision", ""),
                },
                category="legal",
            )]
    except Exception:
        return []

    return []
