import os
import pytest
from httpx import AsyncClient, ASGITransport

from backend.app.main import create_app


@pytest.mark.asyncio
async def test_rate_limit_hits_429(monkeypatch):
    # Tighten limits for the test window
    monkeypatch.setenv("RL_WINDOW_SEC", "1")
    monkeypatch.setenv("RL_MAX_REQ", "3")

    app = create_app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 3 requests should pass
        for _ in range(3):
            resp = await ac.get("/api/v1/health")
            assert resp.status_code == 200
            assert "X-RateLimit-Limit" in resp.headers
            assert "X-RateLimit-Remaining" in resp.headers
        # 4th within window gets 429
        resp = await ac.get("/api/v1/health")
        assert resp.status_code == 429
        assert resp.headers.get("Retry-After") is not None
