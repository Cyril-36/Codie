from __future__ import annotations

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
    # Real check using asyncpg: attempts a short connection and simple query.
    import asyncpg  # type: ignore[reportMissingImports]
    try:
        conn = await asyncpg.connect(dsn=dsn, timeout=2)  # type: ignore[no-untyped-call]
        try:
            await conn.execute("SELECT 1;")  # type: ignore[no-untyped-call]
        finally:
            await conn.close()  # type: ignore[no-untyped-call]
        return True
    except Exception:
        return False


async def _check_redis(url: str) -> bool:
    # Real check using redis asyncio client.
    import redis.asyncio as redis  # type: ignore[reportMissingImports]
    try:
        client = redis.from_url(url, decode_responses=True, socket_connect_timeout=2, socket_timeout=2)  # type: ignore[no-untyped-call]
        pong = await client.ping()  # type: ignore[no-untyped-call]
        await client.close()  # type: ignore[no-untyped-call]
        return bool(pong)
    except Exception:
        return False


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
