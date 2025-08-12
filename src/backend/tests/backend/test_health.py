import asyncio
from httpx import AsyncClient, ASGITransport
from backend.app.main import create_app


async def _get_health():
    app = create_app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        return await ac.get("/api/v1/health")


def test_health_status_code_event_loop():
    # Use a fresh event loop to avoid pytest-asyncio config friction
    loop = asyncio.new_event_loop()
    try:
        resp = loop.run_until_complete(_get_health())
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("ok") is True
        assert isinstance(data.get("build"), str)
        assert isinstance(data.get("ts"), str)
    finally:
        loop.close()
