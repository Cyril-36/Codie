from __future__ import annotations

from fastapi import APIRouter, Depends

from ...core.security import get_current_user
from ...core.settings import get_settings
from ...services.graph_builder import build_graph

router = APIRouter(tags=["graph"])


@router.get("/graph")
async def get_graph(_user=Depends(get_current_user)):
    root = get_settings().app.project_root
    return build_graph(root)
