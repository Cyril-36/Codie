from __future__ import annotations

from datetime import datetime
from typing import Dict, List

from .graph_builder import build_graph


def _normalize(values: List[int]) -> Dict[str, float]:
    if not values:
        return {}
    vmax = max(values) or 1
    return {
        i: v / vmax for i, v in enumerate(values)
    }  # not used directly on ids; helper only


def build_refactor_plan(repo_root: str, top_n: int = 10) -> Dict:
    g = build_graph(repo_root)
    nodes = g.get("nodes", [])
    if not nodes:
        return {"generated_at": datetime.utcnow().isoformat() + "Z", "suggestions": []}

    # map id -> (complexity, degree, file)
    comp = {n["id"]: int(n.get("complexity", 1)) for n in nodes}
    deg = {n["id"]: int(n.get("degree", 0)) for n in nodes}
    file_of = {n["id"]: n.get("file", "") for n in nodes}

    max_c = max(comp.values()) or 1
    max_d = max(deg.values()) or 1

    suggestions: List[Dict] = []
    for nid in comp.keys():
        c = comp[nid]
        d = deg.get(nid, 0)
        impact = round((c / max_c) * 0.6 + (d / max_d) * 0.4, 4)
        actions: List[str] = []
        if c >= 10:
            actions += ["extract-method", "reduce-branching"]
        if d >= 6:
            actions += ["decouple-deps"]
        if not actions:
            actions = ["add-tests"]

        reason = f"High hotspot factors: complexity {c}, degree {d}"
        suggestions.append(
            {
                "id": nid,
                "file": file_of.get(nid, ""),
                "reason": reason,
                "impact_score": impact,
                "actions": actions,
            }
        )

    suggestions.sort(key=lambda s: s["impact_score"], reverse=True)
    return {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "suggestions": suggestions[:top_n],
    }
