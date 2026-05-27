# Justin — Dashboard, visualización y demo

Justin construye la experiencia visual de RastroSeguro en Streamlit.

## Objetivo

Mostrar de forma clara el riesgo, las explicaciones, los patrones y la demo final sin construir demasiadas pantallas independientes.

## Decisión de interfaz

```txt
Menos páginas, más tabs internas.
```

Estructura recomendada:

```txt
app/
├── main.py
└── pages/
    ├── 1_dashboard.py
    ├── 2_revision.py
    ├── 3_inteligencia.py
    ├── 4_agente_simulador.py
    └── 5_reporte.py
```

## Vista 1 — Dashboard

Mostrar:

- Total de siniestros.
- Casos por nivel de riesgo.
- Monto total reclamado.
- Monto en casos rojos.
- Riesgo por ramo.
- Top ciudades y proveedores.

## Vista 2 — Revisión

Mostrar:

- Tabla priorizada por `score_final`.
- Filtros por ramo, riesgo, ciudad, proveedor y cobertura.
- Detalle del caso seleccionado.
- Alertas y explicación.
- Componentes del score.

## Vista 3 — Inteligencia antifraude

Agrupar:

- Narrativas similares.
- Grafo simple de relaciones.
- Ranking de proveedores.
- Comparación multi-ramo.

## Vista 4 — Agente y simulador

Agrupar:

- Chat o preguntas rápidas.
- Respuestas desde herramientas de Jeremy.
- Formulario de simulación de nuevo siniestro.
- Consulta documental si hay RAG.

## Vista 5 — Reporte / demo

Agrupar:

- Resumen ejecutivo.
- Casos estrella.
- Exportación o vista de reporte.
- Guion de demo.

No usar “modo jurado” como módulo formal. Usar “casos estrella” o “demo ejecutiva”.

## Entradas que consumes

```txt
data/processed/siniestros_scored.csv
```

Funciones de Jeremy:

```python
explain_claim(id_siniestro)
simulate_new_claim(claim_data)
get_provider_risk_ranking()
generate_executive_summary()
```

Métricas de Carlos cuando estén disponibles.

## Prioridad

1. Dashboard + revisión.
2. Detalle explicable.
3. Inteligencia antifraude.
4. Agente/simulador.
5. Reporte/demo.
