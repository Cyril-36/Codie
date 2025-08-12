import pytest
import httpx

from backend.app.main import create_app


@pytest.mark.asyncio
async def test_export_csv_header():
    app = create_app()
    async with httpx.AsyncClient(base_url="http://test", transport=httpx.ASGITransport(app=app)) as ac:
        resp = await ac.get("/api/v1/export/csv")
    assert resp.status_code == 200
    assert resp.headers.get("content-type", "").startswith("text/csv")
    # Should start with CSV header
    text = resp.text.splitlines()[0]
    assert text.startswith("id,language,complexity")


@pytest.mark.asyncio
async def test_export_json_shape():
    app = create_app()
    async with httpx.AsyncClient(base_url="http://test", transport=httpx.ASGITransport(app=app)) as ac:
        resp = await ac.get("/api/v1/export/json")
    assert resp.status_code == 200
    assert resp.headers.get("content-type", "").startswith("application/json")
    assert resp.text.strip().startswith("[")
