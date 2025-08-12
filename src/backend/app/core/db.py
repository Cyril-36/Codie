from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool
from sqlalchemy.sql import text

from .settings import get_settings

logger = logging.getLogger(__name__)

_engine: Optional[AsyncEngine] = None
_session_maker: Optional[async_sessionmaker[AsyncSession]] = None
_initialized: bool = False


class DatabaseManager:
    """Production-grade database manager with connection pooling and health checks"""

    def __init__(self):
        self.settings = get_settings()
        self.engine: Optional[AsyncEngine] = None
        self.session_maker: Optional[async_sessionmaker[AsyncSession]] = None
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize database connection and session maker"""
        if self._initialized:
            return

        try:
            database_url = self.settings.get_database_url()

            # Configure engine based on database type
            if database_url.startswith("sqlite"):
                # SQLite configuration (development/testing)
                self.engine = create_async_engine(
                    database_url,
                    future=True,
                    echo=self.settings.database.echo,
                    poolclass=NullPool,  # SQLite doesn't need connection pooling
                    connect_args={"check_same_thread": False},
                )
            else:
                # PostgreSQL configuration (production)
                self.engine = create_async_engine(
                    database_url,
                    future=True,
                    echo=self.settings.database.echo,
                    pool_size=self.settings.database.pool_size,
                    max_overflow=self.settings.database.max_overflow,
                    pool_pre_ping=self.settings.database.pool_pre_ping,
                    pool_recycle=self.settings.database.pool_recycle,
                    pool_timeout=30,
                    pool_reset_on_return="commit",
                )

            # Create session maker
            self.session_maker = async_sessionmaker(
                bind=self.engine,
                expire_on_commit=False,
                class_=AsyncSession,
                autoflush=False,
                autocommit=False,
            )

            # Verify connection
            await self._verify_connection()

            self._initialized = True
            logger.info("Database initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise

    async def _verify_connection(self) -> None:
        """Verify database connection is working"""
        try:
            async with self.engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
                logger.info("Database connection verified")
        except Exception as e:
            logger.error(f"Database connection verification failed: {e}")
            raise

    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """Get database session with proper error handling"""
        if not self._initialized:
            await self.initialize()

        if not self.session_maker:
            raise RuntimeError("Database not initialized")

        session = self.session_maker()
        try:
            yield session
        except Exception:
            await session.rollback()
            logger.error("Database session error, rolling back")
            raise
        finally:
            await session.close()

    async def health_check(self) -> bool:
        """Check database health"""
        try:
            if not self._initialized:
                return False

            async with self.engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
                return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False

    async def close(self) -> None:
        """Close database connections"""
        if self.engine:
            await self.engine.dispose()
            self._initialized = False
            logger.info("Database connections closed")

    def get_engine(self) -> AsyncEngine:
        """Get database engine (for migrations)"""
        if not self._initialized:
            raise RuntimeError("Database not initialized")
        return self.engine

    def get_session_maker(self) -> async_sessionmaker[AsyncSession]:
        """Get session maker (for migrations)"""
        if not self._initialized:
            raise RuntimeError("Database not initialized")
        return self.session_maker


# Global database manager instance
_db_manager = DatabaseManager()


async def initialize_database() -> None:
    """Initialize database on application startup"""
    await _db_manager.initialize()


async def close_database() -> None:
    """Close database on application shutdown"""
    await _db_manager.close()


def get_engine() -> AsyncEngine:
    """Get database engine (for migrations)"""
    return _db_manager.get_engine()


def get_session_maker() -> async_sessionmaker[AsyncSession]:
    """Get session maker (for migrations)"""
    return _db_manager.get_session_maker()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an AsyncSession"""
    async for session in _db_manager.get_session():
        yield session


@asynccontextmanager
async def lifespan_session() -> AsyncGenerator[AsyncSession, None]:
    """Convenience context manager for app startup/shutdown"""
    async for session in _db_manager.get_session():
        try:
            yield session
        finally:
            await session.close()


async def check_database_health() -> dict:
    """Comprehensive database health check"""
    try:
        is_healthy = await _db_manager.health_check()

        if is_healthy:
            # Get connection pool info for PostgreSQL
            pool_info = {}
            if _db_manager.engine and hasattr(_db_manager.engine, "pool"):
                pool = _db_manager.engine.pool
                pool_info = {
                    "pool_size": getattr(pool, "size", "N/A"),
                    "checked_in": getattr(pool, "checkedin", "N/A"),
                    "checked_out": getattr(pool, "checkedout", "N/A"),
                    "overflow": getattr(pool, "overflow", "N/A"),
                }

            return {
                "status": "healthy",
                "database": "connected",
                "pool_info": pool_info,
            }
        else:
            return {
                "status": "unhealthy",
                "database": "disconnected",
                "error": "Database connection failed",
            }

    except Exception as e:
        return {"status": "unhealthy", "database": "error", "error": str(e)}
