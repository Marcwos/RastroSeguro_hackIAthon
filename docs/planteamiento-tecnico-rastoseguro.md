# RastroSeguro — Planteamiento técnico y estratégico

## 1. Idea general

**RastroSeguro** es una plataforma de inteligencia artificial explicable para priorizar siniestros con señales de posible fraude en seguros vehiculares.

La solución no acusa fraude ni rechaza automáticamente un reclamo. Su objetivo es ayudar al analista humano a revisar primero los casos con mayor riesgo, mostrando evidencia, patrones, relaciones y explicaciones claras.

> RastroSeguro no reemplaza al analista antifraude. Funciona como un copiloto que cruza datos, detecta señales anómalas y explica por qué un siniestro requiere revisión.

---

## 2. Problema que resuelve

En una aseguradora, la detección manual de posibles fraudes puede ser lenta porque el analista debe revisar documentos, fechas, montos, historial de reclamos, proveedores, beneficiarios, narrativas y relaciones entre casos.

Muchas señales no aparecen al mirar un siniestro aislado. Se vuelven visibles cuando se cruzan varias fuentes de información.

Ejemplos:

- Reclamos cerca del inicio o fin de la póliza.
- Montos reclamados atípicos.
- Reportes tardíos.
- Documentos incompletos o inconsistentes.
- Proveedores o beneficiarios recurrentes.
- Narrativas similares entre reclamos.
- Vehículos o asegurados con alta frecuencia de siniestros.
- Redes sospechosas entre asegurados, vehículos y proveedores.

---

## 3. Propuesta de valor

RastroSeguro permite:

- Priorizar casos de revisión antifraude.
- Reducir el tiempo de análisis inicial.
- Generar un score de riesgo de 0 a 100.
- Clasificar siniestros en verde, amarillo y rojo.
- Explicar cada alerta con reglas y evidencia.
- Detectar narrativas similares.
- Identificar proveedores y redes de relación sospechosas.
- Simular nuevos siniestros en tiempo real.
- Consultar los datos mediante un agente de IA conectado a herramientas.
- Generar reportes ejecutivos para auditoría o gerencia.

---

## 4. Diferenciador frente a otros equipos

Muchos equipos probablemente harán:

```txt
CSV + reglas + dashboard + ChatGPT
```

RastroSeguro debe ir más allá:

```txt
Dataset sintético realista
+ motor experto de reglas
+ modelo ML entrenado
+ detector de anomalías
+ NLP de narrativas
+ grafo de relaciones
+ agente con herramientas
+ simulador de nuevo siniestro
+ feedback humano
+ reporte ejecutivo exportable
```

La idea clave:

> RastroSeguro no es un chatbot antifraude. Es un motor de priorización explicable con IA, datos, reglas auditables y análisis de relaciones.

---

## 5. Enfoque de IA

La solución tendrá un enfoque híbrido:

1. **Reglas de negocio**
   - Señales claras y explicables.
   - Ayudan a justificar el score.
   - Dan trazabilidad para el analista.

2. **Modelo supervisado entrenado**
   - Entrenado con datos sintéticos etiquetados.
   - Predice probabilidad de riesgo.
   - Modelo sugerido: `RandomForestClassifier`.

3. **Modelo de anomalías**
   - Detecta casos raros frente al comportamiento general.
   - Modelo sugerido: `IsolationForest`.

4. **NLP para narrativas**
   - Detecta relatos similares o clonados.
   - Técnicas sugeridas:
     - `TfidfVectorizer + cosine_similarity`
     - Embeddings si hay tiempo.

5. **Scoring categórico inspirado en RIDIT/PRIDIT**
   - Usado como fundamento estadístico para variables categóricas.
   - Ayuda a defender que las variables tipo sí/no también pueden convertirse en señales cuantificables.

6. **Grafo de relaciones**
   - Detecta concentración de riesgo entre asegurados, vehículos, proveedores, beneficiarios y ciudades.
   - Herramientas sugeridas:
     - `networkx`
     - `pyvis`
     - `plotly`

7. **Agente de IA con herramientas**
   - No responde únicamente por prompt.
   - Consulta funciones reales sobre los datos procesados.
   - Explica, resume y recomienda con base en resultados del pipeline.

