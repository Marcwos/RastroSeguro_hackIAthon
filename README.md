# RastroSeguro

Plataforma de inteligencia artificial **explicable** para **priorizar siniestros con señales de posible fraude** en seguros multi-ramo.

Proyecto del equipo para el **hackIAthon 2026 — Reto Aseguradora del Sur**.

> RastroSeguro **no acusa fraude ni rechaza reclamos**. Genera alertas trazables para que un analista humano revise primero los casos de mayor riesgo.

---

## Qué hace

| Capacidad | Descripción |
|-----------|-------------|
| **Scoring híbrido** | Reglas auditadas + ML + anomalías + NLP + grafo → puntaje 0–100 y semáforo Verde/Amarillo/Rojo |
| **Dashboard** | Command Center, análisis de caso, simulador, reportes y exportación |
| **Agente multiagente** | Orquestación LangGraph: supervisor + especialistas (portafolio, caso, red, documentación) |
| **Extracción documental** | PDF/texto con confirmación humana obligatoria antes de procesar |
| **Explicabilidad** | `rule_trace`, evidencias por señal y lenguaje de “posible fraude / requiere revisión” |

---

## Entregables del reto

| # | Entregable | Ubicación | Verificación |
|---|------------|-----------|--------------|
| 1 | Prototipo funcional (Dashboard + API) | `frontend/` + `api/` + `notebooks/` | [Demo en 2 minutos](#demo-en-2-minutos) |
| 2 | Código fuente + README | Este repositorio | Estás aquí |
| 3 | Dataset sintético + datos públicos Ecuador | `data/synthetic/` + `data/curated/ecuador/` | [Dataset](#dataset) |
| 4 | Presentación ejecutiva (PDF) | `presentation/pitch.pdf` | [Presentación](#presentación-ejecutiva) |

Paquete organizado para entrega: [`entregables/`](entregables/).

---

## Demo en 2 minutos

### Requisitos

- Python **3.11+**
- Node.js **18+**

### 1. Instalar dependencias

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Opcional: tooling offline (scrapers, Excel) y calidad de código
pip install -e ".[pipelines,dev]"

cd frontend && npm install && cd ..
```

Copiar variables de entorno:

```bash
cp .env.example .env
```

### 2. Datos y modelos (una vez, si regeneras)

El repo incluye datos procesados listos para demo. Solo necesitas regenerar si cambias el pipeline:

```bash
python -m pipelines.models.run_carlos_pipeline --rows 25000 --seed 42 --scoring-rows 2000
python -m pipelines.models.validate_deliverables
python -m src.scoring.final_score
```

### 3. Levantar la plataforma

Terminal A — API FastAPI:

```bash
uvicorn api.main:app --reload --port 8000
```

Terminal B — Dashboard Next.js:

```bash
cd frontend && npm run dev
```

Abrir **http://localhost:3000** → landing → **Entrar a la plataforma** (`/platform`).

Health check API: **http://localhost:8000/api/health**

### 4. Flujo demo sugerido (~4 min)

1. **Command Center** — casos rojos, proveedores de riesgo, ahorro potencial
2. **Paso 1 — Carga** — subir CSV o PDF; confirmar extracción antes de procesar
3. **Análisis de caso** — score, semáforo, `rule_trace`, explicación trazable
4. **Agente IA** — *"¿Qué proveedores concentran el 80% de las alertas rojas?"*
5. **Simulador** — siniestro 24 h post-póliza → RF-05 con explicación
6. **Reporte auditoría** — export Markdown con top casos

### Notebooks (alternativa al dashboard)

```bash
jupyter notebook notebooks/
```

| Notebook | Contenido |
|----------|-----------|
| `01_exploracion_datos.ipynb` | Exploración del dataset sintético |
| `02_modelo_fraude.ipynb` | Entrenamiento del clasificador |
| `03_evaluacion_modelo.ipynb` | Métricas y casos estrella |

---

## Agente multiagente

El chat usa **LangGraph** por defecto con arquitectura **supervisor + especialistas**:

| Agente | Dominio |
|--------|---------|
| **Supervisor** | Clasifica la pregunta y delega |
| **Analista de portafolio** | Top riesgo, rankings, ciudades, ramos, montos, frecuencia… |
| **Investigador de caso** | Explicación, expediente, narrativas similares, conexiones |
| **Analista de red** | Redes y anillos de fraude |
| **Especialista en documentación** | Metodología, reglas y ética (RAG) |
| **Sintetizador** | Consolida el turno |

Las respuestas usan las **mismas herramientas deterministas** que el runtime clásico; el multiagente añade orquestación y traza (`runtime.agents` en la API).

```bash
# Desactivar multiagente (kill-switch en producción)
RASTRO_AGENT_RUNTIME=classic
```

Si LangGraph no está disponible, el sistema cae automáticamente a `classic` sin romper la app.

---

## Variables de entorno

Copiar [`.env.example`](.env.example) a `.env`:

| Variable | Default | Uso |
|----------|---------|-----|
| `OPENAI_API_KEY` | — | Síntesis conversacional del agente (opcional) |
| `RASTRO_LLM_ENABLED` | `false` | Activar capa LLM sobre respuestas deterministas |
| `RASTRO_LLM_MODEL` | `gpt-4o` | Modelo OpenAI |
| `RASTRO_API_CORS_ORIGINS` | localhost:3000 | Orígenes permitidos para el frontend |
| `RASTRO_AGENT_RUNTIME` | `langgraph` | `langgraph` o `classic` |
| `RASTRO_MAX_SCORING_ROWS` | `5000` | Límite de filas para re-scoring en línea (evita timeouts) |
| `RASTRO_SAVINGS_PREVENTION_RATE` | `0.20` | Tasa ilustrativa para simulación de ahorro |

El scoring y las herramientas del agente **funcionan sin OpenAI**. La LLM solo mejora la redacción cuando está activada.

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
| `data/processed/siniestros_scored.csv` | — | Siniestros con score final y nivel de riesgo |
| `data/synthetic/siniestros_qa.json` | — | Métricas de calidad del dataset |

Regenerar:

```bash
python -m pipelines.data.generate_synthetic_data
python -m src.scoring.final_score
```

### Datos públicos Ecuador (contexto)

| Fuente | Archivo curado |
|--------|----------------|
| SERCOP (sanciones) | `data/curated/ecuador/sercop_sanciones_curated.csv` |
| OCDS (contratos) | `data/curated/ecuador/ocds_contratos_curated.csv` |
| Señales proveedor | `data/curated/ecuador/supplier_risk_features.csv` |

Inventario: [`docs/inventario-fuentes-ecuador.md`](docs/inventario-fuentes-ecuador.md)

---

## Presentación ejecutiva

- **Markdown fuente:** [`presentation/RastroSeguro-Pitch.md`](presentation/RastroSeguro-Pitch.md)
- **PDF entregable:** [`presentation/pitch.pdf`](presentation/pitch.pdf)

Generar PDF (requiere `fpdf2`):

```bash
pip install fpdf2
python scripts/export_pitch_pdf.py
```

También disponible en [`entregables/04-presentacion-ejecutiva/`](entregables/04-presentacion-ejecutiva/).

---

## Arquitectura

```txt
Datos + documentos → Features → Reglas + ML + Anomalías + NLP + Grafo
    → Score (0–100) → API FastAPI → Dashboard Next.js
                              ↘ Agente multiagente (LangGraph) + Reportes
```

| Capa | Tecnología / ubicación |
|------|------------------------|
| Frontend | Next.js, React, Tailwind — `frontend/` |
| API | FastAPI — `api/` |
| Aplicación | Casos de uso, queries de riesgo — `src/application/` |
| Dominio | Scoring, reglas, NLP, grafo — `src/` |
| Infraestructura | Repositorios, LLM, chat history — `src/infrastructure/` |
| Pipelines offline | Datos, modelos, scraping — `pipelines/` |
| ML | scikit-learn (RandomForest, IsolationForest) |
| Orquestación agente | LangGraph (supervisor + workers) |

Detalle técnico:

- [Arquitectura general](docs/arquitectura.md)
- [Clean architecture backend](docs/architecture/backend-clean-architecture.md) — refactor completo (Fases 0–4)

---

## Validación y calidad

```bash
# Entregables del reto
python -m pipelines.models.validate_deliverables

# Tests (126+)
python -m pytest -q

# Contratos de capas (deploy no importa pipelines offline)
lint-imports
```

---

## Despliegue (Azure App Service)

El backend arranca con [`startup.sh`](startup.sh) (gunicorn + uvicorn worker):

```bash
bash startup.sh
```

Recomendaciones en producción:

- Health check path: `/api/health`
- `WEBSITES_CONTAINER_START_TIME_LIMIT` elevado si el arranque es lento
- `RASTRO_API_CORS_ORIGINS` con la URL del frontend (Vercel/Azure)
- Subidas grandes: respetar límite de re-scoring (`RASTRO_MAX_SCORING_ROWS`) y tamaño de archivo en el frontend (5 MB)

---

## Estado del proyecto

**Listo para demo y entrega.** Cumple los entregables del PDF del reto:

- Dataset sintético + tablas complementarias
- Contexto Ecuador (SERCOP/OCDS/ECU911/INEC)
- Score híbrido explicable (reglas + ML + anomalías + NLP + grafo)
- Agente con las 12 preguntas del PDF + consulta jurado (80% alertas rojas)
- Orquestación multiagente con LangGraph
- Simulación de ahorro potencial
- Dashboard Next.js + API FastAPI desplegables
- Documentación, pitch, R y Oracle de referencia
- Guardrails de producción (límite de re-scoring, confirmación humana en extracción)

---

## Documentación

| Documento | Contenido |
|-----------|-----------|
| [Arquitectura](docs/arquitectura.md) | Diagrama y módulos del sistema |
| [Clean architecture](docs/architecture/backend-clean-architecture.md) | Capas, smells resueltos, contratos |
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
├── api/                      # FastAPI (claims, agent, reports, health, simulator)
├── frontend/                 # Dashboard Next.js
├── src/
│   ├── application/          # Casos de uso (chat, rescore, risk_queries)
│   ├── infrastructure/       # Config, repos, LLM, chat history
│   ├── agent/                # Router, intents, LangGraph runtime, RAG
│   ├── scoring/              # Pipeline de score final
│   ├── rules/                # Reglas RF-01…RF-07
│   ├── nlp/                  # Similitud de narrativas
│   ├── graph/                # Redes y anillos de fraude
│   └── reports/              # Reportes y simulación de ahorro
├── pipelines/                # Tooling offline (datos, modelos, scraping)
├── data/
│   ├── synthetic/            # Dataset sintético
│   ├── processed/            # Features y siniestros scored
│   └── curated/ecuador/      # Datos públicos curados
├── notebooks/                # Notebooks ejecutables
├── presentation/             # Pitch ejecutivo
├── entregables/              # Paquete de entrega oficial
├── docs/                     # Documentación técnica
├── models/                   # Artefactos ML (.joblib)
├── tests/                    # Tests unitarios e integración API
└── r/                        # Scripts R de validación
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
