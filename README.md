# RastroSeguro

Plataforma de inteligencia artificial explicable para **priorizar siniestros con señales de posible fraude** en seguros multi-ramo.

Proyecto del equipo para el **hackIAthon 2026 — Reto Aseguradora del Sur**.

> RastroSeguro no acusa fraude ni rechaza reclamos. Genera alertas explicables para que un analista humano revise primero los casos de mayor riesgo.

---

## Entregables obligatorios para calificar

| # | Entregable | Ubicación | Cómo verificar |
|---|------------|-----------|----------------|
| 1 | **Prototipo funcional** (Dashboard + API) | `frontend/` + `api/` + `notebooks/` | Ver [Demo en 2 minutos](#demo-en-2-minutos) |
| 2 | **Código fuente** con README detallado | Este repositorio | Estás aquí |
| 3 | **Dataset** sintético + datos públicos Ecuador | `data/synthetic/` + `data/curated/ecuador/` | Ver [Dataset](#dataset) |
| 4 | **Presentación ejecutiva** (PDF) | `presentation/pitch.pdf` | Generar con `py -3 scripts/export_pitch_pdf.py` |

> **Paquete de entrega:** todos los entregables están organizados en [`entregables/`](entregables/).

---

## Demo en 2 minutos

### Requisitos

- Python 3.11+
- Node.js 18+
- Dependencias: `pip install -r requirements.txt` y `cd frontend && npm install`

### 1. Pipeline de datos y modelos (una vez)

```bash
py -3 -m pipelines.models.run_carlos_pipeline --rows 25000 --seed 42 --scoring-rows 2000
py -3 -m pipelines.models.validate_deliverables
```

### 2. Levantar prototipo

Terminal A — API FastAPI:

```bash
uvicorn api.main:app --reload --port 8000
```

Terminal B — Dashboard Next.js:

```bash
cd frontend
npm run dev
```

Abrir **http://localhost:3000** → landing → **Entrar a la plataforma** (`/platform`).

### 3. Flujo demo sugerido (~4 min)

1. **Command Center** — casos rojos, proveedores de riesgo, ahorro potencial
2. **Análisis de caso** — score 0–100, semáforo, `rule_trace`, explicación
3. **Agente IA** — *"¿Qué proveedores concentran el 80% de las alertas rojas?"*
4. **Simulador** — siniestro 24 h post-póliza → RF-05 con explicación
5. **Reporte auditoría** — export Markdown con top casos

### Notebooks ejecutables (alternativa al dashboard)

```bash
jupyter notebook notebooks/
```

| Notebook | Contenido |
|----------|-----------|
| `01_exploracion_datos.ipynb` | Exploración del dataset sintético |
| `02_modelo_fraude.ipynb` | Entrenamiento del clasificador |
| `03_evaluacion_modelo.ipynb` | Métricas y casos estrella |

---

## Dataset

### Datos sintéticos (principal)

| Archivo | Filas | Descripción |
|---------|-------|-------------|
| `data/synthetic/siniestros.csv` | 25 000 | Siniestros multi-ramo con etiqueta de fraude simulada |
| `data/synthetic/polizas.csv` | ~6 100 | Pólizas vinculadas |
| `data/synthetic/asegurados.csv` | ~10 800 | Asegurados |
| `data/synthetic/proveedores.csv` | ~110 | Proveedores/talleres |
| `data/synthetic/documentos.csv` | ~1 300 | Documentos adjuntos |
| `data/processed/siniestros_scored.csv` | 25 000 | Siniestros con score final y nivel de riesgo |
| `data/synthetic/siniestros_qa.json` | — | Métricas de calidad del dataset |

Regenerar:

```bash
py -3 -m pipelines.data.generate_synthetic_data
py -3 -m src.scoring.final_score
```

### Datos públicos Ecuador (contexto)

| Fuente | Archivo curado |
|--------|----------------|
| SERCOP (sanciones) | `data/curated/ecuador/sercop_sanciones_curated.csv` |
| OCDS (contratos) | `data/curated/ecuador/ocds_contratos_curated.csv` |
| Señales proveedor | `data/curated/ecuador/supplier_risk_features.csv` |

Inventario completo: [`docs/inventario-fuentes-ecuador.md`](docs/inventario-fuentes-ecuador.md)

---

## Presentación ejecutiva

- **Markdown fuente:** [`presentation/pitch.md`](presentation/pitch.md)
- **PDF entregable:** [`presentation/pitch.pdf`](presentation/pitch.pdf)

Generar PDF:

```bash
py -3 scripts/export_pitch_pdf.py
```

Contenido (~10 min): problema, solución, demo, arquitectura IA, impacto de negocio, limitaciones y FAQ del jurado.

---

## Arquitectura

```txt
Datos sintéticos + Ecuador → Features → Reglas + ML + Anomalías + NLP + Grafo
    → Score final (0–100) → API FastAPI → Dashboard Next.js + Agente + Reportes
```

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15, React, Tailwind |
| API | FastAPI, Python 3.11+ |
| ML | scikit-learn (RandomForest, IsolationForest) |
| NLP | TF-IDF + similitud coseno |
| Grafo | Recurrencia de entidades |
| BD referencia | Postgres/Supabase, Oracle XE (Docker) |

Detalle: [`docs/arquitectura.md`](docs/arquitectura.md)

---

## Estado del proyecto

Cumplimiento del PDF del reto:

- Dataset sintético + tablas complementarias (pólizas, asegurados, proveedores, documentos)
- Contexto Ecuador (SERCOP/OCDS/ECU911/INEC)
- Score híbrido: reglas + ML + anomalías + NLP + grafo
- Agente con 12 preguntas del PDF + consulta jurado (80% alertas rojas)
- Simulación de ahorro potencial
- Dashboard Next.js + API FastAPI
- Documentación, pitch PDF, R y Oracle de referencia

Validación automática:

```bash
py -3 -m pipelines.models.validate_deliverables
py -3 -m unittest discover -s tests -p "test_*.py"
```

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [Arquitectura](docs/arquitectura.md) | Diagrama y módulos del sistema |
| [Uso de IA](docs/uso_ia.md) | Algoritmos, variables, métricas, limitaciones |
| [Reglas de negocio](docs/reglas_negocio.md) | RF-01…RF-07 y matriz PDF |
| [Modelo de datos](docs/modelo_datos.md) | Tablas y relaciones |
| [Limitaciones](docs/limitaciones.md) | Ética y alcance |
| [Instrucciones ejecución](docs/05-instrucciones-ejecucion.md) | Flujo completo paso a paso |
| [Reto PDF (referencia)](docs/reto-aseguradora-del-sur.md) | Especificación completa |

---

## Estructura del repositorio

```txt
RastroSeguro_hackIAthon/
├── api/                  # FastAPI (claims, agent, reports, health)
├── frontend/             # Dashboard Next.js
├── src/                  # Scoring, reglas, ML, NLP, agente, reportes
├── pipelines/            # Generación datos, entrenamiento, validación
├── data/
│   ├── synthetic/        # Dataset sintético (entregable)
│   ├── processed/        # Features y siniestros scored
│   └── curated/ecuador/  # Datos públicos curados
├── notebooks/            # Notebooks ejecutables (entregable alternativo)
├── presentation/         # Pitch ejecutivo PDF (entregable)
├── docs/                 # Documentación técnica
├── models/               # Artefactos ML (.joblib)
├── tests/                # Tests unitarios
└── r/                    # Scripts R de validación
```

---

## Herramientas adicionales

| Herramienta | Ruta |
|-------------|------|
| Análisis R | `r/` + `renv.lock` |
| Oracle XE (Docker) | `docker/oracle-xe/` |
| Esquema Oracle | `db/oracle/schema.sql` |

---

## Equipo

**Carlos** (datos/modelos) · **Jeremy** (scoring/agente) · **Justin** (dashboard/demo)

hackIAthon 2026 — Reto Aseguradora del Sur
