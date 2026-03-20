from __future__ import annotations

from fastapi import APIRouter, Depends

from ...core.security import get_current_user
from ...core.settings import get_settings
from ...services.refactor_planner import build_refactor_plan

router = APIRouter(tags=["refactor"])


@router.get("/refactor-plan")
async def refactor_plan(_user=Depends(get_current_user)):
    root = get_settings().app.project_root
    plan = build_refactor_plan(root)
    return plan
