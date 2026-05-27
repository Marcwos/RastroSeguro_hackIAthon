# Demo y vistas de la aplicación

Este documento reduce el alcance visual sin eliminar funcionalidades avanzadas.

## Decisión

```txt
Menos páginas independientes.
Más tabs internas por página.
```

Así Justin puede construir una app clara sin duplicar pantallas.

## Vista 1 — Dashboard

Objetivo: mostrar valor ejecutivo rápido.

Tabs sugeridas:

- Resumen general.
- Riesgo por ramo.
- Ciudades y proveedores.
- Métricas del modelo.

Debe mostrar:

- Total de siniestros.
- Casos verdes, amarillos y rojos.
- Monto total reclamado.
- Monto en casos rojos.
- Distribución de riesgo.
- Top proveedores y ciudades.

## Vista 2 — Revisión de siniestros

Objetivo: priorizar y explicar casos.

Tabs sugeridas:

- Bandeja priorizada.
- Detalle del siniestro.
- Explicación del score.
- Documentos y alertas.

Debe consumir:

- `data/processed/siniestros_scored.csv`.
- `explain_claim(id_siniestro)`.

## Vista 3 — Inteligencia antifraude

Objetivo: mostrar diferenciadores técnicos.

Tabs sugeridas:

- Narrativas similares.
- Grafo de relaciones.
- Ranking de proveedores.
- Comparación multi-ramo.

Nota: el grafo no tiene que ser complejo al inicio. Puede empezar como red del caso seleccionado y rankings de concentración.

## Vista 4 — Agente y simulador

Objetivo: demostrar interacción inteligente y evaluación en vivo.

Tabs sugeridas:

- Chat antifraude.
- Preguntas rápidas.
- Simulador de nuevo siniestro.
- RAG documental.

El agente debe usar herramientas reales. El simulador debe calcular score y explicación con los mismos módulos de Jeremy.

## Vista 5 — Reporte / demo

Objetivo: facilitar pitch y cierre ejecutivo.

Tabs sugeridas:

- Resumen ejecutivo.
- Casos estrella.
- Exportar reporte.
- Guion de demo.

No usar “modo jurado” como concepto formal de producto. Si se necesitan accesos rápidos para la presentación, llamarlos “casos estrella” o “demo ejecutiva”.

## Casos estrella

- Rojo evidente: muchas reglas críticas activadas.
- Rojo no evidente: anomalía, grafo o narrativa lo elevan.
- Amarillo ético: señales moderadas, revisión documental.
- Proveedor recurrente: concentración de alertas.
- Narrativa similar: reclamos con textos parecidos.
- Simulación en vivo: nuevo caso evaluado durante la demo.
