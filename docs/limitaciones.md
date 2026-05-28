# Limitaciones del prototipo

## Datos

- Los siniestros son **100% sintéticos**; no representan casos reales de asegurados.
- Ecuador aporta contexto público (SERCOP, OCDS, ECU911, INEC), no microdatos de siniestros asegurados.
- No hay PII real; identificadores de vehículo usan hashes (`placa_hash`, `chasis_hash`, `motor_hash`).

## Modelo

- Métricas altas reflejan datos sintéticos con señales inyectadas; no garantizan performance en producción.
- El detector de anomalías puede marcar casos normales en portafolios reales (falsos positivos).
- NLP de similitud depende de `descripcion`; reclamos muy cortos reducen precisión.

## Decisiones

- El sistema **no acusa fraude** ni rechaza pagos automáticamente.
- Toda escalación requiere **revisión humana**.
- El score es una priorización explicable, no una conclusión legal.

## Alcance técnico

- Prototipo en Python con CSV; no incluye integración runtime con R u Oracle.
- API REST no expuesta; demo vía Streamlit y agente local.
- LLM opcional desactivado por defecto (`RASTRO_LLM_ENABLED=false`).
