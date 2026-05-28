"""Executive report routes."""

from __future__ import annotations

from fastapi import APIRouter, Query

from api.routes._errors import run_endpoint
from src.reports.generate_report import generate_report_dict, generate_report_markdown

router = APIRouter(prefix="/api", tags=["reports"])


@router.get("/report")
def report(format: str = Query(default="dict", pattern="^(dict|markdown)$"), top_limit: int = Query(default=10, ge=1, le=50)):
    if format == "markdown":
        return run_endpoint(lambda: {"format": "markdown", "content": generate_report_markdown(top_limit=top_limit)})
    return run_endpoint(lambda: generate_report_dict(top_limit=top_limit))
