from __future__ import annotations

import ast
import math
from pathlib import Path
from typing import Dict, List, Set, Tuple

from .complexity_analyzer import compute_complexity


def _py_functions_and_calls(code: str) -> Tuple[Dict[str, Set[str]], Dict[str, int]]:
    """
    Returns:
      calls: mapping from func_qualname -> set of called symbol names (unqualified)
      complexity: mapping from func_qualname -> cyclomatic complexity (best-effort)
    """
    calls: Dict[str, Set[str]] = {}
    complexity: Dict[str, int] = {}
    try:
        tree = ast.parse(code)
    except Exception:
        return calls, complexity

    class V(ast.NodeVisitor):
        def __init__(self) -> None:
            self.scope: List[str] = []

        def _fq(self, name: str) -> str:
            return ".".join(self.scope + [name]) if self.scope else name

        def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
            fq = self._fq(node.name)
            self.scope.append(node.name)
            calls[fq] = set()
            # Compute complexity for the function body using our analyzer
            # on the sliced source
            try:
                # Slice function source for a more granular complexity signal
                start = node.lineno - 1
                end = node.end_lineno or node.lineno
                func_src = "\n".join(code.splitlines()[start:end])
                complexity[fq] = max(1, compute_complexity("python", func_src))
            except Exception:
                complexity[fq] = (
                    sum(
                        isinstance(
                            n, (ast.If, ast.For, ast.While, ast.And, ast.Or, ast.Try)
                        )
                        for n in ast.walk(node)
                    )
                    + 1
                )
            self.generic_visit(node)
            self.scope.pop()

        def visit_Call(self, node: ast.Call) -> None:
            target = None
            if isinstance(node.func, ast.Name):
                target = node.func.id
            elif isinstance(node.func, ast.Attribute):
                target = node.func.attr
            if target and self.scope:
                fq = ".".join(self.scope)
                calls.setdefault(fq, set()).add(target)
            self.generic_visit(node)

    V().visit(tree)
    return calls, complexity


def build_graph(repo_root: str) -> Dict:
    root = Path(repo_root)
    nodes: Dict[str, Dict] = {}
    edges: List[Dict[str, str]] = []

    # Collect python files for now; JS/TS can be added similarly
    py_files = [
        p
        for p in root.rglob("*.py")
        if "venv" not in p.parts
        and "site-packages" not in p.parts
        and "/." not in "/".join(p.parts)
    ]

    symbol_to_file: Dict[str, Path] = {}
    out_calls: Dict[str, Set[str]] = {}
    complexity_map: Dict[str, int] = {}

    for f in py_files:
        try:
            code = f.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        calls, comp = _py_functions_and_calls(code)
        # prefix functions with file stem to reduce collisions
        for func, callees in calls.items():
            sym = f"{f.stem}:{func}"
            symbol_to_file[sym] = f
            out_calls[sym] = {c for c in callees}
        for func, cplx in comp.items():
            sym = f"{f.stem}:{func}"
            complexity_map[sym] = cplx

    # Build edges by simple name match among discovered symbols
    name_index: Dict[str, List[str]] = {}
    for sym in complexity_map.keys():
        short = sym.split(":")[-1].split(".")[-1]  # function name
        name_index.setdefault(short, []).append(sym)

    for src, callees in out_calls.items():
        for cal in callees:
            targets = name_index.get(cal, [])
            for tgt in targets:
                if src != tgt:
                    edges.append({"from": src, "to": tgt})

    # Nodes with hotspot score = norm(complexity) * log(1 + degree)
    max_c = max(complexity_map.values(), default=1)
    degree: Dict[str, int] = {}
    for e in edges:
        degree[e["from"]] = degree.get(e["from"], 0) + 1
        degree[e["to"]] = degree.get(e["to"], 0) + 1

    for sym, cplx in complexity_map.items():
        norm_c = (cplx / max_c) if max_c else 0
        deg = degree.get(sym, 0)
        score = round(norm_c * math.log(1 + deg + 1), 4)
        nodes[sym] = {
            "id": sym,
            "complexity": cplx,
            "file": str(symbol_to_file.get(sym, "")),
            "degree": deg,
            "hotspot": score,
        }

    hotspots = sorted(
        [{"id": n["id"], "score": n["hotspot"]} for n in nodes.values()],
        key=lambda x: x["score"],
        reverse=True,
    )[:20]

    return {
        "nodes": list(nodes.values()),
        "edges": edges,
        "hotspots": hotspots,
    }
