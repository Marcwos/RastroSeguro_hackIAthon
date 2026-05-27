"""Lightweight documentation lookup placeholder.

RAG is intentionally limited to documentation and methodology questions.
Tabular calculations must use tools.py.
"""

from __future__ import annotations

from pathlib import Path

DOC_PATHS = [
    Path("docs/01-guia-general-equipo.md"),
    Path("docs/02-contratos-integracion.md"),
    Path("docs/06-plan-jeremy-cerebro-antifraude.md"),
]


def search_docs(query: str) -> list[dict[str, str]]:
    terms = [term for term in query.lower().split() if len(term) > 3]
    results: list[dict[str, str]] = []
    for path in DOC_PATHS:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        lower = text.lower()
        if any(term in lower for term in terms):
            snippet = text[:700].replace("\n", " ")
            results.append({"source": str(path), "snippet": snippet})
    return results
