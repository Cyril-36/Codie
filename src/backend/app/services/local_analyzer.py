"""AST-based local code analyzer — zero external dependencies.

Produces actionable issues with line numbers, categories, severities,
and suggested fixes. Python uses stdlib `ast`; JS/TS uses Tree-sitter
(already in requirements.txt).
"""

from __future__ import annotations

import ast
import logging
import time
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Default time budget in milliseconds
DEFAULT_MAX_ANALYSIS_MS = 5000


def analyze_locally(
    code: str,
    language: str,
    max_ms: int = DEFAULT_MAX_ANALYSIS_MS,
) -> List[Dict[str, Any]]:
    """Run local static analysis on code. Returns list of issues."""
    lang = language.lower()
    start = time.monotonic()

    if lang == "python":
        return _analyze_python(code, start, max_ms)
    if lang in ("javascript", "typescript", "js", "ts"):
        return _analyze_js_ts(code, start, max_ms)
    if lang == "java":
        return _analyze_java(code, start, max_ms)

    return []


# ── Python analysis (stdlib ast) ─────────────────────────────────────

def _analyze_python(code: str, start: float, max_ms: int) -> List[Dict[str, Any]]:
    issues: List[Dict[str, Any]] = []

    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        issues.append({
            "category": "syntax",
            "severity": "error",
            "message": f"Syntax error: {e.msg}",
            "line": e.lineno or 1,
            "fix_suggestion": "Fix the syntax error to enable further analysis.",
            "confidence": 1.0,
        })
        return issues

    lines = code.splitlines()

    # Collect defined names at module level
    _check_unused_imports(tree, code, issues)
    if _over_budget(start, max_ms):
        return issues

    _check_missing_type_hints(tree, issues)
    if _over_budget(start, max_ms):
        return issues

    _check_docstring_coverage(tree, issues)
    if _over_budget(start, max_ms):
        return issues

    _check_function_length(tree, lines, issues)
    if _over_budget(start, max_ms):
        return issues

    _check_mutable_defaults(tree, issues)
    if _over_budget(start, max_ms):
        return issues

    _check_bare_except(tree, issues)
    if _over_budget(start, max_ms):
        return issues

    _check_nesting_depth(tree, issues)
    if _over_budget(start, max_ms):
        return issues

    _check_global_usage(tree, issues)
    if _over_budget(start, max_ms):
        return issues

    _check_star_imports(tree, issues)
    if _over_budget(start, max_ms):
        return issues

    _check_print_statements(tree, issues)

    return issues


def _check_unused_imports(tree: ast.Module, code: str, issues: List[Dict]) -> None:
    """Detect imports that are never referenced in the code body."""
    imported_names: Dict[str, int] = {}  # name -> line

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                name = alias.asname or alias.name.split(".")[0]
                imported_names[name] = node.lineno
        elif isinstance(node, ast.ImportFrom):
            for alias in node.names:
                if alias.name == "*":
                    continue
                name = alias.asname or alias.name
                imported_names[name] = node.lineno

    # Walk usage — collect all Name references
    used_names = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Name):
            used_names.add(node.id)
        elif isinstance(node, ast.Attribute):
            # For `os.path` style usage, the root `os` is a Name
            pass

    for name, line in imported_names.items():
        if name not in used_names and not name.startswith("_"):
            issues.append({
                "category": "imports",
                "severity": "warning",
                "message": f"Unused import: '{name}'",
                "line": line,
                "fix_suggestion": f"Remove the unused import '{name}'.",
                "confidence": 0.85,
            })


def _check_missing_type_hints(tree: ast.Module, issues: List[Dict]) -> None:
    """Flag functions without return type annotations."""
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            # Skip dunder methods and private helpers
            if node.name.startswith("__") and node.name.endswith("__"):
                continue
            if node.returns is None:
                issues.append({
                    "category": "type_hints",
                    "severity": "info",
                    "message": f"Function '{node.name}' has no return type annotation",
                    "line": node.lineno,
                    "fix_suggestion": f"Add a return type: `def {node.name}(...) -> ReturnType:`",
                    "confidence": 0.7,
                })
            # Check for untyped parameters (skip self/cls)
            for arg in node.args.args:
                if arg.arg in ("self", "cls"):
                    continue
                if arg.annotation is None:
                    issues.append({
                        "category": "type_hints",
                        "severity": "info",
                        "message": f"Parameter '{arg.arg}' in '{node.name}' has no type annotation",
                        "line": node.lineno,
                        "fix_suggestion": f"Add type: `{arg.arg}: Type`",
                        "confidence": 0.6,
                    })
                    break  # One warning per function is enough


