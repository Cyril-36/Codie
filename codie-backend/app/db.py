from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from .core.config import get_settings

_settings = get_settings()

# Prefer explicit POSTGRES_DSN on settings, fallback to probes.postgres_dsn
_dsn = getattr(_settings, "postgres_dsn", None) or getattr(_settings.probes, "postgres_dsn", None) or ""

engine = create_async_engine(
    str(_dsn),
    echo=_settings.debug,
    pool_pre_ping=True,
)

# Async session factory (async engine)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False  # type: ignore[arg-type]
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:  # type: ignore[misc]
        yield session


async def init_db() -> None:
    """
    Call once at startup in development if you want to auto-create tables.
    Prefer Alembic migrations in production.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
