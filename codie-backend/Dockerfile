# Backend Dockerfile (non-root, slim, secure defaults)
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# System deps (build essentials kept minimal)
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    build-essential curl ca-certificates dumb-init && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN groupadd -r app && useradd -r -g app app

# Dependencies
COPY codie-backend/pyproject.toml codie-backend/poetry.lock* /app/
# Fallback to pip/requirements if not using poetry (we will provide requirements.txt)
COPY codie-backend/requirements.txt /app/requirements.txt

RUN python -m pip install --upgrade pip && \
    pip install -r /app/requirements.txt

# App source
COPY codie-backend/app /app/app

# Security: drop caps, use non-root, read-only fs with tmp writable
USER app:app

EXPOSE 8000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
