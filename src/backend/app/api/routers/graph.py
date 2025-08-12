from __future__ import annotations

from fastapi import APIRouter

from ...services.graph_builder import build_graph

router = APIRouter(tags=["graph"])


@router.get("/graph")
async def get_graph():
    # For now, we'll use the current working directory as project_root
    # In a real implementation, this would be a property of Settings
    import os

    repo_root = os.getcwd()
    return build_graph(repo_root)
