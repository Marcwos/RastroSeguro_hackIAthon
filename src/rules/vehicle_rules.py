"""Vehicle-specific fraud signal rules."""

from __future__ import annotations

from typing import Any

from src.rules.base_rules import _bool, _num
from src.utils.dates import days_between
from src.rules.models import RuleResult

Claim = dict[str, Any]


def evaluate_vehicle_rules(claim: Claim) -> list[RuleResult]:
    results: list[RuleResult] = []
    ramo = str(claim.get("ramo", "")).strip().lower()
    if ramo not in {"vehiculos", "vehículos", "vehicle", "auto", "autos"}:
        return results

    tipo_evento = str(claim.get("tipo_evento", claim.get("cobertura", ""))).lower()
    days_from_start = claim.get("dias_desde_inicio_poliza")
    try:
        days_from_start = int(days_from_start) if days_from_start is not None else None
    except (TypeError, ValueError):
        days_from_start = None

    if days_from_start is None:
        days_from_start = days_between(claim.get("fecha_inicio_poliza"), claim.get("fecha_ocurrencia"))

    if "robo" in tipo_evento and days_from_start is not None and days_from_start <= 10:
        results.append(RuleResult(
            code="RV-001",
            name="Robo cercano al inicio de póliza",
            points=10,
            severity="critica",
            message=f"El evento de robo ocurrió {days_from_start} días después del inicio de la póliza.",
            evidence={"tipo_evento": tipo_evento, "dias_desde_inicio_poliza": days_from_start},
            category="vehiculos",
        ))

    vehicle_history = int(_num(claim.get("historial_siniestros_vehiculo")))
    if vehicle_history >= 3:
        results.append(RuleResult(
            code="RV-002",
            name="Vehículo con múltiples siniestros",
            points=6,
            severity="alta",
            message=f"El vehículo registra {vehicle_history} siniestros previos.",
            evidence={"historial_siniestros_vehiculo": vehicle_history},
            category="vehiculos",
        ))

    if _bool(claim.get("ocurrio_noche")) and not _bool(claim.get("hay_testigos")):
        results.append(RuleResult(
            code="RV-003",
            name="Accidente nocturno sin testigos",
            points=6,
            severity="alta",
            message="El evento ocurrió de noche y no registra testigos.",
            evidence={"ocurrio_noche": claim.get("ocurrio_noche"), "hay_testigos": claim.get("hay_testigos")},
            category="vehiculos",
        ))

    if not _bool(claim.get("reporte_policial")) and ("robo" in tipo_evento or "choque" in tipo_evento or "accidente" in tipo_evento):
        results.append(RuleResult(
            code="RV-004",
            name="Ausencia de reporte policial",
            points=5,
            severity="media",
            message="El caso no registra reporte policial para un evento que normalmente lo requiere.",
            evidence={"tipo_evento": tipo_evento, "reporte_policial": claim.get("reporte_policial")},
            category="vehiculos",
        ))

    if not _bool(claim.get("tercero_identificado")) and ("choque" in tipo_evento or "accidente" in tipo_evento):
        results.append(RuleResult(
            code="RV-005",
            name="Tercero no identificado",
            points=5,
            severity="media",
            message="El siniestro reporta tercero no identificado.",
            evidence={"tercero_identificado": claim.get("tercero_identificado")},
            category="vehiculos",
        ))

    if _bool(claim.get("conductor_recurrente")):
        results.append(RuleResult(
            code="RV-006",
            name="Conductor recurrente",
            points=8,
            severity="alta",
            message="El conductor aparece asociado a múltiples siniestros.",
            evidence={"conductor_recurrente": claim.get("conductor_recurrente")},
            category="vehiculos",
        ))

    if _bool(claim.get("zona_alta_siniestralidad")):
        results.append(RuleResult(
            code="RV-007",
            name="Zona de alta siniestralidad",
            points=3,
            severity="baja",
            message="El evento ocurrió en una zona con alta concentración de siniestros.",
            evidence={"zona_alta_siniestralidad": claim.get("zona_alta_siniestralidad")},
            category="vehiculos",
        ))

    return results