---

## 6. Por qué no usar fine-tuning como base

No se recomienda usar fine-tuning del LLM como pieza central porque:

- El agente necesita consultar datos actualizados.
- El fine-tuning no debe memorizar siniestros.
- Toma tiempo preparar datasets de alta calidad.
- Puede complicar la demo.
- En fraude, la trazabilidad es más importante que el estilo conversacional.

Respuesta para jurado:

> No usamos fine-tuning del LLM como núcleo porque el objetivo no es que el modelo memorice casos, sino que consulte datos auditables y explique señales verificables. Entrenamos modelos específicos de riesgo y conectamos el agente a herramientas del sistema.

---

## 7. Fine-tuning o entrenamiento opcional

Si sobra tiempo, se puede agregar una capa entrenada adicional sin complicar demasiado:

### Opción recomendada: router de intención entrenado

Entrenar un clasificador simple para detectar qué herramienta debe usar el agente según la pregunta del analista.

Ejemplos de intención:

```txt
top_riesgo
explicar_siniestro
ranking_proveedores
ranking_ciudades
documentos_faltantes
narrativas_similares
resumen_ejecutivo
simular_siniestro
```

Modelos posibles:

```txt
LogisticRegression
LinearSVC
RandomForestClassifier
```

Datos necesarios:

```txt
100 a 300 preguntas sintéticas etiquetadas
```

Ejemplo:

```csv
pregunta,intencion
"¿Cuáles son los siniestros más riesgosos?",top_riesgo
"Explícame por qué el SIN-0045 es rojo",explicar_siniestro
"¿Qué proveedores concentran más alertas?",ranking_proveedores
"Genera un resumen para gerencia",resumen_ejecutivo
```

Esto permite decir:

> Además del modelo de riesgo, entrenamos un router de intención para que el agente seleccione herramientas de análisis en lugar de depender solo de prompts.

Esta opción es más viable que fine-tuning de un LLM completo.

---

## 8. Dataset

### Decisión

Usar **dataset sintético creado por el equipo**.

Razón:

- El reto permite datos sintéticos.
- Evita datos personales reales.
- Permite controlar patrones sospechosos para la demo.
- Permite explicar el origen y la estructura.
- Permite crear casos específicos para pruebas del jurado.

### Tamaño recomendado

```txt
1500 a 3000 siniestros sintéticos
```

Distribución sugerida:

```txt
70% casos normales
20% casos de riesgo medio
10% casos de riesgo alto
```

### Archivos sugeridos

```txt
data/
├── raw/
│   ├── siniestros.csv
│   ├── polizas.csv
│   ├── asegurados.csv
│   ├── vehiculos.csv
│   ├── proveedores.csv
│   └── documentos.csv
├── processed/
│   └── siniestros_scored.csv
└── synthetic/
    └── synthetic_claims_dataset.csv
```

### Columnas principales

```txt
id_siniestro
id_poliza
id_asegurado
id_vehiculo
id_proveedor
ramo
cobertura
fecha_inicio_poliza
fecha_fin_poliza
fecha_ocurrencia
fecha_reporte
dias_desde_inicio_poliza
dias_desde_fin_poliza
dias_entre_ocurrencia_reporte
monto_reclamado
monto_estimado
monto_pagado
suma_asegurada
ratio_monto_suma_asegurada
ciudad
sucursal
descripcion
documentos_completos
documentos_inconsistentes
reporte_policial
hay_testigos
ocurrio_noche
ocurrio_fin_semana
zona_alta_siniestralidad
asegurado_acepta_culpa
coincidencia_apellidos
historial_siniestros_asegurado
historial_siniestros_vehiculo
reclamos_proveedor_ultimos_12m
proveedor_lista_restrictiva
etiqueta_fraude_simulada
```

---

## 9. Escenarios sintéticos inyectados

El generador de datos debe crear patrones controlados:

### Escenario 1: borde de vigencia

```txt
Siniestro ocurre entre 1 y 10 días después de iniciar la póliza.
```

### Escenario 2: reporte tardío

```txt
El siniestro se reporta más de 7 días después de ocurrido.
```

