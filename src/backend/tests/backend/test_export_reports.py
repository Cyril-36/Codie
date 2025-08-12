import pytest
from httpx import AsyncClient, ASGITransport

from backend.app.main import create_app


@pytest.mark.asyncio
async def test_export_markdown():
    app = create_app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/export/md")
    assert resp.status_code == 200
    assert resp.headers.get("content-type", "").startswith("text/markdown")
    assert resp.text.startswith("# Codie Analysis Report")


@pytest.mark.asyncio
async def test_export_pdf_magic_bytes():
    app = create_app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/export/pdf")
    assert resp.status_code == 200
    assert resp.headers.get("content-type", "").startswith("application/pdf")
    assert resp.content.startswith(b"%PDF-")
