from __future__ import annotations

import os
import sys
from logging.config import fileConfig
from pathlib import Path
from typing import Any

from sqlalchemy import engine_from_config, pool, text

from alembic import context

# Configure Alembic config and logging
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Ensure project root is on sys.path so "backend" is importable when running alembic
# env.py typically runs with CWD=src/backend/, so repo root is parent of that directory
BACKEND_DIR = Path(__file__).resolve().parents[1]  # .../src/backend
REPO_ROOT = BACKEND_DIR.parent  # repo root containing "src"
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

# Import metadata from models
from backend.app.models import Base  # noqa: E402


def get_database_url() -> str:
    """
    Resolve the Alembic database URL with precedence:
    1) ALEMBIC_DATABASE_URL
    2) DATABASE_URL (converted to sync driver if async)
    3) Canonical dev SQLite path under src/backend
    """
    url = os.getenv("ALEMBIC_DATABASE_URL") or os.getenv("DATABASE_URL")
    if url:
        # Accept async URLs too; convert to sync driver for offline if needed
        if url.startswith("sqlite+aiosqlite://"):
            return url.replace("sqlite+aiosqlite://", "sqlite:///")
        if url.startswith("postgresql+asyncpg://"):
            return url.replace("postgresql+asyncpg://", "postgresql://")
        return url
    # Fallback to a local SQLite file under src/backend (for dev/testing)
    fallback_path = BACKEND_DIR / "codie_dev.db"
    return f"sqlite:///{fallback_path}"


target_metadata = Base.metadata


def ensure_minimal_schema(connection: Any) -> None:
    """
    Create minimal tables needed by tests when migrations haven't been applied.
    This is safe for SQLite and a no-op for other engines if executed.
    """
    try:
        # connection is a sqlalchemy.engine.Connection (sync) at runtime
        if getattr(getattr(connection, "dialect", None), "name", None) == "sqlite":
            connection.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS analysis (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        language VARCHAR(50) NOT NULL,
                        complexity INTEGER NOT NULL,
                        created_at TIMESTAMP NOT NULL
                    )
                    """
                )
            )
    except Exception:
        # Non-fatal; tests may still run when migrations are present
        pass


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = get_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = get_database_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        future=True,
    )

    with connectable.connect() as connection:  # type: ignore[call-arg]
        # Ensure minimal schema exists for tests without full migration run (sqlite)
        ensure_minimal_schema(connection)

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
