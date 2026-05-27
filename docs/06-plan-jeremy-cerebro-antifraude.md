# Plan Jeremy — Cerebro antifraude explicable

Este documento define cómo construir el núcleo lógico de RastroSeguro: reglas, scoring, explicación, agente y simulador.

## Objetivo

Jeremy construye el cerebro del sistema. Su módulo recibe datos y modelos, calcula riesgo explicable y entrega resultados listos para el dashboard, agente, simulador y reporte.

```txt
data/synthetic/siniestros.csv
   ↓
Reglas auditables
   ↓
Scoring compuesto
   ↓
Explicabilidad
   ↓
data/processed/siniestros_scored.csv
   ↓
Dashboard + agente + simulador + reporte
```

## Decisión: no crear dataset demo temporal

No se creará `data/synthetic/siniestros_demo.csv` ni rutas paralelas de prueba.

Razones:

- Evita archivos redundantes que luego quedan como basura.
- Mantiene un solo contrato oficial con Carlos: `data/synthetic/siniestros.csv`.
- Hace que el pipeline sea claro para Justin.
- Las pruebas del motor se hacen con datos en memoria o fixtures dentro de `tests/`, no en `data/`.

Si falta el dataset oficial, el pipeline debe fallar con un mensaje útil indicando qué archivo espera.

## Arquitectura del núcleo

```txt
src/
├── rules/
│   ├── models.py
│   ├── base_rules.py
│   ├── vehicle_rules.py
│   ├── health_rules.py
│   ├── home_rules.py
│   ├── life_rules.py
│   ├── general_rules.py
│   └── rule_registry.py
├── scoring/
│   └── final_score.py
├── explainability/
│   └── explain_claim.py
├── agent/
│   ├── tools.py
│   ├── router.py
│   ├── rag.py
│   └── antifraud_agent.py
├── simulator/
│   └── simulate_claim.py
└── utils/
    ├── dates.py
    ├── risk_levels.py
    └── serialization.py
```

## Contrato de regla

Cada regla debe devolver evidencia trazable, no solo puntos.

```json
{
  "code": "RB-001",
  "name": "Siniestro cerca del inicio de póliza",
  "points": 8,
  "severity": "alta",
  "message": "El siniestro ocurrió 2 días después del inicio de la póliza.",
  "evidence": {
    "dias_desde_inicio_poliza": 2
  }
}
```

## Reglas prioritarias

### Base

- Siniestro cerca del inicio de póliza.
- Siniestro cerca del fin de póliza.
- Reporte tardío.
- Monto cercano a suma asegurada.
- Documentos incompletos.
- Documentos inconsistentes.
- Historial alto de siniestros del asegurado.
- Proveedor recurrente.
- Beneficiario recurrente.

### Vehículos

- Robo total cerca del inicio de póliza.
- Vehículo con múltiples siniestros.
- Accidente nocturno sin testigos.
- Ausencia de reporte policial.
- Tercero no identificado.
- Conductor recurrente.
- Zona de alta siniestralidad.
- Taller/proveedor recurrente.

### Salud

- Procedimiento con monto superior al promedio.
- Frecuencia atípica de atenciones.
- Clínica o proveedor médico recurrente.
- Factura emitida antes de la atención o tardíamente.

### Hogar

- Daño sin inspección realizada.
- Proveedor de reparación recurrente.
- Daños repetidos en corto periodo.
- Evento relevante sin evidencia fotográfica.

### Vida

- Beneficiario recurrente en reclamos.
- Cambios recientes antes del evento.
- Notificación tardía.
- Documento soporte faltante.

### Generales

- Monto atípico para la cobertura.
- Intermediario recurrente.
- Inconsistencia entre cobertura y evento.

## Score final

```txt
score_final =
  30% score_reglas
+ 25% score_modelo
+ 15% score_anomalia
+ 15% score_nlp
+ 10% score_grafo
+ 5% score_categorico
```

Si un componente no existe todavía, se usa valor neutro documentado para no bloquear a Justin.

Valor neutro recomendado:

```txt
50
```


## Guardrail de escalamiento por reglas

