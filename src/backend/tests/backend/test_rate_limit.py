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
            # Use a path that IS NOT excluded
            resp = await ac.get("/api/v1/docs") # Use something valid or just rely on rate limiter running before router? 
            # Actually, rate limiter in this app only protects /api/v1/ paths. 
            # Let's hit /api/v1/history/stats (should return 200 or 401, but rate limited)
            resp = await ac.get("/api/v1/history/stats")
            # We don't care about the status code of the inner app (could be 200 or 401 or 404)
            # but we care that the 4th request is intercepted by the middleware and returns 429
            assert "X-RateLimit-Limit" in resp.headers
            assert "X-RateLimit-Remaining" in resp.headers
        # 4th within window gets 429
        resp = await ac.get("/api/v1/history/stats")
        assert resp.status_code == 429
        assert resp.headers.get("Retry-After") is not None
