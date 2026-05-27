"""Input normalization for simulated claims."""

from __future__ import annotations

from typing import Any

RAMO_ALIASES = {
    "vehiculo": "vehiculos",
    "vehículo": "vehiculos",
    "vehicle": "vehiculos",
    "auto": "vehiculos",
    "autos": "vehiculos",
    "salud": "salud",
    "hogar": "hogar",
    "vida": "vida",
}

FIELD_ALIASES = {
    "documentos_presentes": "documentos_completos",
    "documentacion_completa": "documentos_completos",
    "proveedor": "id_proveedor",
    "taller": "id_taller",
    "ciudad_evento": "ciudad",
    "relato": "descripcion",
    "narrativa": "descripcion",
}

BOOL_FIELDS = {
    "documentos_completos",
    "documentos_inconsistentes",
    "ocurrio_noche",
    "hay_testigos",
    "reporte_policial",
    "tercero_identificado",
    "conductor_recurrente",
    "zona_alta_siniestralidad",
}

NUMERIC_FIELDS = {
    "monto_reclamado",
    "suma_asegurada",
    "historial_siniestros_asegurado",
    "historial_siniestros_vehiculo",
    "dias_desde_inicio_poliza",
}


def normalize_simulated_claim(claim_data: dict[str, Any]) -> dict[str, Any]:
    """Normalize UI-friendly aliases into the internal scoring contract."""
    normalized: dict[str, Any] = {}
    for key, value in claim_data.items():
        target = FIELD_ALIASES.get(key, key)
        normalized[target] = value

    claim_id = normalized.get("id_siniestro") or normalized.get("id") or "SIMULADO"
    normalized["id_siniestro"] = str(claim_id)

    ramo = str(normalized.get("ramo", "vehiculos")).strip().lower()
    normalized["ramo"] = RAMO_ALIASES.get(ramo, ramo or "vehiculos")

    for field in BOOL_FIELDS:
        if field in normalized:
            normalized[field] = _as_bool(normalized[field])

    for field in NUMERIC_FIELDS:
        if field in normalized:
            normalized[field] = _as_number(normalized[field])

    return normalized


def _as_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, (int, float)):
        return bool(value)
    return str(value).strip().lower() in {"1", "true", "yes", "si", "sí", "y", "on", "completo"}


def _as_number(value: Any) -> Any:
    if value is None or isinstance(value, (int, float)):
        return value
    text = str(value).strip().replace("$", "").replace(",", "")
    try:
        number = float(text)
    except ValueError:
        return value
    return int(number) if number.is_integer() else number