### Escenario 3: monto atípico

```txt
Monto reclamado supera el promedio del ramo o representa más del 95% de la suma asegurada.
```

### Escenario 4: proveedor recurrente

```txt
Un proveedor concentra varios casos amarillos o rojos.
```

### Escenario 5: documentos inconsistentes

```txt
Fechas no coinciden, documentos incompletos o ilegibles.
```

### Escenario 6: narrativa clonada

```txt
Varios reclamos usan relatos muy parecidos.
```

### Escenario 7: asegurado frecuente

```txt
Un asegurado registra varios reclamos en menos de 18 meses.
```

### Escenario 8: vehículo frecuente

```txt
Un vehículo aparece en varios siniestros.
```

### Escenario 9: accidente nocturno sin soporte

```txt
Ocurre de noche, sin testigos y sin reporte policial.
```

### Escenario 10: red sospechosa

```txt
Varios asegurados están conectados con el mismo proveedor, beneficiario o taller.
```

---

## 10. Motor de reglas

El motor de reglas debe devolver:

```txt
score_reglas
alertas_activadas
explicacion_reglas
accion_sugerida
```

### Reglas sugeridas

| Código | Regla | Puntaje sugerido |
|---|---|---:|
| RF-01 | Siniestro <= 10 días desde inicio de póliza | +8 |
| RF-02 | Siniestro entre 11 y 30 días desde inicio de póliza | +4 |
| RF-03 | Reporte tardío mayor a 7 días | +5 |
| RF-04 | Reporte entre 4 y 7 días | +3 |
| RF-05 | Documentos inconsistentes | +10 |
| RF-06 | Documentos incompletos | +4 |
| RF-07 | Proveedor en lista restrictiva | +10 |
| RF-08 | Proveedor con más de 2 casos observados | +5 |
| RF-09 | Asegurado con 3 o más reclamos previos | +8 |
| RF-10 | Vehículo con 3 o más reclamos previos | +6 |
| RF-11 | Narrativa similar mayor a 85% | +8 |
| RF-12 | Narrativa similar entre 70% y 84% | +4 |
| RF-13 | Monto reclamado mayor al 95% de suma asegurada | +5 |
| RF-14 | Accidente nocturno sin testigos ni reporte policial | +6 |
| RF-15 | Coincidencia de apellidos entre partes | +4 |

---

## 11. Modelos de IA

### 11.1 Modelo supervisado

Modelo recomendado:

```txt
RandomForestClassifier
```

Objetivo:

```txt
Predecir probabilidad de posible fraude o riesgo alto.
```

Variable objetivo:

```txt
etiqueta_fraude_simulada
```

Features:

```txt
dias_desde_inicio_poliza
dias_desde_fin_poliza
dias_entre_ocurrencia_reporte
monto_reclamado
monto_estimado
ratio_monto_suma_asegurada
historial_siniestros_asegurado
historial_siniestros_vehiculo
reclamos_proveedor_ultimos_12m
documentos_completos
documentos_inconsistentes
reporte_policial
hay_testigos
ocurrio_noche
ocurrio_fin_semana
zona_alta_siniestralidad
proveedor_lista_restrictiva
```

Métricas a mostrar:

```txt
Precision
Recall
F1-score
Matriz de confusión
AUC-ROC
```

### 11.2 Detector de anomalías

Modelo recomendado:

```txt
IsolationForest
```

Objetivo:

```txt
Detectar casos raros que no necesariamente activan reglas evidentes.
```

Salida:

```txt
score_anomalia
nivel_anomalia
```

### 11.3 NLP de narrativas

Versión inicial:

```txt
TfidfVectorizer
cosine_similarity
```

Versión avanzada si hay tiempo:

```txt
Embeddings semánticos
```

Salida:

```txt
score_nlp
siniestros_similares
porcentaje_similitud
alerta_narrativa
```

### 11.4 Grafo de relaciones

Métricas posibles:

```txt
degree centrality
proveedores con más conexiones
proveedores con más casos rojos
comunidades de riesgo
asegurados conectados a múltiples proveedores
vehículos repetidos
```

Salida:

```txt
score_grafo
nodos_relacionados
alerta_red
```

---

