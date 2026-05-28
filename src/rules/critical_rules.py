"""PDF critical business rules RF-01 to RF-07."""

from __future__ import annotations

from typing import Any

from src.rules.common.coercion import as_bool, as_number
from src.rules.models import RuleResult

Claim = dict[str, Any]

_IMPACT_KEYWORDS = {
    "frontal": ["frontal", "de frente", "encounter"],
    "posterior": ["posterior", "por detrás", "alcance"],
    "lateral": ["lateral", "costado", "interseccion"],
}


def evaluate_critical_rules(claim: Claim) -> list[RuleResult]:
    results: list[RuleResult] = []
    results.extend(_rf01_robo_pt(claim))
    results.extend(_rf03_lista_restrictiva(claim))
    results.extend(_rf04_dinamica_imposible(claim))
    results.extend(_rf05_borde_48h(claim))
    results.extend(_rf06_demora_robo(claim))
    results.extend(_rf07_narrativa_clonada(claim))
    return results


def _rf01_robo_pt(claim: Claim) -> list[RuleResult]:
    cobertura = str(claim.get("cobertura", claim.get("tipo_evento", ""))).lower()
    if "robo" not in cobertura:
        return []
    ratio = as_number(
        claim.get("ratio_monto_suma_asegurada"),
        as_number(claim.get("monto_reclamado")) / max(as_number(claim.get("suma_asegurada")), 1),
    )
    if ratio >= 0.85:
        return [RuleResult(
            code="RF-01",
            name="Cobertura pérdida total por robo",
            points=12,
            severity="critica",
            message="Robo con monto reclamado cercano a la suma asegurada (posible pérdida total).",
            evidence={"cobertura": cobertura, "ratio_monto_suma": round(ratio, 4)},
            category="critica_pdf",
            pdf_ref="RF-01",
        )]
    return []


def _rf03_lista_restrictiva(claim: Claim) -> list[RuleResult]:
    if as_bool(claim.get("lista_restrictiva_sercop")):
        return [RuleResult(
            code="RF-03",
            name="Coincidencia con lista restrictiva SERCOP",
            points=10,
            severity="critica",
            message="El proveedor o beneficiario coincide con la lista restrictiva SERCOP.",
            evidence={
                "supplier_ruc": claim.get("supplier_ruc"),
                "lista_restrictiva_sercop": True,
            },
            category="critica_pdf",
            pdf_ref="RF-03",
        )]
    return []


def _rf04_dinamica_imposible(claim: Claim) -> list[RuleResult]:
    impacto = str(claim.get("tipo_impacto", "")).lower()
    descripcion = str(claim.get("descripcion", "")).lower()
    if not impacto or impacto not in _IMPACT_KEYWORDS:
        return []
    keywords = _IMPACT_KEYWORDS[impacto]
    if any(kw in descripcion for kw in keywords):
        return []
    if len(descripcion.split()) < 6:
        return []
    return [RuleResult(
        code="RF-04",
        name="Dinámica del accidente físicamente improbable",
        points=10,
        severity="critica",
        message="El relato no es coherente con el tipo de impacto declarado.",
        evidence={"tipo_impacto": impacto, "descripcion": claim.get("descripcion", "")[:120]},
        category="critica_pdf",
        pdf_ref="RF-04",
    )]


def _rf05_borde_48h(claim: Claim) -> list[RuleResult]:
    days = claim.get("dias_desde_inicio_poliza")
    try:
        days_int = int(days) if days is not None else None
    except (TypeError, ValueError):
        days_int = None
    if days_int is None or days_int > 2:
        return []
    return [RuleResult(
        code="RF-05",
        name="Siniestro extremo al borde de vigencia (<48h)",
        points=8,
        severity="alta",
        message=f"El siniestro ocurrió {days_int} días después del inicio de póliza.",
        evidence={"dias_desde_inicio_poliza": days_int},
        category="critica_pdf",
        pdf_ref="RF-05",
    )]


def _rf06_demora_robo(claim: Claim) -> list[RuleResult]:
    cobertura = str(claim.get("cobertura", claim.get("tipo_evento", ""))).lower()
    if "robo" not in cobertura:
        return []
    days = claim.get("dias_entre_ocurrencia_reporte")
    try:
        days_int = int(days) if days is not None else 0
    except (TypeError, ValueError):
        days_int = 0
    if days_int <= 4:
        return []
    return [RuleResult(
        code="RF-06",
        name="Demora atípica en denuncia de robo (>4 días)",
        points=8,
        severity="alta",
        message=f"Denuncia de robo reportada {days_int} días después del evento.",
        evidence={"dias_entre_ocurrencia_reporte": days_int, "cobertura": cobertura},
        category="critica_pdf",
        pdf_ref="RF-06",
    )]


def _rf07_narrativa_clonada(claim: Claim) -> list[RuleResult]:
    if as_bool(claim.get("alerta_narrativa")):
        return [RuleResult(
            code="RF-07",
            name="Narrativa idéntica o clonada",
            points=8,
            severity="alta",
            message="Se detectó narrativa similar a otros reclamos del portafolio.",
            evidence={
                "alerta_narrativa": claim.get("alerta_narrativa"),
                "explicacion_nlp": claim.get("explicacion_nlp", ""),
            },
            category="critica_pdf",
            pdf_ref="RF-07",
        )]
    desc = str(claim.get("descripcion", "")).lower()
    clone_markers = ["narrativa similar", "patrón repetido", "clonada", "recurrente con narrativa"]
    if any(m in desc for m in clone_markers):
        return [RuleResult(
            code="RF-07",
            name="Narrativa idéntica o clonada",
            points=8,
            severity="alta",
            message="La descripción sugiere un patrón narrativo repetido.",
            evidence={"descripcion": claim.get("descripcion", "")[:120]},
            category="critica_pdf",
            pdf_ref="RF-07",
        )]
    return []
