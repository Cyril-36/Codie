from __future__ import annotations

# Optional Tree-sitter-based complexity for Python and JS/TS.
# Be defensive: some environments expose Parser without set_language,
# or language() factories may be unavailable. We fall back gracefully.
try:  # pragma: no cover
    import tree_sitter_javascript as tsjs  # type: ignore
    import tree_sitter_python as tspython  # type: ignore
    from tree_sitter import Parser  # type: ignore

    _PY_OK = True
    _JS_OK = True
except Exception:  # pragma: no cover
    _PY_OK = False
    _JS_OK = False

_PARSER: "Parser | None" = None
_JS_PARSER: "Parser | None" = None


def _get_parser() -> "Parser | None":
    global _PARSER
    if not _PY_OK:
        return None
    if _PARSER is None:
        try:
            p = Parser()
            # Some builds expose set_language, some do not; guard it.
            if hasattr(p, "set_language") and hasattr(tspython, "language"):
                p.set_language(tspython.language())  # type: ignore[attr-defined]
                _PARSER = p
            else:
                # Not supported in this environment
                return None
        except Exception:
            return None
    return _PARSER


def _get_js_parser() -> "Parser | None":
    global _JS_PARSER
    if not _JS_OK:
        return None
    if _JS_PARSER is None:
        try:
            p = Parser()
            if hasattr(p, "set_language") and hasattr(tsjs, "language"):
                p.set_language(tsjs.language())  # type: ignore[attr-defined]
                _JS_PARSER = p
            else:
                return None
        except Exception:
            return None
    return _JS_PARSER


def _complexity_python_ts(source: str) -> int:
    parser = _get_parser()
    if not parser:
        return _complexity_fallback(source)
    try:
        tree = parser.parse(source.encode("utf-8"))  # type: ignore[union-attr]
    except Exception:
        return _complexity_fallback(source)
    root = tree.root_node
    # Count decision points
    decision_types = {
        "if_statement",
        "elif_clause",
        "for_statement",
        "while_statement",
        "except_clause",
        "conditional_expression",  # ternary
    }
    hits = 0
    stack = [root]
    while stack:
        node = stack.pop()
        for i in range(node.child_count - 1, -1, -1):
            stack.append(node.children[i])
        if node.type in decision_types:
            hits += 1
    # Light boolean operator scan
    lower = source.lower()
    hits += lower.count(" and ")
    hits += lower.count(" or ")
    return 1 + hits


def _complexity_fallback(source: str) -> int:
    if not source:
        return 0
    keywords = ["if", "for", "while", "and", "or", "elif", "except", "?"]
    lower = source.lower()
    hits = sum(lower.count(k) for k in keywords)
    return 1 + hits


def _complexity_js_ts_ts(source: str) -> int:
    parser = _get_js_parser()
    if not parser:
        return _complexity_fallback(source)
    try:
        tree = parser.parse(source.encode("utf-8"))  # type: ignore[union-attr]
    except Exception:
        return _complexity_fallback(source)
    root = tree.root_node
    decision_types = {
        "if_statement",
        "for_statement",
        "while_statement",
        "for_in_statement",
        "for_of_statement",
        "catch_clause",
        "conditional_expression",  # ternary
        "switch_case",
        "switch_default",
    }
    hits = 0
    stack = [root]
    while stack:
        node = stack.pop()
        for i in range(node.child_count - 1, -1, -1):
            stack.append(node.children[i])
        if node.type in decision_types:
            hits += 1
        if node.type == "logical_expression":
            # JS logical operators
            text = source[node.start_byte : node.end_byte]
            hits += text.count("&&")
            hits += text.count("||")
    return 1 + hits


def compute_complexity(language: str, content: str) -> int:
    lang = language.lower()
    if lang == "python":
        return _complexity_python_ts(content)
    if lang in {"javascript", "js", "typescript", "ts"}:
        return _complexity_js_ts_ts(content)
    # fallback for other languages: count non-empty, non-comment lines
    if not content:
        return 0
    prefixes = {
        "javascript": "//",
        "js": "//",
        "typescript": "//",
        "ts": "//",
        "java": "//",
        "python": "#",
    }
    prefix = prefixes.get(lang, "#")
    count = 0
    for line in content.splitlines():
        s = line.strip()
        if not s or s.startswith(prefix):
            continue
        count += 1
    return count