## 12. Score final

RastroSeguro usará un score compuesto:

```txt
score_final =
  35% score_reglas
+ 25% score_modelo_supervisado
+ 15% score_anomalias
+ 15% score_nlp
+ 10% score_grafo
```

### Clasificación

| Rango | Nivel | Acción sugerida |
|---:|---|---|
| 0 - 40 | Verde | Continuar flujo normal |
| 41 - 75 | Amarillo | Revisión documental |
| 76 - 100 | Rojo | Revisión especializada |

### Explicabilidad del score

Cada siniestro debe mostrar:

```txt
score_reglas
score_modelo
score_anomalia
score_nlp
score_grafo
score_final
nivel_riesgo
alertas_activadas
explicacion_textual
accion_sugerida
```

---

## 13. Aplicación web

Stack recomendado:

```txt
Python
Streamlit
Pandas
Scikit-learn
Plotly
NetworkX
PyVis
Joblib
SQLite o CSV
```

Streamlit es recomendable porque permite una demo funcional y visual en poco tiempo.

---

## 14. Vistas de la aplicación

### 14.1 Dashboard ejecutivo

Debe mostrar:

```txt
Total de siniestros analizados
Casos verdes
Casos amarillos
Casos rojos
Monto total reclamado
Monto en casos rojos
Porcentaje de casos de alto riesgo
Top ciudades con alertas
Top proveedores con alertas
```

Gráficos:

```txt
Distribución por nivel de riesgo
Riesgo por ciudad
Riesgo por proveedor
Riesgo por cobertura
Evolución temporal de siniestros
```

---

### 14.2 Carga de dataset

Debe permitir:

```txt
Cargar CSV propio
Usar dataset sintético de demo
Validar columnas requeridas
Mostrar vista previa
Procesar dataset
Generar score
Exportar dataset procesado
```

Importante:

> Esta vista demuestra que el sistema no está amarrado a un solo archivo preparado. Puede recibir nuevos datos y procesarlos.

---

### 14.3 Bandeja de revisión

Tabla ordenada por `score_final`.

Columnas:

```txt
id_siniestro
ciudad
proveedor
cobertura
monto_reclamado
score_final
nivel_riesgo
alertas_activadas
accion_sugerida
```

Filtros:

```txt
nivel de riesgo
ciudad
proveedor
cobertura
documentos inconsistentes
rango de score
```

---

### 14.4 Detalle del siniestro

Debe mostrar:

```txt
Score final
Nivel de riesgo
Datos del siniestro
Reglas activadas
Score por componente
Narrativas similares
Relaciones del caso
Documentos faltantes
Recomendación
```

Ejemplo de explicación:

```txt
El siniestro SIN-0045 fue marcado como riesgo rojo porque ocurrió 2 días después del inicio de la póliza, el monto reclamado representa el 97% de la suma asegurada, el proveedor aparece en 8 casos observados y la narrativa tiene 91% de similitud con otros reclamos. Se recomienda revisión especializada antes de continuar el flujo.
```

---

### 14.5 Grafo de relaciones

Visualización de red:

```txt
Asegurado → Siniestro → Proveedor
Siniestro → Vehículo
Siniestro → Beneficiario
Proveedor → Ciudad
```

Objetivo:

```txt
Detectar concentración de riesgo y conexiones no evidentes.
```

---

### 14.6 Simulador de nuevo siniestro

Formulario para ingresar un caso nuevo:

```txt
fecha_inicio_poliza
fecha_fin_poliza
fecha_ocurrencia
fecha_reporte
monto_reclamado
monto_estimado
suma_asegurada
ciudad
proveedor
descripcion
documentos_completos
documentos_inconsistentes
reporte_policial
hay_testigos
ocurrio_noche
ocurrio_fin_semana
```

Salida:

```txt
score_final
nivel_riesgo
alertas_activadas
explicacion
accion_sugerida
siniestros similares
relaciones con proveedor
```

Este módulo es clave para la demo porque permite al jurado pedir un caso y verlo evaluado en tiempo real.

---

### 14.7 Agente antifraude

El agente debe responder preguntas como:

