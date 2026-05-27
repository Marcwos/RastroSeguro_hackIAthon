"""Configurable categorical risk profiles."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from src.categorical.normalization import normalize_category, truthy_category


@dataclass(frozen=True)
class CategorySignal:
    field: str
    value: Any
    points: int
    severity: str
    message: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "field": self.field,
            "value": self.value,
            "points": self.points,
            "severity": self.severity,
            "message": self.message,
        }


VALUE_PROFILES = {
    "canal_venta": {
        "referido externo": (5, "media", "Canal de venta con mayor necesidad de verificación."),
        "intermediario": (4, "media", "Canal intermediario requiere revisión de trazabilidad."),
    },
    "estado_poliza": {
        "mora": (6, "media", "La póliza presenta estado de mora."),
        "suspendida": (8, "alta", "La póliza figura suspendida o con estado sensible."),
    },
    "tipo_impacto": {
        "frontal": (3, "baja", "Tipo de impacto con necesidad de validación técnica."),
        "multiple": (4, "media", "Accidente múltiple requiere validación adicional."),
        "volcadura": (4, "media", "Volcadura requiere revisión técnica del relato."),
    },
    "zona_inmueble": {
        "alta siniestralidad": (5, "media", "Zona de inmueble con alta siniestralidad."),
    },
    "relacion_beneficiario": {
        "sin relacion clara": (7, "alta", "Relación del beneficiario no es clara."),
        "tercero": (4, "media", "Beneficiario tercero requiere validación documental."),
    },
}

BOOLEAN_PROFILES = {
    "documentos_inconsistentes": (10, "critica", "Categoría crítica: documentos inconsistentes."),
    "zona_alta_siniestralidad": (5, "media", "Categoría de zona con alta siniestralidad."),
    "tercero_identificado": (4, "media", "Tercero no identificado o no validado."),
    "hay_testigos": (3, "baja", "Ausencia de testigos en el evento."),
    "reporte_policial": (4, "media", "Ausencia de reporte policial."),
}

NEGATIVE_BOOLEAN_FIELDS = {"tercero_identificado", "hay_testigos", "reporte_policial"}


def evaluate_configured_categories(claim: dict[str, Any]) -> list[CategorySignal]:
    signals: list[CategorySignal] = []

    for field, profile in VALUE_PROFILES.items():
        normalized = normalize_category(claim.get(field))
        if normalized in profile:
            points, severity, message = profile[normalized]
            signals.append(CategorySignal(field, claim.get(field), points, severity, message))

    for field, (points, severity, message) in BOOLEAN_PROFILES.items():
        if field not in claim:
            continue
        is_risky = not truthy_category(claim.get(field)) if field in NEGATIVE_BOOLEAN_FIELDS else truthy_category(claim.get(field))
        if is_risky:
            signals.append(CategorySignal(field, claim.get(field), points, severity, message))

    return signals
