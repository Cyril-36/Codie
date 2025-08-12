from __future__ import annotations

import json
from typing import AsyncIterator

import yaml
from fastapi import APIRouter, Depends
from fastapi.encoders import jsonable_encoder
from fastapi.responses import PlainTextResponse, StreamingResponse
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.db import get_db
from ...models.analysis import Analysis
from ...services.report_renderer import (
    render_markdown_report,
    render_minimal_pdf,
    render_styled_pdf,
)

router = APIRouter(tags=["export", "docs"])


async def _stream_rows(db: AsyncSession):
    rows_q = select(Analysis).order_by(desc(Analysis.created_at))
    result = await db.stream(rows_q)
    async for row in result.scalars():
        yield row


@router.get("/export/csv")
async def export_csv(db: AsyncSession = Depends(get_db)):
    async def generator() -> AsyncIterator[bytes]:
        # Match test expectation: header starts with "id,language,complexity"
        yield b"id,language,complexity\n"
        async for r in _stream_rows(db):
            line = f"{r.id},{r.language},{r.complexity}\n"
            yield line.encode("utf-8")

    headers = {"Content-Disposition": 'attachment; filename="codie-history.csv"'}
    return StreamingResponse(generator(), media_type="text/csv", headers=headers)


@router.get("/export/json")
async def export_json(db: AsyncSession = Depends(get_db)):
    async def generator() -> AsyncIterator[bytes]:
        first = True
        yield b"["
        async for r in _stream_rows(db):
            created = (
                r.created_at.isoformat()
                if hasattr(r.created_at, "isoformat")
                else str(r.created_at)
            )
            obj = {
                "id": r.id,
                "language": r.language,
                "complexity": r.complexity,
                "created_at": created,
            }
            chunk = json.dumps(obj, separators=(",", ":"), ensure_ascii=False)
            if first:
                yield chunk.encode("utf-8")
                first = False
            else:
                yield ("," + chunk).encode("utf-8")
        yield b"]"

    headers = {"Content-Disposition": 'attachment; filename="codie-history.json"'}
    return StreamingResponse(
        generator(), media_type="application/json", headers=headers
    )


@router.get("/export/md")
async def export_md(db: AsyncSession = Depends(get_db)):
    headers = {"Content-Disposition": 'attachment; filename="codie-report.md"'}
    return StreamingResponse(
        render_markdown_report(db), media_type="text/markdown", headers=headers
    )


@router.get("/export/pdf")
async def export_pdf(db: AsyncSession = Depends(get_db)):
    headers = {"Content-Disposition": 'attachment; filename="codie-report.pdf"'}
    # Prefer styled PDF; fallback to minimal if anything goes wrong
    try:
        return StreamingResponse(
            render_styled_pdf(db), media_type="application/pdf", headers=headers
        )
    except Exception:
        return StreamingResponse(
            render_minimal_pdf(db), media_type="application/pdf", headers=headers
        )


@router.get("/openapi.yaml")
async def openapi_yaml():
    # Defer import to avoid circulars; create a lightweight app instance to fetch schema
    from ...main import create_app  # local import

    app = create_app()
    schema = app.openapi()
    text = yaml.safe_dump(jsonable_encoder(schema), sort_keys=False)
    headers = {"Content-Disposition": 'attachment; filename="openapi.yaml"'}
    return PlainTextResponse(text, media_type="text/yaml", headers=headers)