```txt
¿Cuáles son los 10 siniestros con mayor riesgo?
¿Por qué el siniestro SIN-0045 fue marcado como rojo?
¿Qué proveedores concentran más alertas?
¿Qué ciudades tienen mayor concentración de riesgo?
¿Qué documentos faltan en los casos críticos?
¿Qué casos tienen montos atípicos?
¿Qué siniestros ocurrieron cerca del inicio de la póliza?
¿Qué narrativas son similares?
Genera un resumen ejecutivo de los casos críticos.
Recomienda qué casos debería revisar primero el analista.
```

### Herramientas internas del agente

```txt
get_top_risky_claims()
explain_claim(id_siniestro)
get_provider_risk_ranking()
get_city_risk_distribution()
get_similar_narratives(id_siniestro)
get_graph_connections(id_siniestro)
get_missing_documents()
generate_executive_summary()
recommend_review_order()
simulate_new_claim()
```

Mensaje clave:

> El agente no inventa respuestas. Consulta funciones conectadas a los datos, modelos, reglas y resultados del sistema.

---

### 14.8 Reporte para auditoría

Debe permitir generar un reporte en PDF, Markdown o HTML con:

```txt
Resumen ejecutivo
Top 10 casos críticos
Proveedores con más alertas
Ciudades con mayor concentración
Monto total expuesto
Principales reglas activadas
Limitaciones del modelo
Recordatorio de revisión humana
```

---

### 14.9 Feedback humano

Agregar un flujo simple:

```txt
Analista marca el caso como:
- Requiere más documentos
- Revisado sin novedad
- Posible fraude confirmado
- Falso positivo
```

Guardar esta retroalimentación en:

```txt
feedback_analista.csv
```

Valor para el pitch:

> En producción, esta retroalimentación permitiría mejorar y reentrenar el modelo con decisiones reales del equipo antifraude.

---

### 14.10 Modo jurado

Crear una sección con botones de demo rápida:

```txt
Caso rojo evidente
Caso rojo no evidente
Caso amarillo ético
Proveedor recurrente
Narrativa clonada
Nuevo siniestro simulado
Resumen ejecutivo automático
```

Objetivo:

> Evitar perder tiempo buscando casos durante la presentación.

---

## 15. Estructura del repositorio

```txt
rastroseguro/
├── README.md
├── requirements.txt
├── .env.example
├── data/
│   ├── raw/
│   ├── processed/
│   └── synthetic/
├── notebooks/
│   ├── 01_exploracion_datos.ipynb
│   ├── 02_modelo_riesgo.ipynb
│   └── 03_evaluacion_modelo.ipynb
├── src/
│   ├── data/
│   │   ├── generate_synthetic_data.py
│   │   ├── load_data.py
│   │   └── validate_schema.py
│   ├── features/
│   │   └── build_features.py
│   ├── rules/
│   │   └── fraud_rules.py
│   ├── models/
│   │   ├── train_classifier.py
│   │   ├── train_anomaly.py
│   │   └── predict.py
│   ├── nlp/
│   │   └── narrative_similarity.py
│   ├── graph/
│   │   └── relationship_graph.py
│   ├── scoring/
│   │   └── final_score.py
│   ├── explainability/
│   │   └── explain_claim.py
│   ├── agent/
│   │   ├── tools.py
│   │   ├── router.py
│   │   └── antifraud_agent.py
│   └── reports/
│       └── generate_report.py
├── app/
│   └── main.py
├── docs/
│   ├── arquitectura.md
│   ├── modelo_datos.md
│   ├── reglas_negocio.md
│   ├── uso_ia.md
│   ├── etica_limitaciones.md
│   └── pitch.md
├── tests/
│   ├── test_rules.py
│   ├── test_scoring.py
│   └── test_data_validation.py
└── presentation/
    └── pitch.pdf
```

---

## 16. Entregables

### Obligatorios

```txt
Prototipo funcional
Código fuente
Dataset sintético
README
Arquitectura
Modelo de datos
Explicación del modelo IA
Rúbrica de alertas
Demo funcional
Presentación ejecutiva
```

### Extras que elevan la solución

```txt
Simulador de nuevo siniestro
Grafo de relaciones
Agente con herramientas
Reporte de auditoría
Feedback humano
Modo jurado
Router de intención entrenado
Documentación ética
```

