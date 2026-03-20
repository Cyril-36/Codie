"""Code metrics calculator — 100% local, zero external dependencies.

Computes structural metrics: line counts, function/class stats,
comment ratio, import count, and a simplified Maintainability Index.
"""

from __future__ import annotations

import ast
import math
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


def compute_metrics(code: str, language: str) -> Dict[str, Any]:
    """Compute code quality metrics for a given snippet."""
    lang = language.lower()

    if lang == "python":
        return _python_metrics(code)
    if lang in ("javascript", "typescript", "js", "ts"):
        return _js_ts_metrics(code)
    if lang == "java":
        return _java_metrics(code)

    # Fallback: basic line counting
    return _basic_metrics(code)


# ── Python metrics (stdlib ast) ──────────────────────────────────────

def _python_metrics(code: str) -> Dict[str, Any]:
    lines = code.splitlines()
    total_lines = len(lines)

    blank_lines = sum(1 for l in lines if not l.strip())
    comment_lines = sum(1 for l in lines if l.strip().startswith("#"))
    code_lines = total_lines - blank_lines - comment_lines

    try:
        tree = ast.parse(code)
    except SyntaxError:
        return {
            "lines": total_lines,
            "code_lines": code_lines,
            "blank_lines": blank_lines,
            "comment_lines": comment_lines,
            "comment_ratio": round(comment_lines / max(code_lines, 1), 3),
            "functions": 0,
            "classes": 0,
            "imports": 0,
            "avg_function_length": 0,
            "max_function_length": 0,
            "maintainability_index": 0,
        }

    functions: List[ast.FunctionDef | ast.AsyncFunctionDef] = []
    classes: List[ast.ClassDef] = []
    imports = 0

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            functions.append(node)
        elif isinstance(node, ast.ClassDef):
            classes.append(node)
        elif isinstance(node, (ast.Import, ast.ImportFrom)):
            imports += 1

    # Function length stats
    func_lengths = []
    for fn in functions:
        if hasattr(fn, "end_lineno") and fn.end_lineno:
            func_lengths.append(fn.end_lineno - fn.lineno + 1)

    avg_func_len = round(sum(func_lengths) / len(func_lengths), 1) if func_lengths else 0
    max_func_len = max(func_lengths) if func_lengths else 0

    # Simplified Maintainability Index (Microsoft formula approximation)
    # MI = max(0, (171 - 5.2 * ln(V) - 0.23 * CC - 16.2 * ln(LOC)) * 100 / 171)
    # We use a simplified version based on LOC, comment ratio, and complexity
    mi = _simplified_maintainability_index(
        code_lines, comment_lines, len(functions), max_func_len
    )

    return {
        "lines": total_lines,
        "code_lines": code_lines,
        "blank_lines": blank_lines,
        "comment_lines": comment_lines,
        "comment_ratio": round(comment_lines / max(code_lines, 1), 3),
        "functions": len(functions),
        "classes": len(classes),
        "imports": imports,
        "avg_function_length": avg_func_len,
        "max_function_length": max_func_len,
        "maintainability_index": mi,
    }


# ── JS/TS metrics (line-based) ───────────────────────────────────────

def _js_ts_metrics(code: str) -> Dict[str, Any]:
    lines = code.splitlines()
    total_lines = len(lines)

    blank_lines = 0
    comment_lines = 0
    functions = 0
    classes = 0
    imports = 0
    in_block_comment = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            blank_lines += 1
            continue

        if in_block_comment:
            comment_lines += 1
            if "*/" in stripped:
                in_block_comment = False
            continue

        if stripped.startswith("/*"):
            comment_lines += 1
            if "*/" not in stripped:
                in_block_comment = True
            continue

        if stripped.startswith("//"):
            comment_lines += 1
            continue

        # Count structures
        if stripped.startswith("function ") or "=> {" in stripped or "=>" in stripped:
            functions += 1
        if stripped.startswith("class "):
            classes += 1
        if stripped.startswith("import ") or stripped.startswith("require("):
            imports += 1

    code_lines = total_lines - blank_lines - comment_lines
    mi = _simplified_maintainability_index(code_lines, comment_lines, functions, 0)

    return {
        "lines": total_lines,
        "code_lines": code_lines,
        "blank_lines": blank_lines,
        "comment_lines": comment_lines,
        "comment_ratio": round(comment_lines / max(code_lines, 1), 3),
        "functions": functions,
        "classes": classes,
        "imports": imports,
        "avg_function_length": 0,
        "max_function_length": 0,
        "maintainability_index": mi,
    }


