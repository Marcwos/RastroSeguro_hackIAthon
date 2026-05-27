# Contratos de integración

Este documento define lo que cada integrante entrega y consume. Si algo cambia aquí, debe comunicarse al equipo.

## Resumen

```txt
Carlos entrega dataset y modelos.
Jeremy entrega scoring, explicaciones y herramientas.
Justin consume resultados para la app y demo.
```

## 1. Entrada desde Carlos

Archivo principal:

```txt
data/synthetic/siniestros.csv
```

Columnas mínimas obligatorias:

| Columna | Uso |
|---|---|
| `id_siniestro` | Identificador único |
| `id_poliza` | Relación con póliza |
| `id_asegurado` | Relación con asegurado |
| `ramo` | Selección de reglas por ramo |
| `cobertura` | Análisis por tipo de cobertura |
| `ciudad` | Ranking geográfico |
| `id_proveedor` | Ranking/proveedor recurrente |
| `beneficiario` | Relaciones y recurrencia |
| `fecha_inicio_poliza` | Regla de borde de vigencia |
| `fecha_fin_poliza` | Regla de borde de vigencia |
| `fecha_ocurrencia` | Cálculo de fechas |
| `fecha_reporte` | Reporte tardío |
| `monto_reclamado` | Score por monto |
| `monto_estimado` | Comparación estimado/reclamado |
| `suma_asegurada` | Ratio contra cobertura |
| `descripcion` | NLP de narrativas |
| `documentos_completos` | Regla documental |
| `documentos_inconsistentes` | Regla documental crítica |
| `historial_siniestros_asegurado` | Frecuencia de reclamos |
| `etiqueta_fraude_simulada` | Entrenamiento/evaluación |

Columnas vehiculares deseables:

```txt
id_vehiculo, placa_hash, marca, modelo, anio, tipo_evento, tipo_impacto,
tercero_identificado, reporte_policial, hay_testigos, ocurrio_noche,
ocurrio_fin_semana, zona_alta_siniestralidad, historial_siniestros_vehiculo,
taller, conductor_recurrente
```

Modelos esperados cuando estén listos:

```txt
models/fraud_classifier.joblib
models/anomaly_detector.joblib
```

## 2. Salida de Jeremy hacia Justin

Archivo principal:

```txt
data/processed/siniestros_scored.csv
```

Columnas mínimas:

| Columna | Uso en UI |
|---|---|
| `id_siniestro` | Selección de caso |
| `ramo` | Filtros y comparación |
| `cobertura` | Filtros |
| `ciudad` | Rankings |
| `id_proveedor` | Rankings y relaciones |
| `beneficiario` | Relaciones |
| `monto_reclamado` | Impacto económico |
| `suma_asegurada` | Contexto del reclamo |
| `score_reglas` | Componente explicable |
| `score_modelo` | Componente ML |
| `score_anomalia` | Componente anomalías |
| `score_nlp` | Componente narrativas |
| `score_grafo` | Componente relaciones |
| `score_categorico` | Componente categórico |
| `score_final` | Ordenamiento principal |
| `nivel_riesgo` | Verde, Amarillo, Rojo |
| `alertas_activadas` | Explicación resumida |
| `explicacion` | Texto para analista |
| `accion_sugerida` | Próximo paso recomendado |

## 3. Contrato de `explain_claim`

Función:

```python
explain_claim(id_siniestro: str) -> dict
```

Salida esperada:

```json
{
  "id_siniestro": "SIN-0045",
  "score_final": 87,
  "nivel_riesgo": "Rojo",
  "alertas": ["Siniestro cerca del inicio de póliza"],
  "explicacion": "El caso requiere revisión especializada por acumulación de señales de riesgo.",
  "accion_sugerida": "Escalar a revisión antifraude especializada.",
  "componentes_score": {
    "reglas": 80,
    "modelo": 90,
    "anomalia": 75,
    "nlp": 85,
    "grafo": 70,
    "categorico": 60
  }
}
```

## 4. Contrato del simulador

Función:

```python
simulate_new_claim(claim_data: dict) -> dict
```

Entrada mínima:

```json
{
  "ramo": "vehiculos",
  "fecha_inicio_poliza": "2026-01-01",
  "fecha_fin_poliza": "2026-12-31",
  "fecha_ocurrencia": "2026-01-03",
  "fecha_reporte": "2026-01-10",
  "monto_reclamado": 18000,
  "suma_asegurada": 20000,
  "id_proveedor": "PROV-001",
  "descripcion": "Vehículo impactado por tercero no identificado.",
  "documentos_completos": false,
  "documentos_inconsistentes": true
}
```

Salida esperada:

```json
{
  "score_final": 84,
  "nivel_riesgo": "Rojo",
  "alertas_activadas": [],
  "explicacion": "",
  "accion_sugerida": ""
}
```

## 5. Herramientas mínimas del agente

```python
get_top_risky_claims(limit=10)
explain_claim(id_siniestro)
get_risk_by_branch()
get_provider_risk_ranking()
get_city_risk_distribution()
get_similar_narratives(id_siniestro)
get_graph_connections(id_siniestro)
get_missing_documents()
generate_executive_summary()
recommend_review_order()
simulate_new_claim(claim_data)
compare_branches()
```
