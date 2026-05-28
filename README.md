# RastroSeguro

Plataforma de inteligencia artificial explicable para **priorizar siniestros con señales de posible fraude** en seguros multi-ramo.

Proyecto del equipo para el **hackIAthon 2026 — Reto Aseguradora del Sur**.

> RastroSeguro no acusa fraude ni rechaza reclamos. Genera alertas explicables para que un analista humano revise primero los casos de mayor riesgo.

---

## Estado del proyecto

Cumplimiento del PDF del reto:

- Dataset sintético + tablas complementarias (pólizas, asegurados, proveedores, documentos)
- Contexto Ecuador (SERCOP/OCDS/ECU911/INEC)
- Score híbrido: reglas + ML + anomalías + NLP + grafo
- Agente con 12 preguntas del PDF + consulta jurado (80% alertas rojas)
- Simulación de ahorro potencial
- Dashboard Streamlit + Next.js + API FastAPI
- Documentación, pitch, R y Oracle de referencia

---

## Corrida limpia

```bash
py -3 -m src.models.run_carlos_pipeline --rows 25000 --seed 42 --scoring-rows 2000
py -3 -m src.models.validate_deliverables
py -3 -m unittest discover -s tests -p "test_*.py"
```

Demo UI:

```bash
streamlit run app/main.py
```

API + frontend:

```bash
uvicorn api.main:app --reload --port 8000
cd frontend && npm run dev
```

---

## Documentación (entregables PDF §14–§15)

| Documento | Contenido |
|---|---|
| [Arquitectura](docs/arquitectura.md) | Diagrama y módulos del sistema |
| [Uso de IA](docs/uso_ia.md) | Algoritmos, variables, métricas, limitaciones |
| [Reglas de negocio](docs/reglas_negocio.md) | RF-01…RF-07 y matriz PDF |
| [Modelo de datos](docs/modelo_datos.md) | Tablas y relaciones |
| [Limitaciones](docs/limitaciones.md) | Ética y alcance |
| [Pitch](presentation/pitch.md) | Presentación ejecutiva (~10 min) |
| [Reto PDF (referencia)](docs/reto-aseguradora-del-sur.md) | Especificación completa |

---

## Herramientas adicionales

| Herramienta | Ruta |
|---|---|
| Análisis R | `r/` + `renv.lock` |
| Oracle XE (Docker) | `docker/oracle-xe/` |
| Esquema Oracle | `db/oracle/schema.sql` |

---

## Equipo

Carlos (datos/modelos), Jeremy (scoring/agente), Justin (dashboard/demo) — hackIAthon 2026.
