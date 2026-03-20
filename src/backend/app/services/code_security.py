"""Local code security scanner — regex-based, zero external dependencies.

Scans source code for common security anti-patterns:
- Hardcoded secrets (API keys, passwords)
- SQL injection (string formatting in queries)
- Command injection (subprocess with shell=True, os.system)
- eval/exec usage
- Insecure deserialization (pickle.loads)
- Insecure random (random module for security)
- Debug mode in production
- Path traversal risks
"""

from __future__ import annotations

import re
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Patterns: (regex, category, severity, message, fix)
_PYTHON_PATTERNS: List[tuple] = [
    # Hardcoded secrets
    (
        r"""(?:password|passwd|pwd|secret|api_key|apikey|token|auth)\s*=\s*['\"][^'"]{4,}['\"]""",
        "security", "critical",
        "Hardcoded secret or credential detected",
        "Use environment variables or a secrets manager instead of hardcoding.",
    ),
    # SQL injection
    (
        r"""(?:execute|cursor\.execute)\s*\(\s*[f'"].*\{.*\}""",
        "security", "critical",
        "Potential SQL injection — string formatting in SQL query",
        "Use parameterized queries: cursor.execute('SELECT * FROM t WHERE id = ?', (id,))",
    ),
    (
        r"""(?:execute|cursor\.execute)\s*\(.+%\s""",
        "security", "critical",
        "Potential SQL injection — % formatting in SQL query",
        "Use parameterized queries instead of string % formatting.",
    ),
    # Command injection
    (
        r"""os\.system\s*\(""",
        "security", "critical",
        "os.system() is vulnerable to command injection",
        "Use subprocess.run() with a list of arguments (no shell=True).",
    ),
    (
        r"""subprocess\.(?:call|run|Popen)\s*\([^)]*shell\s*=\s*True""",
        "security", "warning",
        "subprocess with shell=True — command injection risk",
        "Pass commands as a list without shell=True.",
    ),
    # eval/exec
    (
        r"""\beval\s*\(""",
        "security", "critical",
        "eval() can execute arbitrary code — serious security risk",
        "Use ast.literal_eval() for safe evaluation of literals, or find an alternative approach.",
    ),
    (
        r"""\bexec\s*\(""",
        "security", "warning",
        "exec() executes arbitrary code — use with extreme caution",
        "Avoid exec() in production code; use specific functions instead.",
    ),
    # Insecure deserialization
    (
        r"""pickle\.loads?\s*\(""",
        "security", "warning",
        "pickle deserialization is unsafe with untrusted data",
        "Use JSON or a safe serialization format for untrusted data.",
    ),
    (
        r"""yaml\.load\s*\([^)]*\)(?!.*Loader)""",
        "security", "warning",
        "yaml.load() without safe Loader can execute arbitrary code",
        "Use yaml.safe_load() instead.",
    ),
    # Insecure random
    (
        r"""(?:import\s+random|from\s+random\s+import)""",
        "security", "info",
        "Standard random module is not cryptographically secure",
        "Use secrets module for security-sensitive randomness.",
    ),
    # Debug mode
    (
        r"""(?:DEBUG|debug)\s*=\s*True""",
        "security", "warning",
        "Debug mode enabled — disable in production",
        "Set DEBUG=False for production deployments.",
    ),
    # Hardcoded IPs/URLs
    (
        r"""(?:https?://(?:localhost|127\.0\.0\.1|0\.0\.0\.0))""",
        "security", "info",
        "Hardcoded localhost URL — may not work in production",
        "Use environment variables for service URLs.",
    ),
    # assert for validation
    (
        r"""^\s*assert\s+""",
        "security", "info",
        "assert is removed with -O flag — don't use for input validation",
        "Use explicit if/raise for input validation that must always run.",
    ),
]

_JS_TS_PATTERNS: List[tuple] = [
    # Hardcoded secrets
    (
        r"""(?:password|secret|api_key|apikey|token|auth)\s*[:=]\s*['\"][^'"]{4,}['\"]""",
        "security", "critical",
        "Hardcoded secret or credential detected",
        "Use environment variables (process.env) instead.",
    ),
    # eval
    (
        r"""\beval\s*\(""",
        "security", "critical",
        "eval() can execute arbitrary code",
        "Avoid eval(); use JSON.parse() for data, or Function constructor if needed.",
    ),
    # innerHTML (XSS)
    (
        r"""\.innerHTML\s*=""",
        "security", "warning",
        "innerHTML assignment — potential XSS vulnerability",
        "Use textContent for text, or sanitize HTML input.",
    ),
    # document.write
    (
        r"""document\.write\s*\(""",
        "security", "warning",
        "document.write() — can enable XSS attacks",
        "Use DOM manipulation methods instead.",
    ),
    # Insecure HTTP
    (
        r"""['"]http://(?!localhost|127\.0\.0\.1)""",
        "security", "info",
        "HTTP URL detected — use HTTPS for security",
        "Change to HTTPS for all production URLs.",
    ),
]

_JAVA_PATTERNS: List[tuple] = [
    # SQL injection
    (
        r"""Statement\.execute\w*\s*\(.*\+""",
        "security", "critical",
        "Potential SQL injection — string concatenation in SQL",
        "Use PreparedStatement with parameterized queries.",
    ),
    # Hardcoded secrets
    (
        r'(?:password|secret|apiKey|token)\s*=\s*"[^"]{4,}"',
        "security", "critical",
        "Hardcoded secret detected",
        "Use environment variables or a secrets vault.",
    ),
    # Runtime.exec
    (
        r"""Runtime\.getRuntime\(\)\.exec""",
        "security", "warning",
        "Runtime.exec() — potential command injection",
        "Validate and sanitize all inputs to exec().",
    ),
]


def scan_code_security(code: str, language: str) -> List[Dict[str, Any]]:
    """Scan source code for security issues. Returns list of findings."""
    lang = language.lower()

    if lang == "python":
        patterns = _PYTHON_PATTERNS
    elif lang in ("javascript", "typescript", "js", "ts"):
        patterns = _JS_TS_PATTERNS
    elif lang == "java":
        patterns = _JAVA_PATTERNS
    else:
        return []

    findings: List[Dict[str, Any]] = []
    lines = code.splitlines()

    for i, line in enumerate(lines, 1):
        # Skip comments
        stripped = line.strip()
        if stripped.startswith("#") or stripped.startswith("//"):
            continue

        for pattern, category, severity, message, fix in patterns:
            if re.search(pattern, line, re.IGNORECASE):
                findings.append({
                    "category": category,
                    "severity": severity,
                    "message": message,
                    "line": i,
                    "fix_suggestion": fix,
                    "confidence": 0.8,
                })

    return findings