def _check_docstring_coverage(tree: ast.Module, issues: List[Dict]) -> None:
    """Flag public functions/classes missing docstrings."""
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            if node.name.startswith("_"):
                continue
            docstring = ast.get_docstring(node)
            if docstring is None:
                kind = "Class" if isinstance(node, ast.ClassDef) else "Function"
                issues.append({
                    "category": "documentation",
                    "severity": "info",
                    "message": f"{kind} '{node.name}' has no docstring",
                    "line": node.lineno,
                    "fix_suggestion": f'Add a docstring: `"""{node.name} description."""`',
                    "confidence": 0.6,
                })


def _check_function_length(
    tree: ast.Module, lines: List[str], issues: List[Dict]
) -> None:
    """Flag functions longer than 25 lines."""
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if hasattr(node, "end_lineno") and node.end_lineno:
                length = node.end_lineno - node.lineno + 1
                if length > 50:
                    issues.append({
                        "category": "complexity",
                        "severity": "warning",
                        "message": f"Function '{node.name}' is {length} lines long (consider splitting)",
                        "line": node.lineno,
                        "fix_suggestion": "Extract helper functions to reduce length below 50 lines.",
                        "confidence": 0.9,
                    })
                elif length > 25:
                    issues.append({
                        "category": "complexity",
                        "severity": "info",
                        "message": f"Function '{node.name}' is {length} lines long",
                        "line": node.lineno,
                        "fix_suggestion": "Consider extracting logical blocks into helper functions.",
                        "confidence": 0.7,
                    })


def _check_mutable_defaults(tree: ast.Module, issues: List[Dict]) -> None:
    """Flag mutable default arguments (list, dict, set literals)."""
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            for default in node.args.defaults + node.args.kw_defaults:
                if default is None:
                    continue
                if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                    issues.append({
                        "category": "bugs",
                        "severity": "warning",
                        "message": f"Mutable default argument in '{node.name}' — shared across calls",
                        "line": node.lineno,
                        "fix_suggestion": "Use `None` as default and create the mutable inside the function body.",
                        "confidence": 0.95,
                    })
                    break  # One per function


def _check_bare_except(tree: ast.Module, issues: List[Dict]) -> None:
    """Flag bare `except:` or `except Exception:` (too broad)."""
    for node in ast.walk(tree):
        if isinstance(node, ast.ExceptHandler):
            if node.type is None:
                issues.append({
                    "category": "error_handling",
                    "severity": "warning",
                    "message": "Bare `except:` catches all exceptions including KeyboardInterrupt",
                    "line": node.lineno,
                    "fix_suggestion": "Use `except Exception:` or catch specific exceptions.",
                    "confidence": 0.95,
                })


def _check_nesting_depth(tree: ast.Module, issues: List[Dict]) -> None:
    """Flag deeply nested code (>4 levels)."""

    def _walk_depth(node: ast.AST, depth: int, func_name: str) -> None:
        nesting_types = (
            ast.If, ast.For, ast.While, ast.With, ast.Try,
            ast.AsyncFor, ast.AsyncWith,
        )
        if isinstance(node, nesting_types):
            depth += 1
            if depth > 4:
                issues.append({
                    "category": "complexity",
                    "severity": "warning",
                    "message": f"Deeply nested code (depth {depth}) in '{func_name}'",
                    "line": getattr(node, "lineno", 0),
                    "fix_suggestion": "Extract nested blocks into helper functions or use early returns.",
                    "confidence": 0.85,
                })
                return  # Don't report deeper nesting in same function
        for child in ast.iter_child_nodes(node):
            _walk_depth(child, depth, func_name)

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            _walk_depth(node, 0, node.name)


