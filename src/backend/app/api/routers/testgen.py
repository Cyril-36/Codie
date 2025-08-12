from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from ...services.testgen import generate_tests

router = APIRouter(tags=["testgen"])


class TestGenReq(BaseModel):
    language: str = "python"
    file: str | None = None
    code: str
    function: str | None = None


@router.post("/generate-tests")
async def generate(req: TestGenReq):
    return generate_tests(req.language, req.file, req.code, req.function)
