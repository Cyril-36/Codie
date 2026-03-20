from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Integer, Float, String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from . import Base, TimestampMixin


class Analysis(TimestampMixin, Base):
    __tablename__ = "analysis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    language: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    complexity: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    code: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    suggestions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON
    analysis_type: Mapped[str] = mapped_column(
        String(32), nullable=False, default="code_review", index=True
    )
    filename: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    metrics: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