# ── Java metrics (line-based) ────────────────────────────────────────

def _java_metrics(code: str) -> Dict[str, Any]:
    lines = code.splitlines()
    total_lines = len(lines)

    blank_lines = 0
    comment_lines = 0
    functions = 0
    classes = 0
    imports = 0
    in_block_comment = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            blank_lines += 1
            continue

        if in_block_comment:
            comment_lines += 1
            if "*/" in stripped:
                in_block_comment = False
            continue

        if stripped.startswith("/*") or stripped.startswith("/**"):
            comment_lines += 1
            if "*/" not in stripped:
                in_block_comment = True
            continue

        if stripped.startswith("//"):
            comment_lines += 1
            continue

        if stripped.startswith("import "):
            imports += 1
        if stripped.startswith("class ") or stripped.startswith("public class "):
            classes += 1
        # Method detection (simplified)
        if ("public " in stripped or "private " in stripped or "protected " in stripped) \
                and "(" in stripped and ")" in stripped and "{" in stripped:
            functions += 1

    code_lines = total_lines - blank_lines - comment_lines
    mi = _simplified_maintainability_index(code_lines, comment_lines, functions, 0)

    return {
        "lines": total_lines,
        "code_lines": code_lines,
        "blank_lines": blank_lines,
        "comment_lines": comment_lines,
        "comment_ratio": round(comment_lines / max(code_lines, 1), 3),
        "functions": functions,
        "classes": classes,
        "imports": imports,
        "avg_function_length": 0,
        "max_function_length": 0,
        "maintainability_index": mi,
    }


# ── Basic fallback ───────────────────────────────────────────────────

def _basic_metrics(code: str) -> Dict[str, Any]:
    lines = code.splitlines()
    total_lines = len(lines)
    blank_lines = sum(1 for l in lines if not l.strip())
    return {
        "lines": total_lines,
        "code_lines": total_lines - blank_lines,
        "blank_lines": blank_lines,
        "comment_lines": 0,
        "comment_ratio": 0,
        "functions": 0,
        "classes": 0,
        "imports": 0,
        "avg_function_length": 0,
        "max_function_length": 0,
        "maintainability_index": 50.0,
    }


# ── Maintainability Index ────────────────────────────────────────────

def _simplified_maintainability_index(
    code_lines: int,
    comment_lines: int,
    func_count: int,
    max_func_length: int,
) -> float:
    """Simplified Maintainability Index (0-100 scale).

    Based on Microsoft's MI formula but simplified:
    - Penalizes large files, long functions, and low comment ratios
    - Rewards modular code with good documentation
    """
    if code_lines == 0:
        return 100.0

    # Start at 100, subtract penalties
    mi = 100.0

    # Size penalty: large files are harder to maintain
    if code_lines > 500:
        mi -= 20
    elif code_lines > 200:
        mi -= 10
    elif code_lines > 100:
        mi -= 5

    # Long function penalty
    if max_func_length > 100:
        mi -= 20
    elif max_func_length > 50:
        mi -= 10
    elif max_func_length > 25:
        mi -= 5

    # Low comment ratio penalty
    comment_ratio = comment_lines / max(code_lines, 1)
    if comment_ratio < 0.05:
        mi -= 10
    elif comment_ratio < 0.1:
        mi -= 5

    # Modularity bonus: having functions is better than monolithic code
    if func_count == 0 and code_lines > 20:
        mi -= 10
    elif func_count > 0:
        # Average lines per function — smaller is better
        avg = code_lines / func_count
        if avg < 20:
            mi += 5

    return round(max(0, min(100, mi)), 1)
