# Justin — Implementación actual de UI

## Objetivo de la interfaz

La UI actual de RastroSeguro está planteada como una **presentación interactiva tipo slides** para explicar un análisis preliminar de riesgo sobre un siniestro.

El foco ya no es un dashboard grande con muchas pantallas, sino un flujo compacto:

```txt
1. Cargar información del siniestro
2. Resumir el caso cargado
3. Mostrar análisis IA + score de riesgo
```

El mensaje central de la interfaz es:

> RastroSeguro no confirma fraude ni rechaza reclamos. Solo estima señales de riesgo para priorizar revisión humana.

---

## Stack usado

```txt
Python
Streamlit
Pandas
CSS embebido en Streamlit
Datos mock en CSV / DataFrame
```

Archivos principales:

```txt
app/main.py
app/components/layout.py
app/components/data.py
app/bootstrap.py
.streamlit/config.toml
requirements.txt
```

---

## Flujo visual actual

La aplicación principal vive en:

```txt
app/main.py
```

Actualmente usa `st.session_state` para controlar el slide activo:

```txt
st.session_state.slide
```

Slides definidos:

```python
slides = [
    "Carga de información",
    "Resumen del caso",
    "Análisis IA",
]
```

La navegación se hace con:

```txt
Anterior
Siguiente
```

Además hay una barra superior de progreso visual con:

```txt
Paso 1: Carga de información
Paso 2: Resumen del caso
Paso 3: Análisis IA
```

Cada paso puede estar en estado:

```txt
Actual
Listo
Pendiente
```

---

## Slide 1 — Carga de información

Objetivo:

```txt
Recibir o seleccionar la información del siniestro que se va a analizar.
```

Elementos actuales:

- Selector de fuente:
  - Caso demo
  - Subir archivo
- Selector de siniestro demo.
- `st.file_uploader` para carga de archivo CSV.
- Mensaje de confirmación:

```txt
Información recibida para análisis preliminar.
```

Texto guía:

```txt
Se recibe información del siniestro, se valida estructura y se prepara para scoring.
```

Este paso no acusa ni interpreta fraude. Solo prepara los datos.

---

## Slide 2 — Resumen del caso cargado

Objetivo:

```txt
Mostrar una ficha clara del siniestro antes del análisis IA.
```

Métricas visibles:

- ID del siniestro.
- Ramo.
- Monto reclamado.
- Suma asegurada.
- Ciudad.
- Proveedor.
- Cobertura.

También se muestra:

- Estado documental.
- Descripción resumida / explicación preliminar.

La intención es que el jurado entienda rápidamente:

```txt
Qué información entró al sistema.
```

---

## Slide 3 — Análisis IA y score de riesgo

Objetivo:

```txt
Mostrar el resultado del análisis IA de forma visual y explicable.
```

Elementos principales:

- Score grande de 1 a 100.
- Semáforo de nivel de riesgo.
- Barra de progreso del score.
- Acción sugerida.
- Razones principales.
- Desglose de score por componente.
- Resumen para presentación.

Componentes del score:

```txt
Reglas
Modelo ML
Anomalías
NLP
Grafo
Categórico
```

Ejemplo de salida:

```txt
87/100
Nivel: Rojo
Acción sugerida: Escalar a revisión antifraude especializada.
```

Importante:

```txt
El score no confirma fraude. Prioriza revisión humana.
```

---

## Asistente IA flotante

En el slide 3 existe un asistente contextual de IA.

Estado oculto:

```txt
Bolita flotante inferior centrada
```

Estado activo:

```txt
Cuadro flotante de conversación IA sobre la bolita
```

La visibilidad se controla con:

```txt
st.session_state.show_chat
```

Botón flotante:

```txt
key="chat_bubble_toggle"
```

Panel flotante:

```txt
key="chat_panel"
```

El asistente permite:

- Ver historial de conversación.
- Escribir una pregunta.
- Usar preguntas rápidas.
- Enviar con botón `↑`.
- Recibir respuestas contextuales del siniestro seleccionado.

Preguntas rápidas actuales:

```txt
¿Por qué este caso tiene ese score?
¿Qué alerta pesa más?
¿Qué debería revisar el analista?
```

Las respuestas mock usan:

- ID del siniestro.
- Score final.
- Alertas activadas.
- Proveedor.
- Monto reclamado.
- Acción sugerida.

---

## Estado de sesión usado

La UI usa `st.session_state` para mantener interacción:

```txt
slide
selected_claim_id
chat_messages
show_chat
```

Uso:

- `slide`: controla la diapositiva actual.
- `selected_claim_id`: mantiene el caso seleccionado.
- `chat_messages`: guarda historial del asistente.
- `show_chat`: abre o cierra el chat flotante.

---

## Datos actuales

Los datos mock están en:

```txt
app/components/data.py
```

El loader principal es:

```python
load_claims()
```

Si existe CSV, carga:

```txt
data/synthetic/mock_siniestros_scored.csv
```

Si no existe, genera un DataFrame mock con casos como:

```txt
SIN-0045
SIN-0112
SIN-0201
SIN-0330
SIN-0418
SIN-0502
```

Columnas relevantes:

```txt
id_siniestro
ramo
cobertura
ciudad
id_proveedor
monto_reclamado
suma_asegurada
score_reglas
score_modelo
score_anomalia
score_nlp
score_grafo
score_categorico
score_final
nivel_riesgo
alertas_activadas
explicacion
accion_sugerida
```

---

## Estilos visuales

Los estilos están concentrados en:

```txt
app/components/layout.py
```

Componentes visuales:

- Header de página.
- Badges de riesgo.
- Tarjetas `wireframe_box`.
- Progreso de pasos.
- Estilos de slide.
- Score grande.
- Chat flotante.
- Bolita flotante del asistente.

Clases CSS principales:

```txt
rs-header
rs-title
rs-subtitle
rs-badge
rs-panel
rs-slide-kicker
rs-slide-title
rs-slide-subtitle
rs-progress-track
rs-progress-fill
rs-step-pill
rs-score
rs-floating-chat
st-key-chat_bubble_toggle
st-key-chat_panel
```

---

## Sidebar actual

El sidebar se mantiene simple.

Muestra:

```txt
RastroSeguro
Evaluador preliminar de riesgo
```

Flujo:

```txt
1. Cargar información
2. Resumir el caso
3. Calcular score IA
```

Principio ético:

```txt
La IA alerta y explica.
No acusa ni rechaza reclamos.
```

---

## Cómo ejecutar

Desde la raíz del proyecto:

```bash
.venv/bin/streamlit run app/main.py
```

Si no existe el entorno virtual:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/streamlit run app/main.py
```

---

## Decisión actual de diseño

La UI actual se decidió como:

```txt
Evaluador de siniestro tipo presentación
```

No como:

```txt
Dashboard administrativo completo
```

Razón:

- Es más claro para una demo.
- Reduce el ruido visual.
- Mantiene el foco en el caso evaluado.
- Explica el score antes que mostrar demasiadas tablas.
- Se alinea mejor con una presentación corta ante jurado.

---

## Pendientes recomendados

1. Conectar el upload real con el pipeline de datos.
2. Reemplazar respuestas mock del asistente por tools de Jeremy:

```python
explain_claim(id_siniestro)
simulate_new_claim(claim_data)
get_provider_risk_ranking()
generate_executive_summary()
```

3. Agregar visualización simple de evidencia si el CSV trae documentos.
4. Preparar 2 o 3 casos estrella para demo:

```txt
Rojo evidente
Rojo no evidente
Amarillo ético
```

5. Pulir colores finales y espaciado según identidad visual del pitch.

