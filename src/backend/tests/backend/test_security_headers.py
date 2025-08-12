import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import create_app


@pytest.mark.asyncio
async def test_security_headers_present():
    app = create_app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/health")
    assert resp.status_code == 200
    assert "Strict-Transport-Security" in resp.headers
    assert resp.headers.get("X-Frame-Options") == "DENY"
    assert "Content-Security-Policy" in resp.headers
