import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import create_app
from backend.app.core.metrics import reset


@pytest.mark.asyncio
async def test_metrics_counts_requests():
    # Reset metrics to ensure clean state
    reset()
    
    app = create_app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Hit health twice
        for _ in range(2):
            r = await ac.get("/api/v1/health")
            assert r.status_code == 200
        # Fetch metrics
        resp = await ac.get("/api/v1/metrics")
        assert resp.status_code == 200
        text = resp.text
        # Expect a counter line for health 200 == 2
        assert 'http_requests_total{path="/api/v1/health",status="200"} 2' in text
