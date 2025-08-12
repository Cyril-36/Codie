"""Initial analysis table.

Revision ID: 0001_initial_analysis
Revises:
Create Date: 2025-08-01 00:00:00
"""

from __future__ import annotations

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "0001_initial_analysis"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "analysis",
        sa.Column(
            "id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False
        ),
        sa.Column("language", sa.String(length=32), nullable=False),
        sa.Column(
            "complexity", sa.Integer(), nullable=False, server_default=sa.text("0")
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_analysis_language", "analysis", ["language"])


def downgrade() -> None:
    op.drop_index("ix_analysis_language", table_name="analysis")
    op.drop_table("analysis")
