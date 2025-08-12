from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from ...services.docker_runner import default_python, run_in_container

router = APIRouter(tags=["perf"])


class PerfRequest(BaseModel):
    language: str = "python"
    code: str | None = None
    cmd: list[str] | None = None


@router.post("/perf")
async def run_perf(req: PerfRequest):
    if req.language.lower() == "python" and not req.cmd:
        return default_python(req.code)
    # generic path (use with caution)
    image = "python:3.12-alpine" if req.language.lower() == "python" else "alpine:3.19"
    cmd = req.cmd or ["sh", "-lc", "echo ok"]
    files = {"main.py": req.code} if req.code else None
    return run_in_container(image, cmd, files=files)
