from __future__ import annotations

from typing import Any, Dict, List

# Optional Tree-sitter support (kept ultra-light)
TS_AVAILABLE = False
try:  # pragma: no cover - import guard
    import tree_sitter_python as tspython  # type: ignore
    from tree_sitter import Parser  # type: ignore

    TS_AVAILABLE = True
except Exception:  # pragma: no cover
    TS_AVAILABLE = False

_PY_PARSER: Parser | None = None


def _get_py_parser() -> Parser | None:
    global _PY_PARSER
    if not TS_AVAILABLE:
        return None
    if _PY_PARSER is None:
        p = Parser()
        p.set_language(tspython.language())
        _PY_PARSER = p
    return _PY_PARSER


def _ts_loc(content: str) -> int:
    # count non-empty lines
    return len([line for line in content.splitlines() if line.strip()])


def _parse_python_functions(content: str) -> List[Dict[str, Any]]:
    """
    Return a tiny summary of python function definitions using Tree-sitter.
    """
    parser = _get_py_parser()
    if not parser:
        return []
    tree = parser.parse(content.encode("utf-8"))
    root = tree.root_node
    out: List[Dict[str, Any]] = []
    stack = [root]
    while stack:
        node = stack.pop()
        # push children
        for i in range(node.child_count - 1, -1, -1):
            stack.append(node.children[i])
        if node.type == "function_definition":
            # function name child is usually at field "name"
            name = None
            for ch in node.children:
                if ch.type == "identifier":
                    name = content[ch.start_byte : ch.end_byte]
                    break
            out.append(
                {
                    "name": name or "<anon>",
                    "start_line": node.start_point[0] + 1,
                    "end_line": node.end_point[0] + 1,
                }
            )
    return out


def parse_snippet(language: str, content: str) -> dict:
    """
    Parse a snippet into a minimal shape. For Python, include Tree-sitter
    discovered function defs when available; otherwise keep prior heuristics.
    """
    tokens = content.split()
    loc = len([line for line in content.splitlines() if line.strip()])
    if language.lower() == "python" and TS_AVAILABLE:
        funcs = _parse_python_functions(content)
        return {
            "language": language,
            "tokens": len(tokens),
            "loc": loc,
            "functions": funcs,
        }
    return {"language": language, "tokens": len(tokens), "loc": loc}


def parse_code(code: str, language: str) -> dict:
    """
    Parse code and return analysis information.
    This is a wrapper around parse_snippet for consistency.
    """
    return parse_snippet(language, code)
