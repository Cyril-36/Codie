from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel, UniqueConstraint


class User(SQLModel, table=True):
    # SQLModel/SQLAlchemy will derive the table name from the class by default ("user" -> "user" or "users" depending on config).
    # Keeping defaults avoids Pylance declared_attr type complaints on __tablename__.
    __table_args__ = (UniqueConstraint("email"), UniqueConstraint("username"))

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, nullable=False)
    username: str = Field(index=True, nullable=False)
    password_hash: str = Field(nullable=False)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
