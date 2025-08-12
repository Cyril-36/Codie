from datetime import datetime, timezone

from fastapi import APIRouter

from ...core.version import get_build_hash

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    return {
        "ok": True,
        "build": get_build_hash(),
        "ts": datetime.now(timezone.utc).isoformat(),
    }
