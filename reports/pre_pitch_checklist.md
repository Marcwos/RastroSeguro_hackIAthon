# Checklist pre-pitch (PDF completo)

## Dataset PDF §6.1
- [x] `data/synthetic/siniestros.csv` con `monto_pagado`, `estado`, `sucursal`
- [x] Vehículo: `placa_hash`, `chasis_hash`, `motor_hash`, marca, modelo, año
- [x] QA: `data/synthetic/siniestros_qa.json` con `ok=true`

## Tablas complementarias §6.2
- [x] `data/synthetic/polizas.csv`
- [x] `data/synthetic/asegurados.csv`
- [x] `data/synthetic/proveedores.csv`
- [x] `data/synthetic/documentos.csv`
- [x] `data/synthetic/dataset_manifest.json`

## Motor antifraude
- [x] Reglas RF-01…RF-07 documentadas en `docs/reglas_negocio.md`
- [x] Score híbrido + semáforo Verde/Amarillo/Rojo
- [x] Agente responde 12 preguntas del PDF

## Artefactos
- [x] Features, modelos `.joblib`, métricas, casos estrella
- [x] Benchmark 12 preguntas: `reports/benchmark_preguntas_pdf.json`
- [x] Scoring: `data/processed/siniestros_scored.csv`

## Documentación PDF §14–§15
- [x] README actualizado
- [x] `docs/reglas_negocio.md`, `docs/modelo_datos.md`, `docs/limitaciones.md`
- [x] Notebooks `01`, `02`, `03`

## Guardrails éticos
- Alertas de revisión, no acusaciones automáticas
- Datos sintéticos sin PII real
- Revisión humana obligatoria antes de decisiones
