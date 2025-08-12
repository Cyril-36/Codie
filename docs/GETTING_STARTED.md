# Codie — Getting Started

This guide helps you run Codie locally, call core APIs, and try the UI.

## Prerequisites
- Docker + Docker Compose
- Node 20, pnpm or npm (choose one; see Frontend setup)
- Python 3.12 (optional for local tooling)

## Quick Start

### 1) Start services
```sh
docker compose -f infra/docker-compose.yml up -d
```

Services:
- Backend API: http://localhost:8000
- Frontend: http://localhost:5173
- Prometheus: http://localhost:9090
- Vault (dev): http://localhost:8200

### 2) Health & Metrics
```sh
curl -s http://localhost:8000/api/v1/health | jq
curl -s http://localhost:8000/api/v1/metrics | head
```

### 3) Open the UI
Choose your package manager and follow the corresponding commands.

Using pnpm (recommended):
```sh
pnpm -C frontend install
pnpm -C frontend dev
# then open http://localhost:5173
```

Using npm:
```sh
npm --prefix frontend install
npm --prefix frontend run dev
# then open http://localhost:5173
```

---

# Backend setup and common pitfalls

This section standardizes how to run the backend, configure Alembic, and initialize the dev database.

## Canonical dev database

We use a single SQLite file for local development at:
- data/dev/codie_dev.db

Rationale:
- Keeps repo root clean
- Easy to mount as a Docker volume
- Matches app and Alembic defaults

Create the directory if missing:
```sh
mkdir -p data/dev
```

## App configuration

The app resolves the database URL with the following precedence:
1) DATABASE_URL (supports async drivers like sqlite+aiosqlite://, postgresql+asyncpg://)
2) CODIE_DB_* environment parts (Postgres)
3) Fallback: sqlite+aiosqlite:///../../data/dev/codie_dev.db

Notes:
- backend/app/core/settings.py is located at backend/app/core/, thus ../../ navigates to backend/, then ../ to repo root; the path ultimately points to data/dev/codie_dev.db.

## Alembic configuration

Alembic resolves the URL with this precedence (in backend/alembic/env.py):
1) ALEMBIC_DATABASE_URL
2) DATABASE_URL (auto-converted to sync driver)
3) Fallback: sqlite:///../data/dev/codie_dev.db (relative to backend/)

Alembic INI file defaults (src/backend/alembic.ini):
- script_location = alembic
- sqlalchemy.url = sqlite:///../data/dev/codie_dev.db
- You can run alembic either from src/backend/ or from repo root using -c src/backend/alembic.ini.

Examples:
- From src/backend/:
  ```sh
  cd src/backend
  alembic upgrade head
  ```
- From repo root:
  ```sh
  alembic -c src/backend/alembic.ini upgrade head
  ```

## Running the app

From repo root:
```sh
uvicorn backend.app.main:app --reload
# or:
python -m backend.app.main
```

From src/backend/:
```sh
uvicorn app.main:app --reload
# or:
python -m app.main
```

CORS, security headers, and basic rate limit middlewares are registered in app creation.

## First-time setup (dev)

1) Create the dev data directory if it doesn't exist:
```sh
mkdir -p data/dev
```

2) Apply migrations:
```sh
alembic -c src/backend/alembic.ini upgrade head
# or:
cd src/backend && alembic upgrade head
```

3) Start backend API:
```sh
uvicorn backend.app.main:app --reload
# or:
cd src/backend && uvicorn app.main:app --reload
```

4) Verify health:
```sh
curl -i http://127.0.0.1:8000/api/v1/health
```

## Common errors and fixes

- Error: "Cannot run python -m backend.app.main"
  Cause: Running from a directory where backend is not importable.
  Fix: Run from repo root (where backend/ is a top-level package) or:
  ```sh
  cd src/backend && python -m app.main
  ```

- Error: "No alembic.ini file found"
  Cause: Running alembic from repo root without specifying config.
  Fix: Run from src/backend directory or pass -c src/backend/alembic.ini:
  ```sh
  alembic -c src/backend/alembic.ini upgrade head
  ```

- Error: SQLite file missing or schema not applied
  Fix: Ensure data/dev exists and run alembic upgrade head as shown above.

## Docker compose notes

If using docker-compose, mount the data/ directory as a volume to persist dev DB:
```yaml
volumes:
  - ./data:/app/data
```

Ensure ALEMBIC_DATABASE_URL or DATABASE_URL envs are set consistently if overriding defaults.

This guide helps you run Codie locally, call core APIs, and try the UI.

## Prerequisites
- Docker + Docker Compose
- Node 20, pnpm or npm (choose one; see Frontend setup)
- Python 3.12 (optional for local tooling)

## Quick Start

### 1) Start services
```sh
docker compose -f infra/docker-compose.yml up -d
```

Services:
- Backend API: http://localhost:8000
- Frontend: http://localhost:5173
- Prometheus: http://localhost:9090
- Vault (dev): http://localhost:8200

### 2) Health & Metrics
```sh
curl -s http://localhost:8000/api/v1/health | jq
curl -s http://localhost:8000/api/v1/metrics | head
```

### 3) Open the UI
Choose your package manager and follow the corresponding commands.

Using pnpm (recommended):
```sh
pnpm -C frontend install
pnpm -C frontend dev
# then open http://localhost:5173
```

Using npm:
```sh
npm --prefix frontend install
npm --prefix frontend run dev
# then open http://localhost:5173
```

## Core API Examples

Set a helper:
```sh
API=http://localhost:8000/api/v1
```

Analyze a snippet (hide low-confidence by default):
```sh
curl -s -X POST "$API/analyze" \
  -H "Content-Type: application/json" \
  -d '{"language":"python","content":"def add(a,b): return a+b"}' | jq
```

Show all suggestions:
```sh
curl -s -X POST "$API/analyze?show_all=true" \
  -H "Content-Type: application/json" \
  -d '{"language":"python","content":"def add(a,b): return a+b"}' | jq
```

Security scan (offline CVE map demo):
```sh
curl -s -X POST "$API/security" \
  -H "Content-Type: application/json" \
  -d '{"language":"python","requirements":"urllib3==1.26.5"}' | jq
```

Refactor plan:
```sh
curl -s "$API/refactor-plan" | jq
```

## Exports & SDK

- PDF/Markdown/CSV/JSON available via export routes.
- TypeScript SDK usage:
```ts
import { api, analyzeSnippet } from "./frontend/src/services/api";
const res = await analyzeSnippet("python", "def add(a,b): return a+b", true);
console.log(res.suggestions);
```

## Running Tests

Run tests from the repository root so configuration and imports resolve correctly:

```bash
# ensure repo root is on PYTHONPATH so `backend` imports resolve
export PYTHONPATH=.
pytest -q
```

Alternatively, if you prefer running from the backend directory:

```bash
cd backend
# add the repository root to PYTHONPATH
export PYTHONPATH=..
pytest -q
```

## Troubleshooting

- Ports in use: change frontend port via Vite if 5173 is busy.
- CORS: backend allows origins from settings; adjust .env if hosting separately.
- Vault dev: run scripts/vault_bootstrap.sh for local keys (dev only).
- Threshold: set CONF_THRESHOLD (e.g., 0.6) to tune noise filter.

## Links

- OpenAPI: http://localhost:8000/openapi.json
- Prometheus: http://localhost:9090
- Docs: docs/ (CHANGELOG.md, TASKS.md)
