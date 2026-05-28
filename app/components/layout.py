"""Componentes compartidos de layout — diseño Analytical Trust (Stitch)."""

from __future__ import annotations

import html as html_mod

import streamlit as st

RISK_COLORS = {
    "Verde": {"bg": "rgba(16, 185, 129, 0.16)", "fg": "#6EE7B7", "dot": "🟢"},
    "Amarillo": {"bg": "rgba(245, 158, 11, 0.18)", "fg": "#FCD34D", "dot": "🟡"},
    "Rojo": {"bg": "rgba(244, 63, 94, 0.18)", "fg": "#FDA4AF", "dot": "🔴"},
}

SCORE_ICONS = {
    "Reglas": "rule",
    "Modelo ML": "hub",
    "Anomalías": "warning",
    "NLP": "description",
    "Grafo": "account_tree",
    "Categórico": "category",
}

SCORE_DESCRIPTIONS = {
    "Reglas": "Reglas de negocio críticas evaluadas.",
    "Modelo ML": "Vector de comportamiento inusual detectado.",
    "Anomalías": "Outliers en frecuencia de transacciones.",
    "NLP": "Sentimiento y patrones de texto sospechosos.",
    "Grafo": "Conexiones con entidades de riesgo previo.",
    "Categórico": "Atenuante por antigüedad del cliente.",
}