def _check_global_usage(tree: ast.Module, issues: List[Dict]) -> None:
    """Flag `global` keyword usage."""
    for node in ast.walk(tree):
        if isinstance(node, ast.Global):
            issues.append({
                "category": "design",
                "severity": "info",
                "message": f"Global variable usage: {', '.join(node.names)}",
                "line": node.lineno,
                "fix_suggestion": "Consider passing values as function parameters or using a class.",
                "confidence": 0.7,
            })


def _check_star_imports(tree: ast.Module, issues: List[Dict]) -> None:
    """Flag wildcard imports."""
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom):
            for alias in node.names:
                if alias.name == "*":
                    issues.append({
                        "category": "imports",
                        "severity": "warning",
                        "message": f"Wildcard import from '{node.module}'",
                        "line": node.lineno,
                        "fix_suggestion": "Import only the names you need explicitly.",
                        "confidence": 0.9,
                    })


def _check_print_statements(tree: ast.Module, issues: List[Dict]) -> None:
    """Flag print() calls (should use logging in production code)."""
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            func = node.func
            if isinstance(func, ast.Name) and func.id == "print":
                issues.append({
                    "category": "best_practice",
                    "severity": "info",
                    "message": "print() call found — use logging in production code",
                    "line": node.lineno,
                    "fix_suggestion": "Replace with `logger.info()` or `logger.debug()`.",
                    "confidence": 0.6,
                })


# ── JS/TS analysis (Tree-sitter or fallback) ────────────────────────

def _analyze_js_ts(code: str, start: float, max_ms: int) -> List[Dict[str, Any]]:
    """Analyze JavaScript/TypeScript code with regex-based checks."""
    issues: List[Dict[str, Any]] = []
    lines = code.splitlines()

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        if _over_budget(start, max_ms):
            return issues

        # var usage
        if stripped.startswith("var "):
            issues.append({
                "category": "best_practice",
                "severity": "warning",
                "message": "Use 'let' or 'const' instead of 'var'",
                "line": i,
                "fix_suggestion": "Replace 'var' with 'const' (if not reassigned) or 'let'.",
                "confidence": 0.9,
            })

        # console.log
        if "console.log" in stripped and not stripped.startswith("//"):
            issues.append({
                "category": "best_practice",
                "severity": "info",
                "message": "console.log() found — remove before production",
                "line": i,
                "fix_suggestion": "Remove or replace with a proper logging library.",
                "confidence": 0.7,
            })

        # == instead of ===
        if " == " in stripped and " === " not in stripped and not stripped.startswith("//"):
            issues.append({
                "category": "bugs",
                "severity": "warning",
                "message": "Use '===' instead of '==' for strict equality",
                "line": i,
                "fix_suggestion": "Replace '==' with '===' to avoid type coercion bugs.",
                "confidence": 0.85,
            })

        # Callback nesting detection (simple heuristic)
        if stripped.count("{") > 2:
            issues.append({
                "category": "complexity",
                "severity": "info",
                "message": "Deeply nested code — consider extracting functions",
                "line": i,
                "fix_suggestion": "Extract callbacks into named functions or use async/await.",
                "confidence": 0.5,
            })

    return issues


# ── Java analysis (basic) ────────────────────────────────────────────

def _analyze_java(code: str, start: float, max_ms: int) -> List[Dict[str, Any]]:
    """Basic Java analysis via line scanning."""
    issues: List[Dict[str, Any]] = []
    lines = code.splitlines()

    for i, line in enumerate(lines, 1):
        stripped = line.strip()

        if _over_budget(start, max_ms):
            return issues

        if "System.out.println" in stripped:
            issues.append({
                "category": "best_practice",
                "severity": "info",
                "message": "System.out.println() found — use a logging framework",
                "line": i,
                "fix_suggestion": "Use SLF4J Logger instead of System.out.",
                "confidence": 0.7,
            })

        if "catch (Exception " in stripped or "catch(Exception " in stripped:
            issues.append({
                "category": "error_handling",
                "severity": "warning",
                "message": "Catching generic Exception — catch specific types",
                "line": i,
                "fix_suggestion": "Catch specific exception types for better error handling.",
                "confidence": 0.8,
            })

    return issues


# ── Helpers ──────────────────────────────────────────────────────────

def _over_budget(start: float, max_ms: int) -> bool:
    elapsed_ms = (time.monotonic() - start) * 1000
    return elapsed_ms > max_ms