---

## 17. Plan de trabajo de 72 horas

### Fase 1: 0 a 12 horas

Objetivo: base funcional.

Tareas:

```txt
Crear repositorio
Definir estructura
Generar dataset sintético
Crear motor de reglas
Crear score inicial
Crear dashboard básico
Mostrar tabla de casos con semáforo
```

Resultado esperado:

```txt
Ya existe una demo mínima funcional.
```

---

### Fase 2: 12 a 24 horas

Objetivo: IA inicial.

Tareas:

```txt
Feature engineering
Entrenar RandomForestClassifier
Entrenar IsolationForest
Guardar modelos con joblib
Calcular score_modelo
Calcular score_anomalia
Unificar score final
Mostrar métricas
```

Resultado esperado:

```txt
Sistema ya usa modelos entrenados.
```

---

### Fase 3: 24 a 40 horas

Objetivo: diferenciadores.

Tareas:

```txt
Implementar NLP de narrativas
Calcular similitud textual
Agregar score_nlp
Crear grafo de relaciones
Crear ranking de proveedores
Crear ranking de ciudades
Mejorar detalle del siniestro
```

Resultado esperado:

```txt
Sistema ya muestra patrones complejos.
```

---

### Fase 4: 40 a 56 horas

Objetivo: agente y simulador.

Tareas:

```txt
Crear herramientas del agente
Crear agente consultivo
Agregar preguntas predefinidas
Implementar simulador de nuevo siniestro
Agregar reporte ejecutivo
Agregar feedback humano
```

Resultado esperado:

```txt
Sistema ya tiene demo avanzada.
```

---

### Fase 5: 56 a 72 horas

Objetivo: pulido y presentación.

Tareas:

```txt
Pulir UI
Preparar casos estrella
Crear modo jurado
Finalizar README
Finalizar documentación
Preparar pitch
Ensayar demo
Probar instalación desde cero
Preparar respuestas del jurado
```

Resultado esperado:

```txt
Proyecto listo para competir.
```

---

## 18. Repartición del equipo

### Persona 1: Datos + modelos

Responsable de:

```txt
Dataset sintético
Feature engineering
RandomForest
IsolationForest
Métricas
Exportación de datos procesados
```

### Persona 2: Scoring + agente

Responsable de:

```txt
Motor de reglas
Score final
Explicaciones
Herramientas del agente
Router de intención
Simulador de nuevo siniestro
```

### Persona 3: Dashboard + grafo + documentación

Responsable de:

```txt
Streamlit
Dashboard
Gráficos
Detalle de siniestro
Grafo de relaciones
README
Documentación
Pitch visual
```

---

## 19. Casos estrella para la demo

### Caso 1: rojo evidente

Características:

```txt
Siniestro ocurre 1 día después de iniciar póliza.
Monto reclamado es 98% de la suma asegurada.
Documentos inconsistentes.
Proveedor en lista restrictiva.
```

Mensaje:

> Este caso demuestra que el sistema identifica señales críticas claras.

---

### Caso 2: rojo no evidente

Características:

```txt
No activa muchas reglas simples.
Pero el modelo de anomalías lo marca.
El grafo muestra proveedor recurrente.
La narrativa es similar a otros reclamos.
```

Mensaje:

> Este caso demuestra que RastroSeguro detecta patrones que una revisión individual podría pasar por alto.

---

### Caso 3: amarillo ético

Características:

```txt
Tiene algunas señales de riesgo.
No hay evidencia suficiente para escalar a rojo.
Se recomienda revisión documental.
```

Mensaje:

> Este caso demuestra que el sistema no acusa automáticamente. Prioriza revisión humana.

---

### Caso 4: simulación en vivo

El jurado puede pedir:

```txt
Cree un siniestro ocurrido 24 horas después de iniciar la póliza, con monto alto y reporte tardío.
```

El sistema debe responder:

```txt
Score alto
Nivel rojo
Explicación por reglas
Comparación con casos similares
Acción sugerida
```

---

## 20. Pitch técnico sugerido

