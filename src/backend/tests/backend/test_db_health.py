import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


@pytest.mark.asyncio
async def test_db_connect_and_select_one(tmp_path):
    # Use a temporary sqlite file per test for isolation and speed
    db_path = tmp_path / "test.db"
    url = f"sqlite+aiosqlite:///{db_path}"
    engine = create_async_engine(url, future=True)
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            assert result.scalar_one() == 1
    finally:
        await engine.dispose()