def inject_base_styles() -> None:
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        /* ─── Global Reset & Clean Scroll ─── */
        html, body, [data-testid="stAppViewBlockContainer"], [data-testid="stMainBlockContainer"], section.stMain, .main {
            overflow: hidden !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            max-height: 100vh !important;
        }
        
        /* Collapse Streamlit's empty markdown elements used for style injection */
        div[data-testid="stElementContainer"]:has(style) {
            display: none !important;
            height: 0 !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        /* Hide default Streamlit elements that take space */
        [data-testid="stHeader"], [data-testid="stFooter"], [data-testid="stDecoration"] {
            display: none !important;
        }
        
        /* Force internal block container to fill viewport exactly */
        .block-container {
            padding: 0 !important;
            max-width: 100vw !important;
            height: 100vh !important;
        }

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
            --rs-error-container: #93000a;
            --rs-shadow: rgba(0, 0, 0, 0.36);
            --rs-risk-emerald: #10b981;
            --rs-risk-amber: #f59e0b;
            --rs-risk-rose: #ef4444;
        }

        /* ─── Global Shell ─── */
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
            transition: transform 180ms ease, width 180ms ease, min-width 180ms ease;
            display: none !important;
        }
        section[data-testid="stSidebar"] > div {
            background: var(--rs-surface-container);
        }
        section[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p,
        section[data-testid="stSidebar"] [data-testid="stMarkdownContainer"] div {
            color: var(--rs-on-surface);
        }
        section[data-testid="stMain"],
        [data-testid="stMainBlockContainer"] {
            margin-left: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            transition: margin-left 180ms ease, width 180ms ease;
        }
        .stApp:has(.rs-sidebar-open-marker) section[data-testid="stMain"],
        .stApp:has(.rs-sidebar-open-marker) [data-testid="stMainBlockContainer"] {
            margin-left: 300px !important;
            width: calc(100vw - 300px) !important;
            max-width: calc(100vw - 300px) !important;
        }
        .st-key-rs_custom_sidebar_panel {
            position: fixed;
            top: 0;
            left: 0;
            width: 300px;
            height: 100vh;
            z-index: 2200;
            padding: 72px 1rem 1rem;
            background: var(--rs-surface-container);
            border-right: 1px solid var(--rs-outline);
            box-shadow: 24px 0 60px rgba(0, 0, 0, 0.28);
            overflow: hidden;
        }
        .st-key-rs_custom_sidebar_panel > div,
        .st-key-rs_custom_sidebar_panel [data-testid="stVerticalBlock"] {
            height: 100%;
        }

        .block-container {
            max-width: 1440px;
            padding-top: 5rem;
            padding-bottom: 7rem;
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

        /* ─── Top App Bar ─── */
        .rs-topbar {
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 60px;
            background: var(--rs-background);
            border-bottom: 1px solid var(--rs-outline-variant);
            display: flex;
            align-items: center;
            padding: 0 2rem;
            z-index: 2000; /* Much higher than backgrounds */
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        .rs-topbar-brand {
            font-family: "Montserrat", sans-serif;
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--rs-primary);
        }
        .rs-topbar-center {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            font-family: "Montserrat", sans-serif;
            font-size: 1.15rem;
            font-weight: 700;
            color: var(--rs-primary);
            border-bottom: 2px solid var(--rs-primary);
            padding-bottom: 2px;
        }
        .rs-topbar-icons {
            display: flex; align-items: center; gap: 0.75rem;
        }
        .rs-topbar-icons .material-symbols-outlined {
            color: var(--rs-on-muted);
            cursor: pointer;
            transition: color 0.2s;
        }
        .rs-topbar-icons .material-symbols-outlined:hover {
            color: var(--rs-primary);
        }
        .rs-topbar-avatar {
            width: 32px; height: 32px;
            border-radius: 999px;
            background: var(--rs-surface-high);
            border: 1px solid var(--rs-outline);
            overflow: hidden;
        }
        .rs-topbar-avatar img {
            width: 100%; height: 100%; object-fit: cover;
        }
        .st-key-sidebar_toggle_btn {
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 2400;
        }
        .st-key-sidebar_toggle_btn button {
            width: 40px;
            height: 40px;
            min-width: 40px;
            border-radius: 12px;
            padding: 0 !important;
            background: rgba(31, 31, 33, 0.92) !important;
            color: var(--rs-on-surface) !important;
            border: 1px solid var(--rs-outline) !important;
            box-shadow: 0 10px 26px rgba(0, 0, 0, 0.28) !important;
            font-size: 1.25rem !important;
            line-height: 1 !important;
        }
        .st-key-sidebar_toggle_btn button:hover {
            background: var(--rs-secondary-container) !important;
            border-color: rgba(173, 198, 255, 0.45) !important;
            transform: none !important;
        }

        /* ─── Progress Track ─── */
        .rs-top-track {
            position: fixed;
            top: 56px; left: 0; right: 0;
            height: 4px;
            background: var(--rs-surface-highest);
            z-index: 1099;
        }
        .rs-top-track-fill {
            height: 100%;
            background: var(--rs-secondary-container);
            position: relative;
            transition: width 500ms ease;
        }
        .rs-top-track-dot {
            position: absolute;
            right: -6px; top: 50%;
            width: 12px; height: 12px;
            border-radius: 999px;
            transform: translateY(-50%);
            background: var(--rs-secondary);
            box-shadow: 0 0 14px rgba(173, 198, 255, 0.9);
        }

        /* ─── Bottom Nav Bar ─── */
        .rs-bottombar {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            height: 64px;
            background: rgba(19, 19, 21, 0.80);
            backdrop-filter: blur(12px);
            border-top: 1px solid var(--rs-outline);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 2rem;
            z-index: 1100;
            box-shadow: 0 -4px 16px rgba(0,0,0,0.28);
        }
        .rs-bottombar-prev, .rs-bottombar-next {
            display: flex; align-items: center; gap: 0.35rem;
            font-size: 0.78rem; font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: all 0.2s;
            padding: 0.5rem 1rem;
            border-radius: 999px;
        }
        .rs-bottombar-prev {
            color: var(--rs-on-muted);
        }
        .rs-bottombar-prev:hover { color: var(--rs-on-surface); }
        .rs-bottombar-prev.is-disabled {
            opacity: 0.35; cursor: not-allowed;
        }
        .rs-bottombar-next {
            background: var(--rs-secondary-container);
            color: #e6ecff;
            box-shadow: 0 4px 14px rgba(5, 102, 217, 0.3);
        }
        .rs-bottombar-next:hover {
            filter: brightness(1.1);
        }
        .rs-bottombar-dots {
            display: flex; align-items: center; gap: 1rem;
        }
        .rs-bottombar-progress-container {
            width: 128px;
            height: 8px;
            background: var(--rs-surface-highest);
            border-radius: 999px;
            overflow: hidden;
        }
        .rs-bottombar-progress-fill {
            height: 100%;
            background: var(--rs-secondary);
            transition: width 0.5s ease;
        }
        .rs-bottombar-step-text {
            font-family: monospace;
            font-size: 0.75rem;
            color: var(--rs-on-muted);
            text-transform: uppercase;
        }

        /* ─── Streamlit Button Overlays ─── */
        .st-key-nav_prev, .st-key-nav_next {
            position: fixed !important;
            bottom: 12px !important;
            z-index: 1500 !important;
            width: auto !important;
        }
        .st-key-nav_prev {
            left: 276px !important; /* Sidebar + padding */
        }
        .st-key-nav_next {
            right: 2rem !important;
        }
        .st-key-nav_prev button, .st-key-nav_next button {
            background: rgba(255,255,255,0.05) !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
            color: var(--rs-on-surface) !important;
            min-width: 140px;
            height: 44px;
            border-radius: 999px !important;
            text-transform: uppercase;
            font-weight: 700 !important;
            font-size: 0.75rem !important;
            letter-spacing: 0.05em;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
        }
        .st-key-nav_next button {
            background: var(--rs-secondary-container) !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            color: #ffffff !important;
        }
        .st-key-nav_prev button:hover, .st-key-nav_next button:hover {
            filter: brightness(1.2);
            transform: translateY(-1px);
        }

        /* ─── AI FAB ─── */
        .rs-fab-container {
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1090;
        }
        .rs-fab {
            width: 52px; height: 52px;
            border-radius: 999px;
            background: linear-gradient(135deg, #3b82f6, #60a5fa);
            color: #fff;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
            cursor: pointer;
            transition: transform 0.2s;
            border: none;
        }
        .rs-fab:hover { transform: scale(1.1); }
        .rs-fab .material-symbols-outlined {
            font-variation-settings: 'FILL' 1;
            font-size: 1.4rem;
            color: #fff;
        }

        /* ─── Ethic Note ─── */
        .rs-ethic-note {
            background: rgba(15, 23, 42, 0.82);
            border: 1px solid rgba(173, 198, 255, 0.22);
            border-left: 4px solid var(--rs-secondary);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            color: var(--rs-on-muted);
            margin-bottom: 1rem;
            font-size: 0.88rem;
            line-height: 1.5;
        }

        /* ─── Slide Headers ─── */
        .rs-kicker {
            color: var(--rs-secondary);
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
        }
        .rs-slide-title {
            color: var(--rs-on-surface);
            font-family: "Montserrat", sans-serif;
            font-size: clamp(1.75rem, 3vw, 2.5rem);
            font-weight: 700;
            line-height: 1.15;
            letter-spacing: -0.025em;
            margin-bottom: 0.5rem;
        }
        .rs-slide-subtitle {
            color: var(--rs-on-muted);
            font-size: 1rem;
            line-height: 1.6;
            max-width: 760px;
            margin-bottom: 1.25rem;
        }

        /* ─── Bento Cards ─── */
        .rs-bento-card {
            background: var(--rs-surface-container);
            border: 1px solid rgba(69, 70, 77, 0.5);
            border-radius: 12px;
            padding: 1.25rem;
            transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .rs-bento-card:hover {
            transform: translateY(-2px);
            border-color: rgba(173, 198, 255, 0.4);
        }
        .rs-bento-card-dark {
            background: var(--rs-surface-low);
            border: 1px solid rgba(69, 70, 77, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
        }
        .rs-bento-card-high {
            background: var(--rs-surface-high);
            border: 1px solid var(--rs-outline);
            border-radius: 12px;
            padding: 1.25rem;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        /* ─── Expediente Header ─── */
        .rs-expediente-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 0.75rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--rs-outline);
        }
        .rs-expediente-id {
            display: flex; align-items: center; gap: 0.5rem;
            font-family: "Montserrat", sans-serif;
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--rs-on-surface);
        }
        .rs-expediente-id .material-symbols-outlined {
            color: var(--rs-secondary);
        }
        .rs-badge-complete {
            display: inline-flex; align-items: center; gap: 0.35rem;
            padding: 0.3rem 0.75rem;
            border-radius: 999px;
            background: rgba(5, 102, 217, 0.15);
            color: var(--rs-secondary);
            border: 1px solid rgba(173, 198, 255, 0.3);
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .rs-badge-complete .material-symbols-outlined {
            font-size: 0.85rem;
            font-variation-settings: 'FILL' 1;
            color: var(--rs-secondary);
        }

        /* ─── Metric Labels ─── */
        .rs-metric-label {
            font-size: 0.72rem;
            font-weight: 600;
            color: var(--rs-on-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.15rem;
        }
        .rs-metric-value {
            font-family: "Inter", sans-serif;
            font-size: 1.05rem;
            font-weight: 600;
            color: var(--rs-on-surface);
        }
        .rs-metric-value.is-highlight {
            color: var(--rs-secondary);
        }

        /* ─── Narrative Card ─── */
        .rs-narrative {
            background: var(--rs-surface-low);
            border: 1px solid rgba(69, 70, 77, 0.3);
            border-radius: 12px;
            padding: 1.25rem;
        }
        .rs-narrative-title {
            display: flex; align-items: center; gap: 0.35rem;
            color: var(--rs-secondary);
            font-weight: 600;
            font-size: 0.95rem;
            margin-bottom: 0.5rem;
        }
        .rs-narrative-title .material-symbols-outlined { font-size: 1rem; }
        .rs-narrative-body {
            color: var(--rs-on-muted);
            font-size: 0.92rem;
            line-height: 1.6;
        }

        /* ─── Document List ─── */
        .rs-doc-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.6rem 0.75rem;
            background: var(--rs-surface-low);
            border: 1px solid rgba(69, 70, 77, 0.2);
            border-radius: 8px;
            margin-bottom: 0.5rem;
        }
        .rs-doc-item-left {
            display: flex; align-items: center; gap: 0.5rem;
            color: var(--rs-on-surface);
            font-size: 0.92rem;
        }
        .rs-doc-item-left .material-symbols-outlined { color: var(--rs-secondary); }
        .rs-doc-item-check {
            font-variation-settings: 'FILL' 1;
            color: var(--rs-secondary);
        }

        /* ─── Drop Zone ─── */
        .rs-drop-zone {
            border: 2px dashed rgba(173, 198, 255, 0.45);
            border-radius: 16px;
            background:
                linear-gradient(135deg, rgba(173, 198, 255, 0.06), rgba(5, 102, 217, 0.03)),
                rgba(255, 255, 255, 0.015);
            padding: 2rem;
            text-align: center;
            transition: all 0.3s;
            cursor: pointer;
        }
        .rs-drop-zone:hover {
            border-color: var(--rs-secondary);
            background:
                linear-gradient(135deg, rgba(173, 198, 255, 0.10), rgba(5, 102, 217, 0.06)),
                rgba(255, 255, 255, 0.025);
        }
        .rs-drop-icon {
            display: inline-flex;
            align-items: center; justify-content: center;
            width: 64px; height: 64px;
            border-radius: 999px;
            background: var(--rs-surface-high);
            color: var(--rs-primary);
            margin-bottom: 0.75rem;
        }
        .rs-drop-icon .material-symbols-outlined {
            font-size: 2rem;
        }

        /* ─── Glass Card ─── */
        .rs-glass-card {
            background: rgba(31, 31, 33, 0.72);
            border: 1px solid rgba(69, 70, 77, 0.45);
            border-radius: 12px;
            padding: 1.25rem;
            backdrop-filter: blur(12px);
        }
        .rs-glass-card-validation {
            display: flex; align-items: flex-start; gap: 1rem;
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 1.25rem;
        }
        .rs-glass-icon-circle {
            background: var(--rs-primary-container);
            border-radius: 8px;
            padding: 0.5rem;
            display: flex; align-items: center; justify-content: center;
        }
        .rs-glass-icon-circle .material-symbols-outlined {
            color: var(--rs-primary);
        }

        /* ─── Score Component Cards ─── */
        .rs-score-card {
            background: var(--rs-surface-low);
            border: 1px solid var(--rs-outline);
            border-radius: 12px;
            padding: 1.25rem;
            transition: border-color 0.3s;
        }
        .rs-score-card:hover {
            border-color: var(--rs-primary);
        }
        .rs-score-card.is-critical:hover {
            border-color: var(--rs-risk-rose);
        }
        .rs-score-card-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }
        .rs-score-card-top .material-symbols-outlined {
            color: var(--rs-primary);
        }
        .rs-score-card-pts {
            font-weight: 700;
            font-size: 0.9rem;
        }
        .rs-score-card-pts.is-positive { color: var(--rs-risk-rose); }
        .rs-score-card-pts.is-negative { color: var(--rs-secondary); }
        .rs-score-card-pts.is-moderate { color: var(--rs-on-muted); }
        .rs-score-card-title {
            font-family: "Montserrat", sans-serif;
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--rs-on-surface);
            margin-bottom: 0.2rem;
        }
        .rs-score-card-desc {
            font-size: 0.75rem;
            font-weight: 600;
            color: var(--rs-on-muted);
        }
        .rs-score-card-bar {
            height: 4px;
            border-radius: 999px;
            background: var(--rs-surface-highest);
            overflow: hidden;
            margin-top: 0.85rem;
        }
        .rs-score-card-bar-fill {
            height: 100%;
            border-radius: 999px;
            transition: width 0.8s ease;
        }

        /* ─── Risk Gauge ─── */
        .rs-risk-gauge {
            width: min(256px, 100%);
            aspect-ratio: 1;
            border-radius: 999px;
            margin: 0 auto 1rem auto;
            display: grid;
            place-items: center;
            background:
                radial-gradient(circle, var(--rs-surface-lowest) 0 58%, transparent 59%),
                conic-gradient(from 180deg, var(--risk-color, #ef4444) 0 var(--score-deg), var(--rs-surface-highest) var(--score-deg) 360deg);
            box-shadow: inset 0 0 0 1px var(--rs-outline), 0 22px 52px rgba(5, 102, 217, 0.15);
        }
        .rs-risk-gauge-inner {
            width: 64%; aspect-ratio: 1;
            border-radius: 999px;
            background: var(--rs-surface-lowest);
            display: grid;
            place-items: center;
            border: 1px solid var(--rs-outline);
        }
        .rs-score-big {
            font-family: "Montserrat", sans-serif;
            font-size: 4.5rem;
            font-weight: 700;
            line-height: 0.9;
            letter-spacing: -0.02em;
        }
        .rs-score-sublabel {
            color: var(--rs-on-muted);
            font-size: 0.78rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        /* ─── Risk Level Alert ─── */
        .rs-risk-alert {
            border-left: 4px solid;
            border-radius: 0 12px 12px 0;
            padding: 1.25rem;
            margin-bottom: 1rem;
        }
        .rs-risk-alert.is-critical {
            background: rgba(147, 0, 10, 0.15);
            border-color: var(--rs-risk-rose);
        }
        .rs-risk-alert.is-warning {
            background: rgba(245, 158, 11, 0.10);
            border-color: var(--rs-risk-amber);
        }
        .rs-risk-alert.is-safe {
            background: rgba(16, 185, 129, 0.10);
            border-color: var(--rs-risk-emerald);
        }
        .rs-risk-alert-title {
            font-family: "Montserrat", sans-serif;
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.35rem;
        }
        .rs-risk-alert-body {
            font-size: 1rem;
            line-height: 1.6;
            color: var(--rs-on-surface);
        }

        /* ─── Pills ─── */
        .rs-pill-row {
            display: flex; flex-wrap: wrap; gap: 0.5rem;
            margin: 0.75rem 0;
        }
        .rs-pill {
            display: inline-flex; align-items: center; gap: 0.3rem;
            padding: 0.3rem 0.65rem;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 600;
            background: var(--rs-surface-high);
            border: 1px solid var(--rs-outline);
            color: var(--rs-on-surface);
        }
        .rs-pill-dot {
            width: 6px; height: 6px;
            border-radius: 999px;
        }

        /* ─── Disclaimer ─── */
        .rs-disclaimer {
            text-align: center;
            opacity: 0.6;
            border-top: 1px solid var(--rs-outline);
            padding-top: 1.5rem;
            margin-top: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: var(--rs-on-muted);
        }

        /* ─── Location Card ─── */
        .rs-location-card {
            background: var(--rs-surface-container);
            border: 1px solid var(--rs-outline);
            border-radius: 12px;
            overflow: hidden;
            position: relative;
        }
        .rs-location-overlay {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            padding: 1rem;
            background: linear-gradient(to top, var(--rs-surface-container), transparent);
        }
        .rs-location-label {
            display: flex; align-items: center; gap: 0.25rem;
            color: var(--rs-secondary);
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.2rem;
        }
        .rs-location-label .material-symbols-outlined { font-size: 0.85rem; }
        .rs-location-value {
            font-weight: 600;
            color: var(--rs-on-surface);
        }

        /* ─── Prep Card ─── */
        .rs-prep-card {
            background: var(--rs-surface-container);
            border: 1px solid var(--rs-outline);
            border-radius: 12px;
            padding: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .rs-spinner {
            width: 48px; height: 48px;
            border: 4px solid rgba(5, 102, 217, 0.2);
            border-top-color: var(--rs-secondary-container);
            border-radius: 999px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* ─── Chat Panel ─── */
        .st-key-ai_chat_panel {
            position: fixed;
            bottom: 140px;
            left: 50%;
            transform: translateX(-50%);
            width: min(600px, calc(100vw - 48px));
            z-index: 1089;
            background: rgba(31, 31, 33, 0.96);
            border: 1px solid var(--rs-outline);
            border-radius: 20px;
            padding: 1rem;
            box-shadow: 0 18px 48px rgba(0, 0, 0, 0.44);
            backdrop-filter: blur(12px);
            max-height: 60vh;
            overflow-y: auto;
        }
        .rs-chat-title {
            color: var(--rs-on-surface);
            font-size: 1rem;
            font-weight: 800;
            margin-bottom: 0.15rem;
        }

        /* ─── Buttons ─── */
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

        /* ─── Inputs ─── */
        .stSelectbox div[data-baseweb="select"] > div,
        .stTextArea textarea,
        .stFileUploader section,
        .stRadio div[role="radiogroup"] {
            background: var(--rs-surface-container);
            border-color: var(--rs-outline);
            color: var(--rs-on-surface);
        }

        /* ─── Sidebar Nav ─── */
        section[data-testid="stSidebar"] .stButton > button {
            border-radius: 12px !important;
        }
        section[data-testid="stSidebar"] [class*="st-key-sidebar_nav_"] {
            margin-bottom: 0.35rem;
        }
        section[data-testid="stSidebar"] [class*="st-key-sidebar_nav_"] button {
            width: 100%;
            justify-content: flex-start;
            text-align: left;
            border-radius: 12px !important;
            padding: 0.62rem 0.75rem !important;
            font-size: 0.92rem !important;
            font-weight: 600 !important;
            box-shadow: none !important;
            min-height: 2.65rem;
        }
        section[data-testid="stSidebar"] [class*="st-key-sidebar_nav_"] button:hover {
            transform: none !important;
        }

        .st-key-upload_drop_zone {
            border: 2px dashed rgba(173, 198, 255, 0.45);
            border-radius: 16px;
            background:
                linear-gradient(135deg, rgba(173, 198, 255, 0.06), rgba(5, 102, 217, 0.03)),
                rgba(255, 255, 255, 0.015);
            padding: 1.5rem 1.25rem 1.25rem;
            text-align: center;
            margin-bottom: 1rem;
            transition: all 0.3s;
        }
        .st-key-upload_drop_zone:hover {
            border-color: var(--rs-secondary);
        }
        .st-key-upload_drop_zone [data-testid="stFileUploader"] section {
            border: none; background: transparent; padding: 0;
        }
        .st-key-upload_drop_zone [data-testid="stFileUploader"] section > div {
            padding: 0;
        }
        .st-key-upload_drop_zone [data-testid="stFileUploader"] button {
            margin: 0.75rem auto 0;
            border-radius: 999px;
            background: var(--rs-secondary);
            color: #002e6a;
            border: none;
            font-weight: 700;
        }

        .st-key-demo_case_zone {
            border: 1px solid rgba(69, 70, 77, 0.55);
            border-radius: 12px;
            background: var(--rs-surface-low);
            padding: 1.25rem;
            margin-bottom: 1rem;
        }

        /* ─── Split Layout Slide 0 ─── */
        .rs-split-bg {
            position: fixed;
            top: 60px; left: 0; right: 0; bottom: 64px;
            display: flex;
            z-index: 0;
        }
        .rs-split-bg-left {
            flex: 1;
            background: #111113;
            border-right: 1px solid rgba(255,255,255,0.03);
            /* Handle sidebar gap if present */
            margin-left: 0; 
        }
        
        /* Centering panels over backgrounds - Optimized for single screen */
        .rs-panel-centered {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: calc(100vh - 124px); /* Combined height of top (60) and bottom (64) bars */
            width: 100%;
            overflow: hidden;
            position: relative;
        }
        .rs-panel-left-content {
            width: 100%;
            max-width: 520px;
            text-align: left;
            padding: 0 2rem;
        }
        .rs-panel-right-content {
            width: 100%;
            max-width: 460px;
            padding: 0 2rem;
        }

        /* Fix for Streamlit's internal padding */
        [data-testid="stAppViewBlockContainer"] {
            padding-top: 0rem !important;
            padding-bottom: 0rem !important;
            max-width: 100% !important;
        }
        [data-testid="stHeader"] {
            display: none;
        }

        .st-key-slide_0_content {
            position: relative;
            z-index: 10;
            padding: 92px 48px 96px 48px;
            min-height: calc(100vh - 124px);
            display: flex;
            align-items: center;
            margin-top: 0;
        }
        .st-key-slide_0_content > div {
            width: 100%;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


# ========== Components ==========


def page_header(kicker: str, title: str, subtitle: str = "") -> None:
    inject_base_styles()


def top_app_bar(current_step: int) -> None:
    """Fixed top app bar with perfectly centered title."""
    st.markdown(
        f"""
        <div class="rs-topbar">
            <div style="flex:1; display:flex; align-items:center;">
                <span class="rs-topbar-brand">RastroSeguro</span>
            </div>
            <div style="flex:2; display:flex; justify-content:center;">
                <div class="rs-topbar-center">
                    Evaluador Preliminar de Riesgo
                </div>
            </div>
            <div style="flex:1; display:flex; align-items:center; justify-content:flex-end; gap:0.75rem;">
                <span class="material-symbols-outlined">notifications</span>
                <span class="material-symbols-outlined">settings</span>
                <div class="rs-topbar-avatar">
                    <div style="width:100%;height:100%;background:var(--rs-surface-high);display:flex;align-items:center;justify-content:center;">
                        <span class="material-symbols-outlined" style="font-size:1.1rem;color:var(--rs-on-muted);">person</span>
                    </div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def progress_track(current_step: int, total_steps: int = 3) -> None:
    """Thin progress bar below top bar."""
    pct = int(((current_step + 1) / total_steps) * 100)
    st.markdown(
        f"""
        <div class="rs-top-track">
            <div class="rs-top-track-fill" style="width:{pct}%;">
                <div class="rs-top-track-dot"></div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def bottom_nav_bar(current_step: int, total_steps: int = 3, is_last: bool = False) -> None:
    """Fixed bottom navigation bar with progress bar and step text."""
    pct = int(((current_step + 1) / total_steps) * 100)
    st.markdown(
        f"""
        <div class="rs-bottombar">
            <div style="flex:1;"></div>
            <div class="rs-bottombar-dots">
                <div class="rs-bottombar-progress-container">
                    <div class="rs-bottombar-progress-fill" style="width:{pct}%;"></div>
                </div>
                <span class="rs-bottombar-step-text">STEP 0{current_step + 1} / 0{total_steps}</span>
            </div>
            <div style="flex:1;"></div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def ai_fab() -> None:
    """AI assistant floating action button."""
    st.markdown(
        """
        <div class="rs-fab-container">
            <div class="rs-fab">
                <span class="material-symbols-outlined">spark</span>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def ethic_note() -> None:
    st.markdown(
        """
        <div class="rs-ethic-note">
            La IA alerta y explica patrones de riesgo. No confirma fraude, no acusa y no rechaza reclamos:
            prioriza casos para revisión humana trazable.
        </div>
        """,
        unsafe_allow_html=True,
    )


def slide_header(kicker: str, title: str, subtitle: str = "") -> None:
    st.markdown(
        f"""
        <div class="rs-slide-enter">
            <div class="rs-kicker">{html_mod.escape(kicker)}</div>
            <div class="rs-slide-title">{html_mod.escape(title)}</div>
            {f'<div class="rs-slide-subtitle">{html_mod.escape(subtitle)}</div>' if subtitle else ''}
        </div>
        """,
        unsafe_allow_html=True,
    )


def expediente_header(claim_id: str, status: str = "CARGA COMPLETA") -> None:
    st.markdown(
        f"""
        <div class="rs-expediente-header">
            <div class="rs-expediente-id">
                <span class="material-symbols-outlined">description</span>
                Expediente {html_mod.escape(claim_id)}
            </div>
            <div class="rs-badge-complete">
                <span class="material-symbols-outlined">check_circle</span>
                {html_mod.escape(status)}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def metric_field(label: str, value: str, highlight: bool = False) -> None:
    cls = "is-highlight" if highlight else ""
    st.markdown(
        f"""
        <div>
            <div class="rs-metric-label">{html_mod.escape(label)}</div>
            <div class="rs-metric-value {cls}">{html_mod.escape(value)}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def narrative_card(text: str) -> None:
    st.markdown(
        f"""
        <div class="rs-narrative">
            <div class="rs-narrative-title">
                <span class="material-symbols-outlined">history_edu</span>
                Narrativa del Siniestro
            </div>
            <div class="rs-narrative-body">{html_mod.escape(text)}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def document_list(docs: list[dict[str, str]]) -> None:
    """Render a list of documents with verification status.

    Each doc dict: {"name": "file.pdf", "icon": "picture_as_pdf"}
    """
    items = []
    for doc in docs:
        icon = doc.get("icon", "attach_file")
        name = html_mod.escape(doc["name"])
        items.append(
            f'<div class="rs-doc-item">'
            f'<div class="rs-doc-item-left">'
            f'<span class="material-symbols-outlined">{icon}</span>'
            f'<span>{name}</span>'
            f'</div>'
            f'<span class="material-symbols-outlined rs-doc-item-check">done</span>'
            f'</div>'
        )
    
    html_content = (
        f'<div style="font-family:\'Montserrat\';font-size:1.15rem;font-weight:700;color:var(--rs-primary);margin-bottom:1rem;">'
        f'Documentación'
        f'</div>'
        f'{"".join(items)}'
    )
    st.markdown(html_content, unsafe_allow_html=True)


def drop_zone_placeholder(text: str = "Arrastre archivos adicionales aquí para enriquecer el resumen del caso.") -> None:
    st.markdown(
        f"""
        <div style="
            flex:1;
            border:2px dashed rgba(69,70,77,0.6);
            border-radius:12px;
            padding:1.5rem;
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            text-align:center;opacity:0.7;margin-top:0.75rem;
        ">
            <span class="material-symbols-outlined" style="font-size:2rem;color:var(--rs-secondary);margin-bottom:0.5rem;">cloud_upload</span>
            <p style="font-size:0.75rem;font-weight:600;color:var(--rs-on-muted);">{html_mod.escape(text)}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )


def location_card(city: str) -> None:
    """Map placeholder card with city name."""
    st.markdown(
        f"""
        <div class="rs-location-card" style="height:200px;position:relative;background:var(--rs-surface-container);">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0.2;">
                <span class="material-symbols-outlined" style="font-size:5rem;color:var(--rs-primary);">map</span>
            </div>
            <div class="rs-location-overlay">
                <div class="rs-location-label">
                    <span class="material-symbols-outlined">location_on</span>
                    <span>Ubicación Confirmada</span>
                </div>
                <div class="rs-location-value">{html_mod.escape(city)}</div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def prep_card(variables_count: int = 14) -> None:
    st.markdown(
        f"""
        <div class="rs-prep-card">
            <div>
                <div class="rs-metric-label">Preparación de Análisis</div>
                <div style="color:var(--rs-on-surface);font-size:0.95rem;">
                    Motor de IA cargado con {variables_count} variables extraídas de la narrativa y telemetría.
                </div>
            </div>
            <div class="rs-spinner"></div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def score_component_card(
    icon: str, title: str, points: int, description: str, bar_pct: int, severity: str = "moderate"
) -> None:
    """Individual score component card for the analysis grid.

    severity: "critical" | "moderate" | "low"
    """
    pts_sign = "+" if points >= 0 else ""
    pts_cls = "is-positive" if points >= 15 else "is-negative" if points < 0 else "is-moderate"
    card_cls = "is-critical" if severity == "critical" else ""
    bar_color = "var(--rs-risk-rose)" if severity == "critical" else "var(--rs-primary)" if severity == "moderate" else "var(--rs-secondary-container)"

    st.markdown(
        f"""
        <div class="rs-score-card {card_cls}">
            <div class="rs-score-card-top">
                <span class="material-symbols-outlined">{icon}</span>
                <span class="rs-score-card-pts {pts_cls}">{pts_sign}{points} pts</span>
            </div>
            <div class="rs-score-card-title">{html_mod.escape(title)}</div>
            <div class="rs-score-card-desc">{html_mod.escape(description)}</div>
            <div class="rs-score-card-bar">
                <div class="rs-score-card-bar-fill" style="width:{max(0, min(100, bar_pct))}%;background:{bar_color};"></div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def risk_badge(nivel: str) -> str:
    style = RISK_COLORS.get(nivel, RISK_COLORS["Verde"])
    dot = style["dot"]
    return (
        f"<span style='display:inline-flex;align-items:center;gap:0.35rem;"
        f"padding:0.3rem 0.75rem;border-radius:999px;font-size:0.8rem;font-weight:800;"
        f"background:{style['bg']};color:{style['fg']};border:1px solid rgba(255,255,255,0.12);'>"
        f"{dot} {nivel}</span>"
    )


def risk_alert(nivel: str, action: str) -> None:
    """Large risk level alert box."""
    cls_map = {"Rojo": "is-critical", "Amarillo": "is-warning", "Verde": "is-safe"}
    color_map = {"Rojo": "var(--rs-risk-rose)", "Amarillo": "var(--rs-risk-amber)", "Verde": "var(--rs-risk-emerald)"}
    label_map = {"Rojo": "Nivel: Crítico", "Amarillo": "Nivel: Moderado", "Verde": "Nivel: Bajo"}

    cls = cls_map.get(nivel, "is-safe")
    color = color_map.get(nivel, "var(--rs-risk-emerald)")
    label = label_map.get(nivel, "Nivel: Normal")

    st.markdown(
        f"""
        <div class="rs-risk-alert {cls}">
            <div class="rs-risk-alert-title" style="color:{color};">{label}</div>
            <div class="rs-risk-alert-body">Acción sugerida: {html_mod.escape(action)}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def risk_pills(nivel: str) -> None:
    """Small status pills like 'Alta Probabilidad' and 'Auditable'."""
    dot_color = {"Rojo": "var(--rs-risk-rose)", "Amarillo": "var(--rs-risk-amber)", "Verde": "var(--rs-risk-emerald)"}
    prob_label = {"Rojo": "Alta Probabilidad", "Amarillo": "Probabilidad Media", "Verde": "Baja Probabilidad"}

    st.markdown(
        f"""
        <div class="rs-pill-row">
            <div class="rs-pill">
                <div class="rs-pill-dot" style="background:{dot_color.get(nivel, 'var(--rs-on-muted)')};"></div>
                {prob_label.get(nivel, 'Normal')}
            </div>
            <div class="rs-pill">
                <span class="material-symbols-outlined" style="font-size:0.85rem;">visibility</span>
                Auditable
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def disclaimer() -> None:
    st.markdown(
        '<div class="rs-disclaimer">El score no confirma fraude. Prioriza revisión humana.</div>',
        unsafe_allow_html=True,
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
        <div style="
            background:var(--rs-surface-container);
            border:1px solid var(--rs-outline);
            border-radius:12px;
            padding:1rem 1.1rem;
            margin-bottom:0.75rem;
            box-shadow:0 8px 20px rgba(0,0,0,0.18);
        ">
            <strong>{title}</strong><br/>
            <span style="color:var(--rs-on-muted);font-size:0.92rem;">{body}</span>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ========== Sidebar ==========


def _sidebar_nav_styles(active_step: int) -> str:
    styles = []
    for idx in range(3):
        if idx == active_step:
            styles.append(
                f"""
                .st-key-sidebar_nav_{idx} button,
                section[data-testid="stSidebar"] .st-key-sidebar_nav_{idx} button {{
                    background: var(--rs-secondary-container) !important;
                    color: #e6ecff !important;
                    border: 1px solid rgba(173, 198, 255, 0.22) !important;
                    font-weight: 700 !important;
                }}
                """
            )
        elif idx < active_step:
            styles.append(
                f"""
                .st-key-sidebar_nav_{idx} button,
                section[data-testid="stSidebar"] .st-key-sidebar_nav_{idx} button {{
                    background: rgba(16, 185, 129, 0.10) !important;
                    color: #6ee7b7 !important;
                    border: 1px solid rgba(110, 231, 183, 0.18) !important;
                }}
                """
            )
        else:
            styles.append(
                f"""
                .st-key-sidebar_nav_{idx} button,
                section[data-testid="stSidebar"] .st-key-sidebar_nav_{idx} button {{
                    background: transparent !important;
                    color: var(--rs-on-muted) !important;
                    border: 1px solid transparent !important;
                }}
                .st-key-sidebar_nav_{idx} button:hover,
                section[data-testid="stSidebar"] .st-key-sidebar_nav_{idx} button:hover {{
                    background: var(--rs-surface-highest) !important;
                    color: var(--rs-on-surface) !important;
                }}
                """
            )
    return "".join(styles)


def sidebar_branding(active_step: int = 0, visible: bool = True) -> None:
    inject_base_styles()
    if not visible:
        return

    steps = [
        {"label": "Carga", "icon": "upload_file", "index": 0},
        {"label": "Resumen", "icon": "analytics", "index": 1},
        {"label": "Análisis IA", "icon": "psychology", "index": 2},
    ]

    with st.container(key="rs_custom_sidebar_panel"):
        st.markdown(f"<style>{_sidebar_nav_styles(active_step)}</style>", unsafe_allow_html=True)
        st.markdown(
            """
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.5rem;">
                <div style="background:var(--rs-primary-container);border-radius:8px;padding:0.5rem;display:flex;align-items:center;justify-content:center;">
                    <span class="material-symbols-outlined" style="color:var(--rs-primary);font-variation-settings:'FILL' 1;">security</span>
                </div>
                <div>
                    <div style="font-family:'Montserrat';font-size:1.05rem;font-weight:700;color:var(--rs-primary);line-height:1.2;">RastroSeguro</div>
                    <div style="color:var(--rs-on-muted);font-size:0.8rem;">Expert Intelligence</div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        for step in steps:
            idx = step["index"]
            if st.button(
                step["label"],
                key=f"sidebar_nav_{idx}",
                width="stretch",
                type="secondary",
            ):
                st.session_state.slide = idx
                st.rerun()

        st.markdown(
            """
            <div style="margin-top:auto;padding-top:1rem;border-top:1px solid var(--rs-outline);">
                <div style="
                    background:rgba(15,23,42,0.5);
                    border:1px solid rgba(69,70,77,0.3);
                    border-radius:12px;
                    padding:0.6rem 0.75rem;
                    margin-bottom:0.85rem;
                ">
                    <p style="font-size:0.68rem;color:var(--rs-secondary);line-height:1.45;font-style:italic;margin:0;">
                        La IA alerta y explica. No acusa ni rechaza reclamos.
                    </p>
                </div>
                <div style="display:flex;align-items:center;gap:0.55rem;color:var(--rs-on-muted);font-size:0.88rem;padding:0.45rem 0.2rem;">
                    <span class="material-symbols-outlined" style="font-size:1.15rem;">help</span>
                    <span>Ayuda</span>
                </div>
                <div style="display:flex;align-items:center;gap:0.55rem;color:var(--rs-on-muted);font-size:0.88rem;padding:0.45rem 0.2rem;">
                    <span class="material-symbols-outlined" style="font-size:1.15rem;">logout</span>
                    <span>Cerrar Sesión</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )
