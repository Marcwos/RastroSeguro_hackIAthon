"""RastroSeguro: Evaluación de riesgo neuronal del siniestro."""

import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import streamlit as st
import folium
from streamlit_folium import st_folium

from app.components.data import ensure_mock_csv, load_claims, read_uploaded_claims_file
from app.components.layout import (
    inject_base_styles,
    top_app_bar,
    bottom_nav_bar,
    ai_fab,
    slide_header,
    expediente_header,
    metric_field,
    narrative_card,
    document_list,
    drop_zone_placeholder,
    score_component_card,
    risk_alert,
    risk_pills,
    disclaimer,
    sidebar_branding,
    prep_card
)
from src.agent.antifraud_agent import answer_question
from src.agent.quick_questions import get_quick_questions
from src.simulator.simulate_claim import simulate_new_claim

# --- App Config ---
st.set_page_config(
    page_title="RastroSeguro | Expert Intelligence",
    page_icon="🛡️",
    layout="wide", # Standardized for Stitch Split View
    initial_sidebar_state="expanded",
)

# Initialize Data
ensure_mock_csv()
df = load_claims()

# Session State
if "slide" not in st.session_state:
    st.session_state.slide = 0
if "selected_claim_id" not in st.session_state:
    st.session_state.selected_claim_id = df.sort_values("score_final", ascending=False)["id_siniestro"].iloc[0]
if "chat_messages" not in st.session_state:
    st.session_state.chat_messages = []
if "show_chat" not in st.session_state:
    st.session_state.show_chat = False
if "sidebar_visible" not in st.session_state:
    st.session_state.sidebar_visible = True

# Constants
SLIDES = ["Carga de información", "Resumen del caso", "Análisis IA"]
CURRENT_SLIDE = st.session_state.slide
REQUIRED_UPLOAD_COLUMNS = [
    "id_siniestro", "ramo", "cobertura", "ciudad", "id_proveedor",
    "monto_reclamado", "suma_asegurada", "descripcion",
]

# --- Helpers ---

def render_agent_response(response: dict) -> str:
    """Render the tool-backed agent envelope into readable chat content."""
    base = response.get("message", "No pude procesar la consulta en este momento.")
    if not response.get("ok", False):
        hint = response.get("hint")
        return f"{base}\n\nSiguiente paso sugerido: {hint}" if hint else base
    data = response.get("data")
    source = response.get("source", "agent")
    if isinstance(data, list):
        return f"{base}\n\nFuente: {source}. Registros relevantes: {len(data)}."
    if isinstance(data, dict):
        preview = ", ".join(str(k) for k in list(data.keys())[:6])
        return f"{base}\n\nFuente: {source}. Campos disponibles: {preview}."
    if isinstance(data, str):
        return f"{base}\n\n{data}"
    return base

# --- Layout Rendering ---
inject_base_styles()
sidebar_toggle_label = "×" if st.session_state.sidebar_visible else "☰"
if st.button(
    sidebar_toggle_label,
    key="sidebar_toggle_btn",
    help="Abrir/cerrar menú lateral",
):
    st.session_state.sidebar_visible = not st.session_state.sidebar_visible
    st.rerun()

if st.session_state.sidebar_visible:
    st.markdown('<span class="rs-sidebar-open-marker"></span>', unsafe_allow_html=True)

sidebar_branding(active_step=CURRENT_SLIDE, visible=st.session_state.sidebar_visible)
top_app_bar(current_step=CURRENT_SLIDE)

# Get current claim data
claim = df[df["id_siniestro"] == st.session_state.selected_claim_id].iloc[0]

# --- Main Content ---

