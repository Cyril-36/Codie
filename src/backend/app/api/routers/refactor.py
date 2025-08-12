from __future__ import annotations

from fastapi import APIRouter

from ...core.settings import Settings
from ...services.refactor_planner import build_refactor_plan

router = APIRouter(tags=["refactor"])


@router.get("/refactor-plan")
async def refactor_plan():
    root = Settings().project_root
    plan = build_refactor_plan(root)
    return plan
