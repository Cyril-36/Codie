from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from ...services.security_scan import scan_requirements

router = APIRouter(tags=["security"])


class SecReq(BaseModel):
    language: str = "python"
    requirements: str | None = None


@router.post("/security")
async def security_scan(req: SecReq):
    # Only python supported for now; others can be added later.
    result = scan_requirements(req.requirements)
    return result
