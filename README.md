# RastroSeguro

Plataforma de inteligencia artificial explicable para **priorizar siniestros con señales de posible fraude** en seguros multi-ramo.

Proyecto del equipo para el **hackIAthon 2026 — Reto Aseguradora del Sur**.

> RastroSeguro no acusa fraude ni rechaza reclamos. Genera alertas explicables para que un analista humano revise primero los casos de mayor riesgo.

---

## Estado del proyecto

Implementación funcional con cumplimiento del PDF del reto:

- Dataset sintético + tablas complementarias (pólizas, asegurados, proveedores, documentos)
- Contexto Ecuador (SERCOP/OCDS/ECU911/INEC)
- Score híbrido: reglas + ML + anomalías + NLP + grafo
- Agente con 12 preguntas del PDF
- Dashboard Streamlit + validación reproducible

---

## Corrida limpia (entregables Carlos)

```bash
py -3 -m src.models.run_carlos_pipeline --rows 25000 --seed 42 --scoring-rows 2000
py -3 -m src.models.validate_deliverables
py -3 -m unittest tests.test_model_integration tests.test_jeremy_core tests.test_agent tests.test_branch_rules
```

Demo UI:

```bash
streamlit run app/main.py
```

---

## Documentación

| Documento | Contenido |
|---|---|
| [Contratos de integración](docs/02-contratos-integracion.md) | Carlos ↔ Jeremy ↔ Justin |
| [Reglas de negocio](docs/reglas_negocio.md) | RF-01…RF-07 y matriz PDF |
| [Modelo de datos](docs/modelo_datos.md) | Tablas y relaciones |
| [Limitaciones](docs/limitaciones.md) | Ética y alcance |
| [Reto PDF (referencia)](docs/reto-aseguradora-del-sur.md) | Especificación completa |

---

## Equipo

Carlos (datos/modelos), Jeremy (scoring/agente), Justin (dashboard/demo) — hackIAthon 2026.
