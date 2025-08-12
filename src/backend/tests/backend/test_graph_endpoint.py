import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import create_app


@pytest.mark.asyncio
async def test_graph_endpoint_returns_nodes_edges_hotspots(tmp_path, monkeypatch):
    # Build an app pointing project_root to tests dir to ensure some .py files exist
    app = create_app()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/graph")
        assert res.status_code == 200
        data = res.json()
        assert "nodes" in data and isinstance(data["nodes"], list)
        assert "edges" in data and isinstance(data["edges"], list)
        assert "hotspots" in data and isinstance(data["hotspots"], list)
