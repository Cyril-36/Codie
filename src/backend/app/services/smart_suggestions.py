"""Smart suggestion aggregation engine.

Combines results from local_analyzer, code_metrics, complexity_analyzer,
and code_security into a unified list of actionable suggestions.
Runs entirely locally — no API keys required.
"""

from __future__ import annotations

import logging
from typing import List, Dict, Any

from .local_analyzer import analyze_locally
from .code_metrics import compute_metrics
from .code_security import scan_code_security
from .complexity_analyzer import compute_complexity

logger = logging.getLogger(__name__)

# Severity ordering for sorting
_SEVERITY_ORDER = {"critical": 0, "error": 1, "warning": 2, "info": 3}


def generate_suggestions(
    code: str,
    language: str,
    show_all: bool = False,
    max_suggestions: int = 30,
) -> List[str]:
    """Generate a list of suggestion strings from all local analyzers.

    This is the drop-in replacement for AI-generated suggestions.
    Returns plain strings for backward compatibility with the existing
    `analyze_code()` return type.
    """
    findings = generate_structured_suggestions(code, language, show_all, max_suggestions)
    return [f["message"] for f in findings]


def generate_structured_suggestions(
    code: str,
    language: str,
    show_all: bool = False,
    max_suggestions: int = 30,
) -> List[Dict[str, Any]]:
    """Generate structured suggestions from all local analysis engines.

    Returns list of dicts with: category, severity, message, line,
    fix_suggestion, confidence, source.
    """
    all_findings: List[Dict[str, Any]] = []

    # 1. Local static analysis (AST-based)
    try:
        local_issues = analyze_locally(code, language)
        for issue in local_issues:
            issue["source"] = "local_analyzer"
            all_findings.append(issue)
    except Exception as e:
        logger.warning(f"Local analyzer failed: {e}")

    # 2. Code security scan
    try:
        security_issues = scan_code_security(code, language)
        for issue in security_issues:
            issue["source"] = "security_scanner"
            all_findings.append(issue)
    except Exception as e:
        logger.warning(f"Security scanner failed: {e}")

    # 3. Metrics-based suggestions
    try:
        metrics = compute_metrics(code, language)
        _add_metric_suggestions(metrics, all_findings)
    except Exception as e:
        logger.warning(f"Metrics computation failed: {e}")

    # 4. Complexity-based suggestions
    try:
        complexity = compute_complexity(language, code)
        _add_complexity_suggestions(complexity, code, all_findings)
    except Exception as e:
        logger.warning(f"Complexity computation failed: {e}")

    # Deduplicate by message similarity
    seen_messages = set()
    unique_findings = []
    for f in all_findings:
        msg_key = f["message"].lower()[:60]
        if msg_key not in seen_messages:
            seen_messages.add(msg_key)
            unique_findings.append(f)

    # Sort by severity (critical first), then by confidence (highest first)
    unique_findings.sort(
        key=lambda f: (
            _SEVERITY_ORDER.get(f.get("severity", "info"), 3),
            -f.get("confidence", 0.5),
        )
    )

    # Filter based on show_all
    if not show_all:
        unique_findings = [
            f for f in unique_findings
            if f.get("severity") in ("critical", "error", "warning")
            or f.get("confidence", 0) >= 0.7
        ]

    return unique_findings[:max_suggestions]


def _add_metric_suggestions(metrics: Dict[str, Any], findings: List[Dict]) -> None:
    """Add suggestions based on code metrics."""

    mi = metrics.get("maintainability_index", 100)
    if mi < 30:
        findings.append({
            "category": "maintainability",
            "severity": "warning",
            "message": f"Low maintainability index ({mi}/100) — code needs restructuring",
            "line": None,
            "fix_suggestion": "Break into smaller modules, add documentation, and reduce function length.",
            "confidence": 0.9,
            "source": "metrics",
        })
    elif mi < 60:
        findings.append({
            "category": "maintainability",
            "severity": "info",
            "message": f"Moderate maintainability index ({mi}/100) — room for improvement",
            "line": None,
            "fix_suggestion": "Consider adding docstrings and breaking long functions.",
            "confidence": 0.7,
            "source": "metrics",
        })

    comment_ratio = metrics.get("comment_ratio", 0)
    code_lines = metrics.get("code_lines", 0)
    if code_lines > 50 and comment_ratio < 0.05:
        findings.append({
            "category": "documentation",
            "severity": "info",
            "message": f"Very low comment ratio ({comment_ratio:.1%}) — add comments for complex logic",
            "line": None,
            "fix_suggestion": "Add comments explaining the 'why', not the 'what'.",
            "confidence": 0.6,
            "source": "metrics",
        })

    max_func_len = metrics.get("max_function_length", 0)
    if max_func_len > 50:
        findings.append({
            "category": "complexity",
            "severity": "warning",
            "message": f"Longest function is {max_func_len} lines — extract helper functions",
            "line": None,
            "fix_suggestion": "Functions over 50 lines are hard to test and maintain. Extract logical blocks.",
            "confidence": 0.85,
            "source": "metrics",
        })


def _add_complexity_suggestions(
    complexity: float, code: str, findings: List[Dict]
) -> None:
    """Add suggestions based on cyclomatic complexity."""
    if complexity > 15:
        findings.append({
            "category": "complexity",
            "severity": "warning",
            "message": f"High cyclomatic complexity ({complexity}) — simplify control flow",
            "line": None,
            "fix_suggestion": "Reduce branching with early returns, guard clauses, or strategy pattern.",
            "confidence": 0.9,
            "source": "complexity",
        })
    elif complexity > 10:
        findings.append({
            "category": "complexity",
            "severity": "info",
            "message": f"Moderate cyclomatic complexity ({complexity})",
            "line": None,
            "fix_suggestion": "Consider using early returns or extracting complex conditions.",
            "confidence": 0.7,
            "source": "complexity",
        })
