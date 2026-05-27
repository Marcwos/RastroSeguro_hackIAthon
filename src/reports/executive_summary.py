"""Executive report generation for scored claims."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from src.reports.sections import aggregate_by_field, exposed_amount, risk_counts, top_claims


def build_executive_report(claims: list[dict[str, Any]], top_limit: int = 10) -> dict[str, Any]:
    total = len(claims)
    counts = risk_counts(claims)
    red = counts["Rojo"]
    total_amount = round(sum(float(claim.get("monto_reclamado", 0) or 0) for claim in claims), 2)

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "total_siniestros": total,
            "casos_verdes": counts["Verde"],
            "casos_amarillos": counts["Amarillo"],
            "casos_rojos": red,
            "porcentaje_rojo": round((red / total) * 100, 2) if total else 0,
            "monto_total_reclamado": total_amount,
            "monto_reclamado_casos_rojos": exposed_amount(claims, "Rojo"),
        },
        "top_casos": top_claims(claims, limit=top_limit),
        "riesgo_por_ramo": aggregate_by_field(claims, "ramo"),
        "top_proveedores": aggregate_by_field(claims, "id_proveedor"),
        "top_ciudades": aggregate_by_field(claims, "ciudad"),
        "ethics_note": (
            "RastroSeguro prioriza siniestros para revisión humana. "
            "No acusa fraude ni rechaza reclamos automáticamente."
        ),
    }
