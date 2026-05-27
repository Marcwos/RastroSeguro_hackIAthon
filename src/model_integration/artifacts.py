"""Safe loading and unpacking of model artifacts."""

from __future__ import annotations

from pathlib import Path
from typing import Any


def load_joblib_artifact(path: Path) -> Any | None:
    """Load a joblib artifact if available.

    Returns None when the file or dependency is missing so the scoring pipeline
    can continue with neutral model scores.
    """
    if not path.exists():
        return None
    try:
        import joblib
    except Exception:
        return None
    return joblib.load(path)


def unpack_model_artifact(artifact: Any) -> tuple[Any, list[str] | None, dict[str, Any]]:
    """Support plain sklearn models or dict artifacts with metadata."""
    if isinstance(artifact, dict):
        model = artifact.get("model") or artifact.get("estimator")
        feature_columns = artifact.get("feature_columns") or artifact.get("features")
        metadata = {key: value for key, value in artifact.items() if key not in {"model", "estimator"}}
        return model, list(feature_columns) if feature_columns else None, metadata

    feature_names = getattr(artifact, "feature_names_in_", None)
    return artifact, list(feature_names) if feature_names is not None else None, {}