if CURRENT_SLIDE == 0:
    # Slide 0: Carga (Fixed Background Overlay)
    st.markdown("""
    <div class="rs-split-bg">
        <div class="rs-split-bg-left"></div>
        <div class="rs-split-bg-right" style="background:#19191b;"></div>
    </div>
    """, unsafe_allow_html=True)
    
    with st.container(key="slide_0_content"):
        # Single row with two columns for content alignment
        c1, c2 = st.columns(2, gap="small")
        
        with c1:
            st.markdown("""
            <div class="rs-panel-left-content">
                <span class="rs-kicker">MÓDULO DE INGRESO</span>
                <h1 class="rs-slide-title" style="font-size:2.5rem; margin-bottom:1.5rem;">
                    Paso 1: Carga de información del siniestro
                </h1>
                <p class="rs-slide-subtitle" style="margin-bottom:2.5rem; opacity:0.8;">
                    Requerimos el set de datos crudos del incidente. Nuestro motor de IA procesará variables demográficas
                    para generar un scoring de riesgo en tiempo real.
                </p>
                <div class="rs-glass-card-validation">
                    <div class="rs-glass-icon-circle">
                        <span class="material-symbols-outlined">verified_user</span>
                    </div>
                    <div>
                        <div style="font-weight:700; color:var(--rs-on-surface); margin-bottom:0.25rem;">Validación de Estructura</div>
                        <div style="font-size:0.85rem; color:var(--rs-on-muted); line-height:1.4;">Se valida estructura y se prepara para scoring automático.</div>
                    </div>
                </div>
            """, unsafe_allow_html=True)

        with c2:
            st.markdown(
                '<div class="rs-metric-label" style="margin-bottom:0.75rem; text-align:left; color:var(--rs-outline);">SELECCIONAR CASO DE PRUEBA</div>',
                unsafe_allow_html=True,
            )
            sorted_claims = df.sort_values("score_final", ascending=False)["id_siniestro"].tolist()
            new_selection = st.selectbox(
                "Siniestro demo", sorted_claims,
                index=sorted_claims.index(st.session_state.selected_claim_id),
                label_visibility="collapsed"
            )
            if new_selection != st.session_state.selected_claim_id:
                st.session_state.selected_claim_id = new_selection
                st.rerun()
            
            # Custom styled uploader container
            with st.container(key="upload_drop_zone"):
                st.markdown("""
                <div style="text-align:center; padding: 2rem 0;">
                    <div class="rs-drop-icon" style="margin: 0 auto 1.5rem; background:rgba(255,255,255,0.05); width:80px; height:80px; border-radius:100%; display:flex; align-items:center; justify-content:center;">
                        <span class="material-symbols-outlined" style="font-size:2.5rem; color:var(--rs-secondary);">cloud_upload</span>
                    </div>
                    <div style="font-weight:700; font-size:1.2rem; color:var(--rs-on-surface); margin-bottom:0.5rem;">Subir archivo CSV o Excel</div>
                    <div style="font-size:0.85rem; color:var(--rs-on-muted); margin-bottom:2rem;">Arrastra y suelta o haz clic para buscar</div>
                </div>
                """, unsafe_allow_html=True)
                uploaded_file = st.file_uploader("Upload", type=["csv", "xlsx"], label_visibility="collapsed", key="claims_upload_file")

            if uploaded_file is not None:
                st.success(f"Recibido: {uploaded_file.name}")
                
            st.markdown('<p style="font-size:0.7rem; color:var(--rs-on-muted); text-align:center; margin-top:1rem; font-style:italic; opacity:0.6;">Formatos: .csv, .xlsx. Procesamiento: ~4 seg x 1k registros.</p>', unsafe_allow_html=True)

