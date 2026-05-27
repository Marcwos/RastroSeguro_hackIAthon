"""Evaluación de riesgo del siniestro — presentación concisa."""

import html
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bootstrap  # noqa: F401

import streamlit as st

from app.components.data import ensure_mock_csv, load_claims
from app.components.layout import page_header, risk_badge, sidebar_branding, wireframe_box

st.set_page_config(
    page_title="RastroSeguro",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

ensure_mock_csv()

df = load_claims()

if "slide" not in st.session_state:
    st.session_state.slide = 0
if "selected_claim_id" not in st.session_state:
    st.session_state.selected_claim_id = df.sort_values("score_final", ascending=False)[
        "id_siniestro"
    ].iloc[0]
if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = []
if "show_chat" not in st.session_state:
    st.session_state.show_chat = False

slides = [
    "Carga de información",
    "Resumen del caso",
    "Análisis IA",
]
current_slide = st.session_state.slide
progress_percent = int(((current_slide + 1) / len(slides)) * 100)

sidebar_branding(active_step=current_slide)

page_header(
    "Analytical Trust",
    "RastroSeguro",
    "Un flujo de presentación para cargar un siniestro, resumir su evidencia y explicar el score IA antes de cualquier decisión humana.",
)

st.markdown(
    f"""
    <div class="rs-top-track">
        <div class="rs-top-track-fill" style="width:{progress_percent}%;">
            <div class="rs-top-track-dot"></div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    """
    <div class="rs-ethic-note">
        La IA alerta y explica patrones de riesgo. No confirma fraude, no acusa y no rechaza reclamos:
        prioriza casos para revisión humana trazable.
    </div>
    """,
    unsafe_allow_html=True,
)

step_labels = []
for index, label in enumerate(slides):
    state = "Activo" if index == current_slide else "Validado" if index < current_slide else "Pendiente"
    state_class = "is-active" if index == current_slide else "is-complete" if index < current_slide else ""
    step_labels.append(
        f"<span class='rs-step-pill {state_class}'>Paso {index + 1}: {html.escape(label)} · {state}</span>"
    )

st.markdown(
    f"""
    <div>
        {''.join(step_labels)}
        <div class="rs-progress-track">
            <div class="rs-progress-fill" style="width:{progress_percent}%"></div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

claim = df[df["id_siniestro"] == st.session_state.selected_claim_id].iloc[0]
alertas = [item for item in str(claim["alertas_activadas"]).split("|") if item]


def money(value: float) -> str:
    return f"${int(value):,}"


def tile(title: str, value: str, hint: str = "") -> None:
    st.markdown(
        f"""
        <div class="rs-grid-card">
            <div class="rs-card-copy">{html.escape(title)}</div>
            <div class="rs-card-title">{html.escape(value)}</div>
            {f'<div class="rs-card-copy">{html.escape(hint)}</div>' if hint else ''}
        </div>
        """,
        unsafe_allow_html=True,
    )


def factor_row(label: str, value: float) -> None:
    safe_value = max(0, min(100, int(value)))
    st.markdown(
        f"""
        <div class="rs-factor-row">
            <div class="rs-factor-top">
                <span>{html.escape(label)}</span>
                <span>{safe_value}/100</span>
            </div>
            <div class="rs-factor-track">
                <div class="rs-factor-fill" style="width:{safe_value}%"></div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def answer_chat_question(question: str) -> str:
    if "alerta" in question.lower():
        return (
            f"La alerta más visible es: {alertas[0] if alertas else 'sin alerta crítica'}. "
            f"Debe revisarse junto con el score final de {int(claim['score_final'])}/100."
        )
    if "revis" in question.lower() or "analista" in question.lower():
        return (
            f"El analista debería validar documentos, proveedor {claim['id_proveedor']} "
            f"y consistencia del monto reclamado (${int(claim['monto_reclamado']):,})."
        )
    return (
        f"El caso {claim['id_siniestro']} obtuvo {int(claim['score_final'])}/100 "
        f"por sus señales activadas: {', '.join(alertas) if alertas else 'sin alertas fuertes'}. "
        "Esto prioriza revisión humana, no confirma fraude."
    )

if current_slide == 0:
    with st.container(border=True):
        st.markdown(
            """
            <div class="rs-slide-kicker">Paso 1 de 3 · Intake</div>
            <div class="rs-slide-title">Carga de información</div>
            <div class="rs-slide-subtitle">
            El siniestro entra al sistema como evidencia preliminar. La interfaz separa carga,
            validación y preparación del pipeline para que el jurado entienda el inicio del flujo.
            </div>
            """,
            unsafe_allow_html=True,
        )
        left, right = st.columns([1.12, 0.88], gap="large")
        with left:
            st.markdown(
                """
                <div class="rs-upload-visual">
                    <div class="rs-upload-icon">+</div>
                    <div class="rs-card-title">Dataset o caso individual</div>
                    <div class="rs-card-copy">
                        Carga CSV de siniestros o usa un caso demo para activar la narrativa de presentación.
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            source = st.radio(
                "Fuente del caso",
                ["Caso demo", "Subir archivo"],
                horizontal=True,
            )
            if source == "Subir archivo":
                st.file_uploader("Información del siniestro", type=["csv"])
                st.caption("Boceto: se validan columnas, tipos y campos mínimos antes de ejecutar el pipeline.")
            else:
                sorted_claims = df.sort_values("score_final", ascending=False)[
                    "id_siniestro"
                ].tolist()
                st.session_state.selected_claim_id = st.selectbox(
                    "Selecciona un siniestro demo",
                    sorted_claims,
                    index=sorted_claims.index(st.session_state.selected_claim_id),
                )
            st.markdown(
                """
                <div class="rs-pill-row">
                    <span class="rs-mini-pill">Schema validado</span>
                    <span class="rs-mini-pill">Evidencia normalizada</span>
                    <span class="rs-mini-pill">Listo para score IA</span>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with right:
            st.markdown(
                """
                <div class="rs-glass-card">
                    <div class="rs-card-title">Pipeline visible para el jurado</div>
                    <div class="rs-card-copy">
                        La pantalla muestra que el caso todavía no es fraude: solo queda preparado para análisis.
                    </div>
                    <div class="rs-status-row">
                        <span class="rs-status-label">Entrada</span>
                        <span class="rs-status-value">Recibida</span>
                    </div>
                    <div class="rs-status-row">
                        <span class="rs-status-label">Validación</span>
                        <span class="rs-status-value">Sin bloqueo</span>
                    </div>
                    <div class="rs-status-row">
                        <span class="rs-status-label">Siguiente paso</span>
                        <span class="rs-status-value">Resumen trazable</span>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            wireframe_box(
                "Principio de la demo",
                "El usuario ve una entrada limpia, sin saturación de tablas, y avanza a una ficha clara del caso.",
            )

if current_slide == 1:
    with st.container(border=True):
        st.markdown(
            """
            <div class="rs-slide-kicker">Paso 2 de 3 · Case summary</div>
            <div class="rs-slide-title">Resumen del caso cargado</div>
            <div class="rs-slide-subtitle">
            Antes del score se presenta una ficha ejecutiva: monto, ramo, proveedor, cobertura y señales
            documentales. Esta pantalla corresponde al resumen visual de Stitch.
            </div>
            """,
            unsafe_allow_html=True,
        )
        left, right = st.columns([1.08, 0.92], gap="large")
        with left:
            s1, s2 = st.columns(2, gap="medium")
            with s1:
                tile("Siniestro", str(claim["id_siniestro"]), "Identificador del caso")
            with s2:
                tile("Ramo", str(claim["ramo"]).title(), f"Cobertura: {claim['cobertura']}")
            s3, s4 = st.columns(2, gap="medium")
            with s3:
                tile("Monto reclamado", money(claim["monto_reclamado"]), "Valor reportado")
            with s4:
                tile("Suma asegurada", money(claim["suma_asegurada"]), "Límite de referencia")
            s5, s6 = st.columns(2, gap="medium")
            with s5:
                tile("Ciudad", str(claim["ciudad"]), "Origen operativo")
            with s6:
                tile("Proveedor", str(claim["id_proveedor"]), "Actor relacionado")
        with right:
            docs_status = (
                "Inconsistentes"
                if "Documentos" in str(claim["alertas_activadas"])
                else "Sin alerta crítica"
            )
            st.markdown(
                f"""
                <div class="rs-glass-card">
                    <div class="rs-card-title">Lectura preliminar</div>
                    <div class="rs-card-copy">{html.escape(str(claim["explicacion"]))}</div>
                    <div class="rs-status-row">
                        <span class="rs-status-label">Estado documental</span>
                        <span class="rs-status-value">{html.escape(docs_status)}</span>
                    </div>
                    <div class="rs-status-row">
                        <span class="rs-status-label">Revisión humana</span>
                        <span class="rs-status-value">Obligatoria</span>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            if alertas:
                pills = "".join(
                    f"<span class='rs-mini-pill'>{html.escape(alerta)}</span>"
                    for alerta in alertas[:5]
                )
                st.markdown(f"<div class='rs-pill-row'>{pills}</div>", unsafe_allow_html=True)
            else:
                st.markdown(
                    "<div class='rs-pill-row'><span class='rs-mini-pill'>Sin alertas fuertes</span></div>",
                    unsafe_allow_html=True,
                )

if current_slide == 2:
    with st.container(border=True):
        st.markdown(
            """
            <div class="rs-slide-kicker">Paso 3 de 3 · AI recommendation</div>
            <div class="rs-slide-title">Análisis IA y score de riesgo</div>
            <div class="rs-slide-subtitle">
            El sistema estima un score 1-100, muestra sus componentes y ofrece una explicación accionable.
            El resultado se presenta como recomendación, no como veredicto.
            </div>
            """,
            unsafe_allow_html=True,
        )
        score_col, reasons_col = st.columns([0.9, 1.1], gap="large")
        with score_col:
            score = int(claim["score_final"])
            risk_color = "#f43f5e" if claim["nivel_riesgo"] == "Rojo" else "#f59e0b" if claim["nivel_riesgo"] == "Amarillo" else "#10b981"
            st.markdown(
                f"""
                <div class="rs-risk-gauge" style="--score-deg:{score * 3.6}deg;--risk-color:{risk_color};">
                    <div class="rs-risk-gauge-inner">
                        <div>
                            <div class="rs-score">{score}</div>
                            <div class="rs-score-label">/100</div>
                        </div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            st.markdown(risk_badge(claim["nivel_riesgo"]), unsafe_allow_html=True)
            st.markdown("**Acción sugerida**")
            wireframe_box("Recomendación IA", claim["accion_sugerida"])
            st.markdown("<div class='rs-score-label'>Score preliminar de posible fraude.</div>", unsafe_allow_html=True)
        with reasons_col:
            st.markdown("<div class='rs-card-title'>Razones principales</div>", unsafe_allow_html=True)
            if alertas:
                for alerta in alertas[:5]:
                    st.markdown(
                        f"""
                        <div class="rs-status-row">
                            <span class="rs-status-label">{html.escape(alerta)}</span>
                            <span class="rs-status-value">Señal activa</span>
                        </div>
                        """,
                        unsafe_allow_html=True,
                    )
            else:
                wireframe_box("Señales", "No se detectaron señales relevantes en el caso demo.")
            wireframe_box("Explicación", claim["explicacion"])

        st.divider()
        components_col, summary_col = st.columns([1, 1], gap="large")
        with components_col:
            st.markdown("<div class='rs-card-title'>Cómo se forma el score</div>", unsafe_allow_html=True)
            for label, value in [
                ("Reglas", claim["score_reglas"]),
                ("Modelo ML", claim["score_modelo"]),
                ("Anomalías", claim["score_anomalia"]),
                ("NLP", claim["score_nlp"]),
                ("Grafo", claim["score_grafo"]),
                ("Categórico", claim["score_categorico"]),
            ]:
                factor_row(label, value)
        with summary_col:
            st.markdown(
                f"""
                <div class="rs-glass-card">
                    <div class="rs-card-title">Resumen para presentación</div>
                    <div class="rs-status-row">
                        <span class="rs-status-label">Caso evaluado</span>
                        <span class="rs-status-value">{html.escape(str(claim['id_siniestro']))}</span>
                    </div>
                    <div class="rs-status-row">
                        <span class="rs-status-label">Resultado</span>
                        <span class="rs-status-value">{score}/100 · {html.escape(str(claim['nivel_riesgo']))}</span>
                    </div>
                    <div class="rs-card-copy" style="margin-top:1rem;">
                        El caso debe pasar a {html.escape(str(claim['accion_sugerida']).lower())}
                        Este resultado es una alerta explicable, no una acusación formal.
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            with st.container(key="always_chat_panel"):
                st.markdown(
                    """
                    <div class="rs-chat-title">Pregúntale al analisis</div>
                    """,
                    unsafe_allow_html=True,
                )
                for message in st.session_state.chat_messages[-4:]:
                    with st.chat_message(message["role"]):
                        st.write(message["content"])

                chat_prompt = st.text_area(
                    "Pregunta",
                    placeholder="Pregunta por qué el caso obtuvo ese score, qué alertas activó o qué acción se recomienda...",
                    height=76,
                    label_visibility="collapsed",
                )
                quick_col, send_col = st.columns([1, 0.25])
                with quick_col:
                    quick_question = st.selectbox(
                        "Pregunta rápida",
                        [
                            "¿Por qué este caso tiene ese score?",
                            "¿Qué alerta pesa más?",
                            "¿Qué debería revisar el analista?",
                            "¿Why this is flagged?",
                        ],
                        label_visibility="collapsed",
                    )
                with send_col:
                    send_clicked = st.button("↑", width="stretch")

                if send_clicked:
                    question = chat_prompt.strip() or quick_question
                    st.session_state.chat_messages.append({"role": "user", "content": question})
                    st.session_state.chat_messages.append(
                        {"role": "assistant", "content": answer_chat_question(question)}
                    )
                    st.rerun()

st.divider()
nav_left, nav_middle, nav_right = st.columns([1, 2, 1])
with nav_left:
    if st.button("Anterior", disabled=current_slide == 0, width="stretch"):
        st.session_state.slide = max(0, current_slide - 1)
        st.rerun()
with nav_middle:
    st.caption(f"Diapositiva {current_slide + 1} de {len(slides)}: {slides[current_slide]}")
with nav_right:
    if st.button("Siguiente", disabled=current_slide == len(slides) - 1, width="stretch"):
        st.session_state.slide = min(len(slides) - 1, current_slide + 1)
        st.rerun()
