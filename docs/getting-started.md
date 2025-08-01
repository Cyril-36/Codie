# Getting Started

Welcome to Codie — an AI-first code quality platform. This guide helps you run the project locally and understand the repository layout.

## Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- GitHub account (for OAuth in dev)
- OpenAI API key (optional, for LLM features in dev)

## Monorepo Layout
- codie-backend: FastAPI microservices and workers
- codie-frontend: Next.js React app
- ai-agents: prompts, pipelines, scripts, .clinerules
- infra: Docker Compose & Kubernetes manifests
- docs: PRDs, architecture, services, devops, runbooks, ADRs

## Quick Start (Local)
1. Copy example envs:
   - cp codie-backend/.env.sample codie-backend/.env
   - cp codie-frontend/.env.local.example codie-frontend/.env.local
   - cp infra/.env.sample infra/.env
2. Start services:
   - docker compose up --build
3. Open UIs:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/docs
   - MinIO: http://localhost:9001
4. Stop:
   - docker compose down

## Security Defaults (Dev)
- Non-root containers, read-only FS where possible
- Minimal scopes for tokens
- CSP headers in frontend; HSTS in prod
- Request validation with Pydantic; strict CORS
- LLM redaction for secrets/PII (dev-enabled toggle)

## Next Steps
- Read /docs/architecture/system-architecture.md
- See /docs/backend/getting-started.md for API development
- See /docs/frontend/getting-started.md for UI development
- Review CI/CD in /docs/devops/ci-cd.md
