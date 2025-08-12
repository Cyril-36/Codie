from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from . import Base, TimestampMixin


class Analysis(TimestampMixin, Base):
    __tablename__ = "analysis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    language: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    complexity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
