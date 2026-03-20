import pytest
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from backend.app.models import Base
from backend.app.core.settings import get_settings

# Ensure we use a test database file, not memory, so multiple connections see the same DB
# (Since tests create their own app/engine instances)
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"

@pytest.fixture(scope="session", autouse=True)
def event_loop():
    """Create an instance of the default event loop for each test case."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def prepare_database():
    """Create tables before running tests."""
    settings = get_settings()
    db_url = settings.get_database_url()
    
    # Create engine to create tables
    engine = create_async_engine(db_url)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    yield
    
    # Cleanup (optional, keeping it for inspection if failed)
    # async with engine.begin() as conn:
    #     await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()
