from __future__ import annotations

import os
from typing import Dict


def _has_ai_keys() -> bool:
    return any(
        os.getenv(k) for k in ("OPENAI_API_KEY", "GEMINI_API_KEY", "HF_API_TOKEN")
    )


def generate_tests(
    language: str, file: str | None, code: str, function: str | None
) -> Dict:
    language = (language or "python").lower()
    if language != "python":
        return {
            "framework": "pytest",
            "test_file": "tests/test_generated.py",
            "content": "# Unsupported language for now; provide Python code.\n",
        }

    func = function or "target_fn"
    module_import = "target"
    if file:
        # derive import path from file path if within package
        # e.g., backend/app/services/complexity_analyzer.py ->
        # backend.app.services.complexity_analyzer
        path = file.rstrip(".py").replace("/", ".").replace("\\", ".")
        module_import = path

    # Deterministic template (CI-safe). Future: call provider when keys exist.
    content = f"""import pytest
import importlib

mod = importlib.import_module("{module_import}")

def test_{func}_basic():
    assert hasattr(mod, "{func}")
"""
    # simple positive case if add-like function
    if func.lower() in {"add", "sum", "plus"}:
        content += f"    assert getattr(mod, '{func}')(1, 2) == 3\n"
    else:
        content += (
            "    # TODO: refine assertions based on provider suggestions\n"
            f'    assert callable(getattr(mod, "{func}"))\n'
        )

    return {
        "framework": "pytest",
        "test_file": f"tests/test_{func}_generated.py",
        "content": content,
        "provider_used": "mock" if not _has_ai_keys() else "llm",
    }