> RastroSeguro es un copiloto antifraude explicable para siniestros vehiculares. La solución analiza datos sintéticos de siniestros, pólizas, asegurados, vehículos, proveedores y documentos. A partir de esa información calcula un score de riesgo combinando reglas de negocio, machine learning supervisado, detección de anomalías, análisis de narrativas y grafos de relación. El agente de IA no responde solo con prompts: consulta herramientas auditables conectadas al pipeline de datos para explicar casos, encontrar patrones y generar reportes. La solución no acusa fraude ni rechaza reclamos; prioriza casos para revisión humana.

---

## 21. Respuestas preparadas para jurado

### ¿Qué modelo de IA usaron?

> Usamos un enfoque híbrido. Entrenamos un Random Forest con datos sintéticos etiquetados para estimar probabilidad de riesgo, usamos Isolation Forest para detectar anomalías, NLP para similitud de narrativas y un grafo de relaciones para encontrar concentración de riesgo entre actores. El agente consulta herramientas sobre estos resultados.

### ¿Por qué no usaron fine-tuning del LLM?

> Porque el objetivo no es que el LLM memorice casos, sino que consulte datos verificables. En fraude, la trazabilidad y la explicabilidad son más importantes que el estilo conversacional. Por eso entrenamos modelos específicos y usamos el agente como capa consultiva.

### ¿Cómo evitan acusar injustamente?

> El sistema habla de posible fraude o riesgo de revisión. Nunca confirma fraude ni rechaza automáticamente un siniestro. Toda alerta requiere análisis humano.

### ¿Qué pasa si el modelo se equivoca?

> El sistema muestra las razones del score y permite feedback del analista. Esa retroalimentación puede usarse para mejorar el modelo en futuras iteraciones.

### ¿Cómo validaron el modelo?

> Usamos datos sintéticos etiquetados con patrones controlados, separamos datos de entrenamiento y prueba, y medimos precision, recall, F1-score, matriz de confusión y AUC-ROC. Además, contrastamos el score con reglas explicables.

### ¿Cómo ayuda al negocio?

> Reduce el tiempo de priorización, permite revisar primero los casos más riesgosos, mejora la trazabilidad del análisis y puede ayudar a disminuir pérdidas por pagos indebidos sin reemplazar la decisión humana.

---

## 22. Principios éticos

RastroSeguro debe cumplir:

```txt
No usar datos personales reales.
No usar información confidencial.
Usar datos sintéticos o públicos.
No subir credenciales.
No exponer llaves de API.
No acusar fraude automáticamente.
Mantener revisión humana.
Explicar limitaciones.
Documentar posibles falsos positivos.
```

Mensaje final:

> La IA no decide. La IA alerta, explica y recomienda revisión.

---

## 23. Prioridad de implementación

### Debe estar sí o sí

```txt
Dataset sintético
Carga de dataset
Score de riesgo
Semáforo
Motor de reglas
Modelo ML
Dashboard
Detalle con explicación
README
Pitch
```

### Muy importante para destacar

```txt
NLP de narrativas similares
Grafo de relaciones
Agente con herramientas
Simulador de nuevo siniestro
Reporte ejecutivo
```

### Extra si sobra tiempo

```txt
Router de intención entrenado
Feedback humano
SHAP o importancia de variables
Exportación PDF
API con FastAPI
```

---

## 24. Roadmap futuro

Para una versión real en producción:

```txt
Integración con core de seguros.
Conexión a bases de datos internas.
Validación con analistas antifraude.
Reentrenamiento con feedback humano.
Monitoreo de drift del modelo.
Auditoría de decisiones.
Control de sesgos.
API para integración con sistemas existentes.
Alertas automáticas para unidades antifraude.
```

---

## 25. Resumen ejecutivo

RastroSeguro es una solución de IA explicable que ayuda a priorizar siniestros con señales de posible fraude. Combina reglas de negocio, modelos entrenados, anomalías, NLP, grafos de relación y un agente consultivo conectado a herramientas. El sistema genera un score de riesgo, clasifica los casos por semáforo, explica las alertas y permite simular nuevos siniestros. Su enfoque mantiene revisión humana, evita acusaciones automáticas y entrega valor operativo para analistas, auditoría y gerencia.
