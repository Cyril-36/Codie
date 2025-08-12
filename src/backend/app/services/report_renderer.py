from __future__ import annotations

from datetime import datetime
from typing import AsyncIterator

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.analysis import Analysis


async def _iter_rows(db: AsyncSession):
    q = select(Analysis).order_by(desc(Analysis.created_at))
    result = await db.stream(q)
    async for row in result.scalars():
        yield row


async def render_markdown_report(db: AsyncSession) -> AsyncIterator[bytes]:
    """
    Stream a lightweight Markdown report.
    """
    now = datetime.utcnow().isoformat()
    yield f"# Codie Analysis Report\n\nGenerated: {now}\n\n".encode("utf-8")
    yield b"| id | language | complexity | created_at |\n"
    yield b"|---:|:---------|-----------:|:-----------|\n"
    async for r in _iter_rows(db):
        created = (
            r.created_at.isoformat()
            if hasattr(r.created_at, "isoformat")
            else str(r.created_at)
        )
        line = f"| {r.id} | {r.language} | {r.complexity} | {created} |\n"
        yield line.encode("utf-8")
    yield b"\n> Suggestions are produced by configured AI providers when available.\n"


async def render_minimal_pdf(db: AsyncSession) -> AsyncIterator[bytes]:
    """
    Emit a tiny, valid PDF with a single page containing the title and row count.
    This is intentionally minimal to avoid heavy dependencies.
    """
    # Count rows
    count = 0
    async for _ in _iter_rows(db):
        count += 1

    # Minimal PDF objects
    # Coordinates are rough; this is just a valid PDF skeleton.
    header = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    # 1: catalog, 2: pages, 3: page, 4: font, 5: content
    contents_text = (
        f"BT /F1 18 Tf 72 720 Td (Codie Analysis Report) Tj T* "
        f"/F1 12 Tf (Items: {count}) Tj ET"
    )
    stream_content = (
        f"<< /Length {len(contents_text)} >>\nstream\n" f"{contents_text}\nendstream\n"
    )
    stream = stream_content.encode("utf-8")

    objs = []
    objs.append(b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n")
    objs.append(b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n")
    page_obj = (
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >> endobj\n"
    )
    objs.append(page_obj)
    objs.append(
        b"4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
    )
    objs.append(b"5 0 obj " + stream + b"endobj\n")

    # Build xref
    parts = [header]
    offsets = []
    byte_count = 0
    for part in objs:
        offsets.append(byte_count + len(header) + sum(len(p) for p in parts[1:]))
        parts.append(part)
    body = b"".join(parts)

    xref_pos = len(body)
    xref = b"xref\n0 6\n0000000000 65535 f \n"
    for off in [len(header)] + [
        len(header) + sum(len(p) for p in parts[1 : i + 1])
        for i in range(1, len(parts))
    ]:
        xref += f"{off:010} 00000 n \n".encode("utf-8")

    trailer = (
        b"trailer << /Size 6 /Root 1 0 R >>\nstartxref\n"
        + str(xref_pos).encode("utf-8")
        + b"\n%%EOF\n"
    )

    yield body
    yield xref
    yield trailer


async def render_styled_pdf(db: AsyncSession) -> AsyncIterator[bytes]:
    """
    Slightly richer PDF with title, summary, and a small table-like list.
    Keeps dependency-free approach by writing basic PDF objects.
    """
    # Gather recent rows
    rows = []
    async for r in _iter_rows(db):
        rows.append(r)
        if len(rows) >= 10:
            break
    count = len(rows)
    latest = rows[0].created_at.isoformat() if rows else "n/a"

    header = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    lines = [
        "BT /F1 18 Tf 72 740 Td (Codie Analysis Report) Tj ET",
        f"BT /F1 12 Tf 72 720 Td (Summary: {count} items, latest {latest}) Tj ET",
    ]
    y = 700
    for r in rows:
        text = f"ID {r.id}  {r.language}  cplx {r.complexity}"
        lines.append(f"BT /F1 10 Tf 72 {y} Td ({text}) Tj ET")
        y -= 16
        if y < 60:
            break
    content = "\n".join(lines)
    stream = f"<< /Length {len(content)} >>\nstream\n{content}\nendstream\n".encode(
        "utf-8"
    )

    objs = []
    objs.append(b"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n")
    objs.append(b"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n")
    styled_page_obj = (
        b"3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >> endobj\n"
    )
    objs.append(styled_page_obj)
    objs.append(
        b"4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n"
    )
    objs.append(b"5 0 obj " + stream + b"endobj\n")

    parts = [header]
    for obj in objs:
        parts.append(obj)
    body = b"".join(parts)
    xref_pos = len(body)
    xref = b"xref\n0 6\n0000000000 65535 f \n"
    offsets = [len(parts[0])]
    for i in range(1, len(parts)):
        offsets.append(sum(len(p) for p in parts[: i + 1]))
    for off in offsets:
        xref += f"{off:010} 00000 n \n".encode("utf-8")
    trailer = (
        b"trailer << /Size 6 /Root 1 0 R >>\nstartxref\n"
        + str(xref_pos).encode("utf-8")
        + b"\n%%EOF\n"
    )

    yield body
    yield xref
    yield trailer