La fórmula ponderada puede usar valores neutros mientras Carlos entrega modelos o mientras NLP/grafo aún no están listos. Para evitar que reglas críticas queden diluidas por componentes neutros, se aplica este guardrail:

```txt
Si score_reglas >= 90 → score_final mínimo 80
Si score_reglas >= 75 → score_final mínimo 76
```

Esto permite que una acumulación fuerte de reglas auditables escale a Rojo aunque otros componentes aún estén en fase de integración.

## Semáforo

| Score | Nivel | Acción sugerida |
|---:|---|---|
| 0–40 | Verde | Continuar flujo normal |
| 41–75 | Amarillo | Solicitar revisión documental |
| 76–100 | Rojo | Escalar a revisión antifraude especializada |

## Salida para Justin

Archivo:

```txt
data/processed/siniestros_scored.csv
```

Columnas clave:

```txt
score_reglas, score_modelo, score_anomalia, score_nlp, score_grafo,
score_categorico, score_final, nivel_riesgo, alertas_activadas,
explicacion, accion_sugerida
```

## Orden de implementación

1. Crear modelos de reglas y utilidades.
2. Implementar reglas base.
3. Implementar reglas vehiculares.
4. Crear registry por ramo.
5. Crear score final compuesto.
6. Crear explicación textual.
7. Crear pipeline que lee `data/synthetic/siniestros.csv`.
8. Crear herramientas del agente.
9. Crear simulador reutilizando reglas y scoring.
10. Agregar RAG documental cuando el núcleo esté estable.

## Criterios de calidad

- Las reglas deben tener código, mensaje y evidencia.
- El score debe estar entre 0 y 100.
- El sistema no debe acusar fraude.
- Las explicaciones deben ser entendibles por un analista.
- El pipeline debe funcionar aunque falten componentes avanzados.
- Las pruebas no deben depender de archivos temporales en `data/`.


## NLP de narrativas similares

El análisis de narrativas se implementa como un módulo separado para evitar mezclar limpieza, similitud y scoring en un solo archivo.

```txt
src/nlp/
├── text_normalization.py
├── similarity_engine.py
├── narrative_signals.py
└── scoring.py
```

Responsabilidades:

| Archivo | Responsabilidad |
|---|---|
| `text_normalization.py` | Normalizar texto, quitar ruido y mapear sinónimos del dominio asegurador |
| `similarity_engine.py` | Calcular similitud con TF-IDF si está disponible y fallback por tokens si no |
| `narrative_signals.py` | Convertir similitudes en señales explicables y `score_nlp` |
| `scoring.py` | Enriquecer siniestros con `score_nlp`, `alerta_narrativa` y `siniestros_similares` |

El pipeline de scoring enriquece los reclamos con NLP cuando existe `descripcion`. Si `scikit-learn` no está instalado, el motor usa fallback determinístico basado en tokens para no romper la ejecución.

Columnas generadas:

```txt
score_nlp
alerta_narrativa
nivel_alerta_nlp
siniestros_similares
explicacion_nlp
```


## Grafo y relaciones

El análisis de relaciones se implementa como módulo separado para detectar recurrencias entre siniestros sin mezclar lógica de UI, scoring y extracción de entidades.

```txt
src/graph/
├── entity_extraction.py
├── relationship_metrics.py
└── scoring.py
```

Responsabilidades:

| Archivo | Responsabilidad |
|---|---|
| `entity_extraction.py` | Extraer entidades tipadas: asegurado, proveedor, beneficiario, vehículo, taller, conductor, ciudad, ramo, cobertura e intermediario |
| `relationship_metrics.py` | Calcular recurrencia de entidades y siniestros relacionados |
| `scoring.py` | Generar `score_grafo`, alertas de red, conexiones y flags para reglas recurrentes |

Columnas generadas:

```txt
score_grafo
alerta_red
entidades_recurrentes
conexiones_grafo
explicacion_grafo
proveedor_recurrente
beneficiario_recurrente
```

El pipeline aplica grafo antes de reglas para que `proveedor_recurrente` y `beneficiario_recurrente` puedan activar reglas auditables.
