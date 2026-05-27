"""Componentes compartidos de layout para el boceto Streamlit."""

from __future__ import annotations

import streamlit as st

RISK_COLORS = {
    "Verde": {"bg": "rgba(16, 185, 129, 0.16)", "fg": "#6EE7B7", "dot": "🟢"},
    "Amarillo": {"bg": "rgba(245, 158, 11, 0.18)", "fg": "#FCD34D", "dot": "🟡"},
    "Rojo": {"bg": "rgba(244, 63, 94, 0.18)", "fg": "#FDA4AF", "dot": "🔴"},
}


def inject_base_styles() -> None:
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        :root {
            --rs-background: #131315;
            --rs-surface: #131315;
            --rs-surface-lowest: #0e0e10;
            --rs-surface-low: #1b1b1d;
            --rs-surface-container: #1f1f21;
            --rs-surface-high: #2a2a2b;
            --rs-surface-highest: #353436;
            --rs-on-surface: #e4e2e4;
            --rs-on-muted: #c6c6cd;
            --rs-outline: #45464d;
            --rs-outline-strong: #909097;
            --rs-primary-container: #0f172a;
            --rs-primary: #bec6e0;
            --rs-secondary: #adc6ff;
            --rs-secondary-container: #0566d9;
            --rs-tertiary: #dec29a;
            --rs-error: #ffb4ab;
            --rs-shadow: rgba(0, 0, 0, 0.36);
        }

        .stApp {
            background:
                radial-gradient(circle at top left, rgba(5, 102, 217, 0.18), transparent 34rem),
                radial-gradient(circle at bottom right, rgba(222, 194, 154, 0.08), transparent 32rem),
                var(--rs-background);
            color: var(--rs-on-surface);
            font-family: "Inter", sans-serif;
        }

        section[data-testid="stSidebar"] {
            background: var(--rs-surface-container);
            border-right: 1px solid var(--rs-outline);
        }

        section[data-testid="stSidebar"] > div {
            background: var(--rs-surface-container);
        }

        section[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p,
        section[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] div {
            color: var(--rs-on-surface);
        }

        .block-container {
            max-width: 1440px;
            padding-top: 2.6rem;
            padding-bottom: 6rem;
        }
        .rs-top-track {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: var(--rs-surface-container-highest);
            z-index: 1200;
        }
        .rs-top-track-fill {
            height: 100%;
            background: var(--rs-secondary-container);
            position: relative;
            transition: width 260ms ease;
        }
        .rs-top-track-dot {
            position: absolute;
            right: -6px;
            top: 50%;
            width: 12px;
            height: 12px;
            border-radius: 999px;
            transform: translateY(-50%);
            background: var(--rs-secondary);
            box-shadow: 0 0 14px rgba(173, 198, 255, 0.9);
        }

        div[data-testid="stMarkdownContainer"] p,
        div[data-testid="stMarkdownContainer"] li,
        div[data-testid="stCaptionContainer"] {
            color: var(--rs-on-muted);
        }

        div[data-testid="stAlert"] {
            background: rgba(31, 31, 33, 0.92);
            border: 1px solid var(--rs-outline);
            color: var(--rs-on-surface);
        }

        div[data-testid="stVerticalBlockBorderWrapper"] {
            border-color: var(--rs-outline);
            background: linear-gradient(135deg, rgba(31, 31, 33, 0.92), rgba(14, 14, 16, 0.92));
            box-shadow: 0 24px 70px var(--rs-shadow);
        }

        div[data-testid="stMetric"] {
            background: linear-gradient(180deg, var(--rs-surface-container), var(--rs-surface-low));
            border: 1px solid var(--rs-outline);
            border-radius: 16px;
            padding: 0.85rem 1rem;
        }

        div[data-testid="stMetric"] label,
        div[data-testid="stMetric"] [data-testid="stMetricLabel"] {
            color: var(--rs-on-muted);
        }

        div[data-testid="stMetric"] [data-testid="stMetricValue"] {
            color: var(--rs-on-surface);
            font-family: "Montserrat", sans-serif;
        }

        .stButton > button,
        .stDownloadButton > button {
            border-radius: 999px;
            border: 1px solid rgba(173, 198, 255, 0.28);
            background: var(--rs-secondary-container);
            color: #e6ecff;
            font-weight: 700;
            transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
        }

        .stButton > button:hover,
        .stDownloadButton > button:hover {
            border-color: var(--rs-secondary);
            background: #0b72ed;
            color: #ffffff;
            transform: translateY(-1px);
        }

        .stButton > button:disabled {
            background: var(--rs-surface-high);
            color: #777982;
            border-color: var(--rs-outline);
        }

        .stSelectbox div[data-baseweb="select"] > div,
        .stTextArea textarea,
        .stFileUploader section,
        .stRadio div[role="radiogroup"] {
            background: var(--rs-surface-container);
            border-color: var(--rs-outline);
            color: var(--rs-on-surface);
        }

        .stProgress [data-testid="stProgressBar"] {
            background: linear-gradient(90deg, var(--rs-secondary-container), var(--rs-secondary));
        }

        .rs-header {
            padding: 1.25rem 0 1.5rem 0;
            border-bottom: 1px solid var(--rs-outline);
            margin-bottom: 1.25rem;
        }
        .rs-kicker {
            color: var(--rs-secondary);
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
        }
        .rs-title {
            color: var(--rs-on-surface);
            font-family: "Montserrat", sans-serif;
            font-size: clamp(2rem, 4vw, 3.6rem);
            font-weight: 800;
            letter-spacing: -0.035em;
            line-height: 1.02;
            margin: 0;
        }
        .rs-subtitle {
            color: var(--rs-on-muted);
            font-size: 1.05rem;
            line-height: 1.6;
            max-width: 780px;
            margin-top: 0.75rem;
        }
        .rs-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.3rem 0.75rem;
            border-radius: 999px;
            font-size: 0.8rem;
            font-weight: 800;
            border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .rs-panel {
            background: var(--rs-surface-container);
            border: 1px solid var(--rs-outline);
            border-radius: 12px;
            padding: 1rem 1.1rem;
            margin-bottom: 0.75rem;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
        }
        .rs-slide {
            min-height: 470px;
            background:
                linear-gradient(135deg, rgba(31, 31, 33, 0.98), rgba(27, 27, 29, 0.98));
            border: 1px solid rgba(69, 70, 77, 0.65);
            border-radius: 12px;
            padding: 2rem 2.2rem;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.24);
            margin: 1rem 0 1.1rem 0;
        }
        .rs-slide-kicker {
            color: var(--rs-secondary);
            font-size: 0.82rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            margin-bottom: 0.4rem;
        }
        .rs-slide-title {
            color: var(--rs-on-surface);
            font-family: "Montserrat", sans-serif;
            font-size: clamp(2rem, 3vw, 3rem);
            font-weight: 800;
            line-height: 1.08;
            letter-spacing: -0.035em;
            margin-bottom: 0.55rem;
        }
        .rs-slide-subtitle {
            color: var(--rs-on-muted);
            font-size: 1.05rem;
            line-height: 1.5;
            max-width: 760px;
            margin-bottom: 1.35rem;
        }
        .rs-progress-track {
            width: 100%;
            height: 10px;
            border-radius: 999px;
            background: var(--rs-surface-highest);
            overflow: hidden;
            margin: 0.6rem 0 1.2rem 0;
            border: 1px solid var(--rs-outline);
        }
        .rs-progress-fill {
            height: 100%;
            border-radius: 999px;
            background: linear-gradient(90deg, var(--rs-secondary-container), var(--rs-secondary));
            box-shadow: 0 0 18px rgba(173, 198, 255, 0.38);
        }
        .rs-step-pill {
            display: inline-block;
            padding: 0.42rem 0.82rem;
            border-radius: 999px;
            background: var(--rs-surface-container);
            color: var(--rs-on-muted);
            font-size: 0.78rem;
            font-weight: 800;
            margin-right: 0.35rem;
            margin-bottom: 0.35rem;
            border: 1px solid var(--rs-outline);
        }
        .rs-step-pill.is-active {
            background: rgba(5, 102, 217, 0.24);
            color: #e6ecff;
            border-color: rgba(173, 198, 255, 0.58);
        }
        .rs-step-pill.is-complete {
            background: rgba(16, 185, 129, 0.12);
            color: #6EE7B7;
            border-color: rgba(110, 231, 183, 0.24);
        }
        .rs-ethic-note {
            background: rgba(15, 23, 42, 0.82);
            border: 1px solid rgba(173, 198, 255, 0.22);
            border-left: 4px solid var(--rs-secondary);
            border-radius: 16px;
            padding: 0.9rem 1rem;
            color: var(--rs-on-muted);
            margin-bottom: 1rem;
        }
        .rs-grid-card {
            background: var(--rs-surface-container-low);
            border: 1px solid rgba(69, 70, 77, 0.55);
            border-radius: 12px;
            padding: 1.1rem;
            min-height: 100%;
        }
        .rs-glass-card {
            background: rgba(31, 31, 33, 0.72);
            border: 1px solid rgba(69, 70, 77, 0.45);
            border-radius: 12px;
            padding: 1.25rem;
            backdrop-filter: blur(12px);
        }
        .rs-card-title {
            color: var(--rs-on-surface);
            font-family: "Montserrat", sans-serif;
            font-size: 1.05rem;
            font-weight: 800;
            margin-bottom: 0.35rem;
        }
        .rs-card-copy {
            color: var(--rs-on-muted);
            font-size: 0.92rem;
            line-height: 1.5;
        }
        .rs-pill-row {
            display: flex;
            flex-wrap: wrap;
            gap: 0.55rem;
            margin: 0.85rem 0;
        }
        .rs-mini-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            border-radius: 999px;
            background: rgba(173, 198, 255, 0.10);
            color: var(--rs-secondary);
            border: 1px solid rgba(173, 198, 255, 0.20);
            padding: 0.35rem 0.7rem;
            font-size: 0.8rem;
            font-weight: 800;
        }
        .rs-status-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            padding: 0.85rem 0;
            border-bottom: 1px solid var(--rs-outline);
        }
        .rs-status-row:last-child {
            border-bottom: 0;
        }
        .rs-status-label {
            color: var(--rs-on-surface);
            font-weight: 700;
        }
        .rs-status-value {
            color: var(--rs-secondary);
            font-weight: 800;
        }
        .rs-upload-visual {
            border: 1.5px dashed rgba(173, 198, 255, 0.45);
            border-radius: 12px;
            background:
                linear-gradient(135deg, rgba(173, 198, 255, 0.08), rgba(5, 102, 217, 0.05)),
                rgba(255, 255, 255, 0.025);
            padding: 1.5rem;
            text-align: center;
            margin-bottom: 1rem;
        }
        .rs-upload-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            border-radius: 999px;
            background: var(--rs-surface-high);
            color: var(--rs-secondary);
            font-family: "Montserrat", sans-serif;
            font-size: 1.7rem;
            font-weight: 900;
            margin-bottom: 0.6rem;
        }
        .rs-score {
            font-family: "Montserrat", sans-serif;
            font-size: clamp(4rem, 8vw, 6.5rem);
            font-weight: 900;
            line-height: 0.9;
            color: var(--rs-on-surface);
            margin: 0.25rem 0 0.55rem 0;
            letter-spacing: -0.06em;
        }
        .rs-score-label {
            color: var(--rs-on-muted);
            font-size: 0.95rem;
            margin-bottom: 1rem;
        }
        .rs-risk-gauge {
            width: min(280px, 100%);
            aspect-ratio: 1;
            border-radius: 999px;
            margin: 0 auto 1rem auto;
            display: grid;
            place-items: center;
            background:
                radial-gradient(circle, var(--rs-surface-lowest) 0 58%, transparent 59%),
                conic-gradient(from 180deg, var(--risk-color, #f43f5e) 0 var(--score-deg), var(--rs-surface-highest) var(--score-deg) 360deg);
            box-shadow: inset 0 0 0 1px var(--rs-outline), 0 22px 52px rgba(5, 102, 217, 0.18);
        }
        .rs-risk-gauge-inner {
            width: 64%;
            aspect-ratio: 1;
            border-radius: 999px;
            background: var(--rs-surface-lowest);
            display: grid;
            place-items: center;
            border: 1px solid var(--rs-outline);
        }
        .rs-factor-row {
            margin-bottom: 0.85rem;
        }
        .rs-factor-top {
            display: flex;
            justify-content: space-between;
            color: var(--rs-on-muted);
            font-size: 0.86rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }
        .rs-factor-track {
            height: 9px;
            border-radius: 999px;
            background: var(--rs-surface-highest);
            overflow: hidden;
            border: 1px solid var(--rs-outline);
        }
        .rs-factor-fill {
            height: 100%;
            border-radius: 999px;
            background: linear-gradient(90deg, var(--rs-secondary-container), var(--rs-secondary));
        }
        .rs-chat-shell {
            background: var(--rs-surface-container);
            border: 1px solid var(--rs-outline);
            border-radius: 22px;
            padding: 1rem;
            box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28);
            margin-top: 1rem;
        }
        .rs-floating-chat {
            position: fixed;
            left: 50%;
            bottom: 86px;
            transform: translateX(-50%);
            width: min(620px, calc(100vw - 64px));
            z-index: 999;
            background: var(--rs-surface-container);
            border: 1px solid var(--rs-outline);
            border-radius: 22px;
            padding: 0.9rem;
            box-shadow: 0 18px 48px rgba(0, 0, 0, 0.38);
        }
        .st-key-chat_bubble_toggle {
            position: fixed;
            left: 50%;
            bottom: 24px;
            transform: translateX(-50%);
            z-index: 1000;
        }
        .st-key-chat_bubble_toggle button {
            width: 52px;
            height: 52px;
            border-radius: 999px;
            background: var(--rs-secondary-container);
            color: #FFFFFF;
            border: 1px solid rgba(173,198,255,0.72);
            box-shadow: 0 14px 34px rgba(5, 102, 217, 0.45);
            font-size: 1.2rem;
            padding: 0;
        }
        .st-key-chat_panel {
            position: fixed;
            left: 50%;
            bottom: 86px;
            transform: translateX(-50%);
            width: min(620px, calc(100vw - 64px));
            z-index: 999;
            background: rgba(31, 31, 33, 0.96);
            border: 1px solid var(--rs-outline);
            border-radius: 22px;
            padding: 1rem;
            box-shadow: 0 18px 48px rgba(0, 0, 0, 0.44);
            backdrop-filter: blur(12px);
        }
        .st-key-always_chat_panel {
            position: fixed;
            left: 50%;
            transform: translateX(-50%);
            bottom: 24px;
            width: min(620px, calc(100vw - 48px));
            max-height: min(72vh, 640px);
            overflow: auto;
            z-index: 990;
            background: rgba(31, 31, 33, 0.96);
            border: 1px solid var(--rs-outline);
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
            backdrop-filter: blur(12px);
        }
        .st-key-always_chat_panel textarea {
            min-height: 72px;
        }
        .rs-floating-composer {
            min-height: 64px;
            border: 1px solid var(--rs-outline);
            border-radius: 16px;
            padding: 0.9rem;
            color: var(--rs-on-muted);
            background: var(--rs-surface-container);
            margin-top: 0.7rem;
        }
        .rs-floating-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-top: 1px solid var(--rs-outline);
            margin-top: 0.7rem;
            padding-top: 0.65rem;
            color: var(--rs-on-muted);
            font-size: 0.82rem;
        }
        .rs-floating-send {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 34px;
            height: 34px;
            border-radius: 10px;
            background: var(--rs-secondary-container);
            color: #FFFFFF;
            font-weight: 800;
        }
        .rs-chat-title {
            color: var(--rs-on-surface);
            font-size: 1rem;
            font-weight: 800;
            margin-bottom: 0.2rem;
        }
        .rs-chat-subtitle {
            color: var(--rs-on-muted);
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
        }
        .rs-chat-bubble-user {
            background: rgba(5, 102, 217, 0.22);
            color: #e6ecff;
            border-radius: 16px 16px 4px 16px;
            padding: 0.7rem 0.9rem;
            margin: 0.45rem 0 0.45rem auto;
            max-width: 82%;
        }
        .rs-chat-bubble-assistant {
            background: var(--rs-surface-low);
            color: var(--rs-on-surface);
            border: 1px solid var(--rs-outline);
            border-radius: 16px 16px 16px 4px;
            padding: 0.7rem 0.9rem;
            margin: 0.45rem auto 0.45rem 0;
            max-width: 86%;
        }
        .rs-chat-actions {
            color: var(--rs-on-muted);
            font-size: 0.82rem;
            border-top: 1px solid var(--rs-outline);
            padding-top: 0.65rem;
            margin-top: 0.8rem;
        }
        .rs-muted {
            color: var(--rs-on-muted);
            font-size: 0.85rem;
        }
        .rs-bottom-nav {
            background: rgba(19, 19, 21, 0.72);
            border: 1px solid var(--rs-outline);
            border-radius: 999px;
            padding: 0.5rem;
            backdrop-filter: blur(12px);
            margin-top: 1rem;
        }
        .rs-sidebar-shell {
            display: flex;
            flex-direction: column;
            min-height: calc(100vh - 4rem);
            padding-top: 0.25rem;
        }
        .rs-side-brand {
            display: flex;
            flex-direction: column;
            gap: 0.18rem;
            margin-bottom: 1.35rem;
        }
        .rs-side-title {
            color: var(--rs-primary);
            font-family: "Montserrat", sans-serif;
            font-size: 1.15rem;
            font-weight: 700;
            line-height: 1.2;
        }
        .rs-side-subtitle {
            color: var(--rs-on-muted);
            font-size: 0.9rem;
        }
        .rs-side-nav {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            flex: 1;
        }
        .rs-side-item {
            display: flex;
            align-items: center;
            gap: 0.55rem;
            border-radius: 10px;
            padding: 0.62rem 0.75rem;
            border: 1px solid transparent;
            color: var(--rs-on-muted);
            font-size: 0.92rem;
            font-weight: 600;
        }
        .rs-side-item.is-active {
            background: var(--rs-secondary-container);
            color: #e6ecff;
            border-color: rgba(173, 198, 255, 0.22);
            font-weight: 700;
        }
        .rs-side-item.is-active .rs-side-icon {
            font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
        }
        .rs-side-icon {
            font-size: 1.15rem;
            line-height: 1;
        }
        .rs-side-footer {
            margin-top: auto;
            padding-top: 1rem;
            border-top: 1px solid var(--rs-outline);
        }
        .rs-side-ethic {
            background: var(--rs-surface-container-low);
            border: 1px solid rgba(69, 70, 77, 0.45);
            border-radius: 10px;
            padding: 0.65rem 0.75rem;
            color: var(--rs-secondary);
            font-size: 0.72rem;
            line-height: 1.45;
            font-style: italic;
            margin-bottom: 0.85rem;
        }
        .rs-side-link-row {
            display: flex;
            align-items: center;
            gap: 0.55rem;
            color: var(--rs-on-muted);
            font-size: 0.88rem;
            padding: 0.45rem 0.2rem;
        }
        .rs-side-dot {
            display: none;
        }
        .rs-side-link {
            display: none;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def page_header(kicker: str, title: str, subtitle: str = "") -> None:
    inject_base_styles()
    st.markdown(
        f"""
        <div class="rs-header">
            <div class="rs-kicker">{kicker}</div>
            <div class="rs-title">{title}</div>
            {"<div class='rs-subtitle'>" + subtitle + "</div>" if subtitle else ""}
        </div>
        """,
        unsafe_allow_html=True,
    )


def risk_badge(nivel: str) -> str:
    style = RISK_COLORS.get(nivel, RISK_COLORS["Verde"])
    dot = style["dot"]
    return (
        f"<span class='rs-badge' style='background:{style['bg']};color:{style['fg']};'>"
        f"{dot} {nivel}</span>"
    )


def section(title: str, hint: str = "") -> None:
    st.markdown(f"**{title}**")
    if hint:
        st.caption(hint)


def placeholder_chart(label: str) -> None:
    st.info(f"📊 Boceto: aquí irá el gráfico **{label}** (Plotly).")


def wireframe_box(title: str, body: str) -> None:
    st.markdown(
        f"""
        <div class="rs-panel">
            <strong>{title}</strong><br/>
            <span class="rs-muted">{body}</span>
        </div>
        """,
        unsafe_allow_html=True,
    )


def sidebar_branding(active_step: int = 0) -> None:
    inject_base_styles()
    steps = [
        {"label": "Carga", "icon": "upload_file", "index": 0},
        {"label": "Resumen", "icon": "analytics", "index": 1},
        {"label": "Análisis IA", "icon": "psychology", "index": 2},
    ]
    nav_items = []
    for step in steps:
        cls = "rs-side-item is-active" if step["index"] == active_step else "rs-side-item"
        nav_items.append(
            f'<div class="{cls}">'
            f'<span class="material-symbols-outlined rs-side-icon">{step["icon"]}</span>'
            f'<span>{step["label"]}</span>'
            f"</div>"
        )

    sidebar_html = f"""
    <div class="rs-sidebar-shell">
        <div class="rs-side-brand">
            <div class="rs-side-title">RastroSeguro</div>
            <div class="rs-side-subtitle">Expert Intelligence</div>
        </div>
        <div class="rs-side-nav">
            {"".join(nav_items)}
        </div>
    </div>
    """

    with st.sidebar:
        st.markdown(sidebar_html, unsafe_allow_html=True)
