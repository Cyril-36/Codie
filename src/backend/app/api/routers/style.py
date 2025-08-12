from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from ...core.settings import Settings
from ...services.style_model import analyze_snippet, train_style

router = APIRouter(tags=["style"])


class StyleReq(BaseModel):
    language: str = "python"
    snippet: str


@router.post("/style")
async def style_check(req: StyleReq):
    # Only python heuristics for now; others can be added later.
    root = Settings().project_root
    style = train_style(root)
    result = analyze_snippet(req.snippet, style)
    return {"style": style, **result}
