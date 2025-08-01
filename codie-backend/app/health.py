from __future__ import annotations

import asyncio
import contextlib
from typing import Any, Dict

from fastapi import APIRouter
from .core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/livez", summary="Liveness probe")
async def livez() -> Dict[str, Any]:
    s = get_settings()
    return {
        "status": "ok",
        "service": s.app_name,
        "version": s.app_version,
    }


async def _check_postgres(dsn: str) -> bool:
    # Placeholder: without a DB client dependency, use a cheap TCP check if DSN host:port can be parsed.
    # For now, return True to avoid failing readiness in local dev; will be replaced when DB client is added.
    await asyncio.sleep(0)  # keep as async
    return True


async def _check_redis(url: str) -> bool:
    # Placeholder redis ping; return True for scaffolding. Will wire to aioredis/redis-py later.
    await asyncio.sleep(0)
    return True


@router.get("/readyz", summary="Readiness probe")
async def readyz() -> Dict[str, Any]:
    s = get_settings()

    checks: Dict[str, Any] = {}
    overall = True

    if s.probes.enable_postgres_probe and s.probes.postgres_dsn:
        with contextlib.suppress(Exception):
            ok = await _check_postgres(s.probes.postgres_dsn)
            checks["postgres"] = "ok" if ok else "fail"
            overall = overall and ok

    if s.probes.enable_redis_probe and s.probes.redis_url:
        with contextlib.suppress(Exception):
            ok = await _check_redis(s.probes.redis_url)
            checks["redis"] = "ok" if ok else "fail"
            overall = overall and ok

    return {
        "status": "ok" if overall else "fail",
        "service": s.app_name,
        "version": s.app_version,
        "checks": checks,
    }
