"""Base auditable rules that apply to all insurance branches."""

from __future__ import annotations

from typing import Any

from src.rules.models import RuleResult
from src.utils.dates import days_between

Claim = dict[str, Any]


def _bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    return str(value).strip().lower() in {"1", "true", "si", "sí", "yes", "y"}


def _num(value: Any, default: float = 0.0) -> float:
    try:
        if value is None or value == "":
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def evaluate_base_rules(claim: Claim) -> list[RuleResult]:
    """Evaluate common risk signals for any branch."""
    results: list[RuleResult] = []

    days_from_start = claim.get("dias_desde_inicio_poliza")
    if days_from_start is None:
        days_from_start = days_between(claim.get("fecha_inicio_poliza"), claim.get("fecha_ocurrencia"))
    if days_from_start is not None and days_from_start >= 0:
        if days_from_start <= 2:
            points, severity = 12, "critica"
        elif days_from_start <= 10:
            points, severity = 8, "alta"
        elif days_from_start <= 30:
            points, severity = 4, "media"
        else:
            points = 0
        if points:
            results.append(RuleResult(
                code="RB-001",
                name="Siniestro cerca del inicio de póliza",
                points=points,
                severity=severity,  # type: ignore[arg-type]
                message=f"El siniestro ocurrió {days_from_start} días después del inicio de la póliza.",
                evidence={"dias_desde_inicio_poliza": days_from_start},
                category="vigencia",
            ))

    days_to_end = claim.get("dias_desde_fin_poliza")
    if days_to_end is None:
        days_to_end = days_between(claim.get("fecha_ocurrencia"), claim.get("fecha_fin_poliza"))
    if days_to_end is not None and days_to_end >= 0:
        if days_to_end <= 2:
            points, severity = 10, "alta"
        elif days_to_end <= 10:
            points, severity = 7, "alta"
        elif days_to_end <= 30:
            points, severity = 4, "media"
        else:
            points = 0
        if points:
            results.append(RuleResult(
                code="RB-002",
                name="Siniestro cerca del fin de póliza",
                points=points,
                severity=severity,  # type: ignore[arg-type]
                message=f"El siniestro ocurrió a {days_to_end} días del fin de vigencia.",
                evidence={"dias_desde_fin_poliza": days_to_end},
                category="vigencia",
            ))

    report_delay = claim.get("dias_entre_ocurrencia_reporte")
    if report_delay is None:
        report_delay = days_between(claim.get("fecha_ocurrencia"), claim.get("fecha_reporte"))
    if report_delay is not None:
        if report_delay > 7:
            points, severity = 5, "media"
        elif report_delay >= 4:
            points, severity = 3, "baja"
        else:
            points = 0
        if points:
            results.append(RuleResult(
                code="RB-003",
                name="Reporte tardío",
                points=points,
                severity=severity,  # type: ignore[arg-type]
                message=f"El siniestro fue reportado {report_delay} días después de la ocurrencia.",
                evidence={"dias_entre_ocurrencia_reporte": report_delay},
                category="tiempo_reporte",
            ))

    amount = _num(claim.get("monto_reclamado"))
    insured_sum = _num(claim.get("suma_asegurada"))
    ratio = claim.get("ratio_monto_suma_asegurada")
    ratio = _num(ratio, amount / insured_sum if insured_sum else 0)
    if ratio >= 0.95:
        results.append(RuleResult(
            code="RB-004",
            name="Monto cercano a suma asegurada",
            points=7,
            severity="alta",
            message=f"El monto reclamado representa el {ratio:.0%} de la suma asegurada.",
            evidence={"monto_reclamado": amount, "suma_asegurada": insured_sum, "ratio": round(ratio, 4)},
            category="monto",
        ))
    elif ratio >= 0.80:
        results.append(RuleResult(
            code="RB-005",
            name="Monto elevado frente a suma asegurada",
            points=4,
            severity="media",
            message=f"El monto reclamado representa el {ratio:.0%} de la suma asegurada.",
            evidence={"monto_reclamado": amount, "suma_asegurada": insured_sum, "ratio": round(ratio, 4)},
            category="monto",
        ))

    if not _bool(claim.get("documentos_completos")):
        results.append(RuleResult(
            code="RB-006",
            name="Documentos incompletos",
            points=4,
            severity="media",
            message="El expediente documental está incompleto.",
            evidence={"documentos_completos": claim.get("documentos_completos")},
            category="documentos",
        ))

    if _bool(claim.get("documentos_inconsistentes")):
        results.append(RuleResult(
            code="RB-007",
            name="Documentos inconsistentes",
            points=10,
            severity="critica",
            message="Se registran inconsistencias documentales que requieren revisión.",
            evidence={"documentos_inconsistentes": claim.get("documentos_inconsistentes")},
            category="documentos",
        ))

    history = int(_num(claim.get("historial_siniestros_asegurado")))
    if history >= 3:
        results.append(RuleResult(
            code="RB-008",
            name="Alta frecuencia de reclamos del asegurado",
            points=8,
            severity="alta",
            message=f"El asegurado registra {history} siniestros previos.",
            evidence={"historial_siniestros_asegurado": history},
            category="frecuencia",
        ))
    elif history == 2:
        results.append(RuleResult(
            code="RB-009",
            name="Frecuencia moderada de reclamos del asegurado",
            points=4,
            severity="media",
            message="El asegurado registra 2 siniestros previos.",
            evidence={"historial_siniestros_asegurado": history},
            category="frecuencia",
        ))

    for field, code, name in (
        ("proveedor_recurrente", "RB-010", "Proveedor recurrente"),
        ("beneficiario_recurrente", "RB-011", "Beneficiario recurrente"),
    ):
        if _bool(claim.get(field)):
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
