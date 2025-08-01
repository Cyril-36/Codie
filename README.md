# Codie — AI Code Review Assistant

Secure, efficient, and explainable AI platform for end-to-end code quality:
- Repository-wide dependency mapping and hotspots
- Dynamic runtime analysis for regressions
- Chat-first, explainable reviews with diffs and one-click fixes
- Adaptive style learning (project-specific)
- AI test generation (Java via Diffblue, JS/Python via GPT)
- ROI-ranked refactoring guidance
- CVE-enriched security remediation
- Confidence-scored noise filtering

This repository is a monorepo with backend, frontend, AI orchestration, infra, and comprehensive documentation with automated changelogs and governance.

## Monorepo Structure

- codie-backend: FastAPI microservices (API Gateway, analysis orchestration, static/runtime analysis, style ML, LLM review, security enrichment, scoring, export)
- codie-frontend: Next.js/React app with Tailwind, Radix UI, Monaco, D3/VisX
- ai-agents: prompts, pipelines, .clinerules, scripts for codemods and automation
- infra: Docker Compose for local, Kubernetes manifests/helm, CI/CD configs
- docs: PRDs, architecture, services, devops, runbooks, ADRs, OpenAPI, diagrams

## Quick Start

1) Prerequisites: Docker, Docker Compose, Node 18+, Python 3.11+
2) Copy .env.sample to .env for each module and fill secrets/placeholders
3) Local run:
   - docker compose up --build
4) Open:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs
   - MinIO: http://localhost:9001
   - Postgres: localhost:5432, Redis: localhost:6379

## Security, Quality, and Docs Governance

- Security: TLS (prod), least-privilege tokens, sandboxed runtimes, SBOM & vulnerability scans, secret/PII redaction to LLMs
- Quality: ruff/black/mypy, ESLint/TS strict, unit/integration/e2e tests, coverage gates
- Docs & Changelog: Keep a Changelog + SemVer; per-module CHANGELOGs; CI-enforced docs updates with OpenAPI sync and Spectral lint
- Optional metrics: Docs Coverage, Test Coverage, Perf Regression Score, Security Hygiene Score (disabled by default)
- Policy-as-code (optional): Oso policies to block merges on missing docs for high-risk changes

## Badges

| Backend | Frontend | OpenAPI | Docs |
|---|---|---|---|
| ![Backend CI](https://github.com/OWNER/REPO/actions/workflows/backend.yml/badge.svg) | ![Frontend CI](https://github.com/OWNER/REPO/actions/workflows/frontend.yml/badge.svg) | ![OpenAPI CI](https://github.com/OWNER/REPO/actions/workflows/openapi.yml/badge.svg) | ![Docs CI](https://github.com/OWNER/REPO/actions/workflows/docs.yml/badge.svg) |

> Replace OWNER/REPO with your GitHub slug to activate badges.

<!-- badge:docs-coverage -->
<!-- badge:test-coverage -->
<!-- badge:perf-regression -->
<!-- badge:security-hygiene -->

## Contributor Quickstart

Prereqs:
- Python 3.11+, Node 20+, Docker + Docker Compose

Backend:
```bash
python3 -m pip install -r codie-backend/requirements.txt
# optional probes via .env
# ENABLE_POSTGRES_PROBE=true
# POSTGRES_DSN=postgresql://postgres:postgres@localhost:5432/postgres
# ENABLE_REDIS_PROBE=true
# REDIS_URL=redis://localhost:6379/0
uvicorn codie-backend.app.main:app --reload
# Health
curl http://localhost:8000/livez
curl http://localhost:8000/readyz
```

Frontend:
```bash
cd codie-frontend
npm ci
npm run lint --if-present
npm run build
npm start
```

OpenAPI governance:
```bash
python codie-backend/app/openapi_export.py -o docs/openapi/openapi.json
# Spectral lint (via CI; locally if installed)
# spectral lint docs/openapi/openapi.json -r .spectral.yaml
# redocly lint docs/openapi/openapi.json
```

Local DB/Cache (optional):
- Postgres: localhost:5432
- Redis: localhost:6379
- You can add docker-compose services later for frictionless onboarding.

## License

MIT
