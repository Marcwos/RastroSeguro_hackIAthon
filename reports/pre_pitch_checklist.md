# Checklist pre-pitch (Carlos)

- Dataset generado: `data/synthetic/siniestros.csv`
- QA de datos aprobado: `data/synthetic/siniestros_qa.json` con `ok=true`
- Features exportadas: `data/processed/features.csv`
- Metadata de features: `data/processed/features_meta.json`
- Modelo supervisado exportado: `models/fraud_classifier.joblib`
- Modelo de anomalías exportado: `models/anomaly_detector.joblib`
- Métricas consolidadas: `reports/model_metrics.json`
- Casos estrella (8-12): `reports/casos_estrella.json`
- Benchmark de preguntas PDF: `reports/benchmark_preguntas_pdf.json`
- Scoring generado: `data/processed/siniestros_scored.csv`
- Contexto Ecuador en dataset: columnas `supplier_ruc`, `lista_restrictiva_sercop`, `provincia`, `data_source_lineage`
- QA Ecuador: `siniestros_qa.json` con `ecuador_coverage` (SERCOP/OCDS/ECU911/INEC)
- Fuentes curadas: `data/curated/ecuador/` + base `data/processed/agent_ready/`

## Guardrails éticos (reto)

- El sistema genera alertas de posible fraude, no acusaciones.
- Toda decisión final requiere revisión humana.
- Los datos son sintéticos y no contienen PII real.
- La explicación del score es trazable a señales y componentes.

