from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)


# Import all models so they are registered with Base.metadata
from .analysis import Analysis  # noqa: E402

__all__ = ["Base", "TimestampMixin", "Analysis"]
