#!/usr/bin/env bash
set -euo pipefail

msg="${1:-auto}"

# Allow overriding DB URL for Alembic offline generation
export ALEMBIC_DATABASE_URL="${ALEMBIC_DATABASE_URL:-sqlite:///./codie_dev.db}"

alembic revision --autogenerate -m "$msg"