elif CURRENT_SLIDE == 1:
    # Slide 1: Resumen (Bento Grid)
    st.markdown('<div class="rs-slide-enter">', unsafe_allow_html=True)
    slide_header("Case Analysis Summary", "Resumen del caso cargado", "Confirme los datos extraídos y las evidencias detectadas.")
    
    col_main, col_side = st.columns([8, 4], gap="medium")
    with col_main:
        with st.container(key="main_data_card"):
            st.markdown('<div class="rs-bento-card">', unsafe_allow_html=True)
            expediente_header(st.session_state.selected_claim_id)
            m1, m2, m3, m4 = st.columns(4)
            with m1: metric_field("Ramo", str(claim["ramo"]).title())
            with m2: metric_field("Monto", f"${int(claim['monto_reclamado']):,} USD", highlight=True)
            with m3: metric_field("Cobertura", claim["cobertura"])
            with m4: metric_field("Ciudad", claim["ciudad"])
            st.markdown("<br>", unsafe_allow_html=True)
            narrative_card(claim["explicacion"] if "explicacion" in claim else "Narrativa pendiente de procesamiento.")
            st.markdown('</div>', unsafe_allow_html=True)
            
        st.markdown("<br>", unsafe_allow_html=True)
        s_left, s_right = st.columns(2, gap="medium")
        with s_left:
            m = folium.Map(location=[6.2442, -75.5812], zoom_start=13, tiles="cartodb dark_matter")
            folium.Marker([6.2442, -75.5812], popup="Ubicación").add_to(m)
            st.markdown('<div class="rs-location-card">', unsafe_allow_html=True)
            st_folium(m, height=200, use_container_width=True, key="map_container")
            st.markdown(f'<div class="rs-location-overlay"><div class="rs-location-label"><span class="material-symbols-outlined">location_on</span><span>Ubicación Confirmada</span></div><div class="rs-location-value">{claim["ciudad"]}, Antioquia</div></div></div>', unsafe_allow_html=True)
        with s_right:
            prep_card(variables_count=int(claim['score_reglas']) // 5 + 10)
            st.markdown("<br><div class=\"rs-bento-card-dark\" style=\"opacity:0.8; height:100px; display:flex; flex-direction:column; justify-content:center;\"><div style=\"font-size:0.7rem;font-weight:700;color:var(--rs-secondary);text-transform:uppercase;margin-bottom:0.25rem;\">Meta-data Audit</div><div style=\"font-size:0.85rem;color:var(--rs-on-muted);\">Consistencia detectada entre narrativa y telemetría.</div></div>", unsafe_allow_html=True)
            
    with col_side:
        with st.container(key="doc_card"):
            st.markdown('<div class="rs-bento-card-high">', unsafe_allow_html=True)
            document_list([{"name": "Declaración.pdf", "icon": "picture_as_pdf"}, {"name": "Evidencia_Daños.jpg", "icon": "image"}, {"name": "Telemetría_GPS.log", "icon": "location_on"}])
            st.markdown('</div>', unsafe_allow_html=True)
        drop_zone_placeholder()
    st.markdown('</div>', unsafe_allow_html=True)

elif CURRENT_SLIDE == 2:
    # Slide 2: Análisis IA (Hero + Grid)
    st.markdown('<div class="rs-slide-enter">', unsafe_allow_html=True)
    slide_header("Predictive Risk Matrix", "Análisis IA y Score de Riesgo", "Análisis neuronal para asignar nivel de riesgo auditable.")
    
    score = int(claim["score_final"])
    risk_color = "#ef4444" if claim["nivel_riesgo"] == "Rojo" else "#f59e0b" if claim["nivel_riesgo"] == "Amarillo" else "#10b981"
    
    col_hero_map, col_hero_txt = st.columns([5, 7], gap="large")
    with col_hero_map:
        st.markdown(f'<div class="rs-risk-gauge" style="--score-deg:{score * 3.6}deg;--risk-color:{risk_color};"><div class="rs-risk-gauge-inner"><div style="text-align:center;"><div class="rs-score-big" style="color:{risk_color};">{score}</div><div class="rs-score-sublabel">/ 100 Riesgo</div></div></div></div>', unsafe_allow_html=True)
    with col_hero_txt:
        risk_alert(claim["nivel_riesgo"], claim["accion_sugerida"])
        risk_pills(claim["nivel_riesgo"])
        
    st.markdown("<br>", unsafe_allow_html=True)
    g1, g2, g3 = st.columns(3); g4, g5, g6 = st.columns(3)
    with g1: score_component_card("rule", "Reglas", int(claim["score_reglas"]), "Incumplimiento de reglas.", int(claim["score_reglas"]), severity="critical" if claim["score_reglas"] > 15 else "moderate")
    with g2: score_component_card("hub", "Modelo ML", int(claim["score_modelo"]), "Comportamiento inusual.", int(claim["score_modelo"]), severity="critical" if claim["score_modelo"] > 15 else "moderate")
    with g3: score_component_card("warning", "Anomalías", int(claim["score_anomalia"]), "Outliers en datos.", int(claim["score_anomalia"]), severity="moderate")
    with g4: score_component_card("description", "NLP", int(claim["score_nlp"]), "Patrones de texto sospechosos.", int(claim["score_nlp"]), severity="moderate")
    with g5: score_component_card("account_tree", "Grafo", int(claim["score_grafo"]), "Conexión con entidades de riesgo.", int(claim["score_grafo"]), severity="critical" if claim["score_grafo"] > 10 else "moderate")
    with g6: score_component_card("category", "Categórico", int(claim["score_categorico"]), "Antigüedad del cliente.", int(claim["score_categorico"]), severity="low")
    disclaimer()

    with st.expander("Simular nuevo siniestro (MVP)", expanded=False):
        st.caption("Ejecuta el simulador sin persistir datos.")
        s1, s2 = st.columns(2)
        with s1: 
            s_ramo = st.text_input("Ramo", value=str(claim.get("ramo", "")))
            s_cob = st.text_input("Cobertura", value=str(claim.get("cobertura", "")))
        with s2:
            s_monto = st.number_input("Monto", value=float(claim.get("monto_reclamado", 0)))
            s_suma = st.number_input("Suma", value=float(claim.get("suma_asegurada", 0)))
        s_desc = st.text_area("Descripción", value=str(claim.get("explicacion", "")))
        if st.button("Simular score en tiempo real", key="sim_btn"):
            try:
                sim_data = claim.to_dict(); sim_data.update({"id_siniestro":"SIM","ramo":s_ramo,"cobertura":s_cob,"monto_reclamado":s_monto,"suma_asegurada":s_suma,"descripcion":s_desc})
                res = simulate_new_claim(sim_data)
                st.success(f"Resultado: {res['score_final']}/100 · {res['nivel_riesgo']}")
            except Exception as e: st.error(f"Error: {e}")
    st.markdown('</div>', unsafe_allow_html=True)

# --- Navigation & AI ---
st.markdown('<div class="rs-fab-container">', unsafe_allow_html=True)
if st.button("✨", key="ai_fab_btn"):
    st.session_state.show_chat = not st.session_state.show_chat
    st.rerun()
st.markdown('</div>', unsafe_allow_html=True)

if st.session_state.show_chat:
    with st.container(key="ai_chat_panel"):
        st.markdown('<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;border-bottom:1px solid var(--rs-outline);padding-bottom:0.5rem;"><div style="background:rgba(5, 102, 217, 0.15);padding:4px;border-radius:6px;display:flex;align-items:center;"><span class="material-symbols-outlined" style="font-size:1.1rem;color:var(--rs-secondary);">spark</span></div><div class="rs-chat-title">RastroSeguro AI</div></div>', unsafe_allow_html=True)
        for msg in st.session_state.chat_messages:
            with st.chat_message(msg["role"]): st.write(msg["content"])
        
        q_questions = get_quick_questions()
        s_q = st.selectbox("Pregunta rápida", q_questions, key="qq")
        if st.button("Enviar rápida", key="seq"):
            st.session_state.chat_messages.append({"role": "user", "content": s_q})
            r = answer_question(f"{s_q} ({st.session_state.selected_claim_id})")
            st.session_state.chat_messages.append({"role": "assistant", "content": render_agent_response(r)})
            st.rerun()

        if prompt := st.chat_input("Escriba su duda..."):
            st.session_state.chat_messages.append({"role": "user", "content": prompt})
            r = answer_question(f"{prompt} ({st.session_state.selected_claim_id})")
            st.session_state.chat_messages.append({"role": "assistant", "content": render_agent_response(r)})
            st.rerun()

bottom_nav_bar(current_step=CURRENT_SLIDE)
if st.button("⬅️ Anterior", disabled=CURRENT_SLIDE == 0, key="nav_prev"):
    st.session_state.slide = max(0, CURRENT_SLIDE - 1); st.rerun()
if st.button("Siguiente ➡️" if CURRENT_SLIDE < 2 else "Finalizar ✅", key="nav_next"):
    if CURRENT_SLIDE < 2: st.session_state.slide += 1; st.rerun()
    else: st.success("Completado.")
