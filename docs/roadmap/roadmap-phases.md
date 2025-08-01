# Roadmap — Phased Implementation with Docs & Changelog Steps

This roadmap mirrors execution phases with explicit documentation and changelog obligations. Each step/substep includes:
- Required code deliverables
- Required docs updates and locations
- Required changelog entries (root and module)
- CI gates that will enforce completion

## Phase 1 (Weeks 1–3): Foundation + Core Intelligence

### Week 1 — Infrastructure & Skeletons
1.1 Monorepo scaffold
- Code: repo root files (.editorconfig, CODEOWNERS, LICENSE, README)
- Docs: /docs/getting-started.md; /docs/architecture/system-architecture.md; ADR-0001 monorepo
- Changelog: root CHANGELOG.md (Unreleased: feat: scaffold)
- CI: lint/type skeleton; docs presence check

1.2 Backend service skeletons
- Code: codie-backend/gateway-api (FastAPI), analysis-orchestrator, shared models
- Docs: /docs/backend/getting-started.md; /docs/backend/services/gateway-api.md; /docs/backend/services/analysis-orchestrator.md
- Changelog: codie-backend/CHANGELOG.md
- CI: OpenAPI stub export; Spectral lint

1.3 Frontend shell
- Code: codie-frontend Next.js app shell; secure headers; NextAuth placeholder
- Docs: /docs/frontend/getting-started.md; /docs/frontend/ui-ux-guide.md
- Changelog: codie-frontend/CHANGELOG.md
- CI: route audit; CSP header check

1.4 Local infra
- Code: infra/docker-compose with Postgres, Redis, MinIO, backend, frontend
- Docs: /docs/devops/docker-compose.md; /docs/devops/local-dev.md
- Changelog: infra/CHANGELOG.md
- CI: compose validate

### Week 2 — Repo Analysis Engine
2.1 Call graph & parsing
- Code: static-analysis service; Tree-sitter integration; basic call graph dump
- Docs: /docs/backend/services/static-analysis.md; /docs/architecture/data-model.md (artifacts)
- Changelog: codie-backend/CHANGELOG.md
- CI: performance smoke; artifacts upload

2.2 Git churn + complexity
- Code: churn extractor; radon (py)/ESLint metrics (js/ts)
- Docs: /docs/architecture/analytics-metrics.md
- Changelog: codie-backend/CHANGELOG.md
- CI: metrics schema validation

2.3 Repo Intelligence UI
- Code: Hotspot map D3 component; Intelligence route
- Docs: /docs/frontend/components/hotspot-map.md
- Changelog: codie-frontend/CHANGELOG.md
- CI: UI snapshot & a11y lint

### Week 3 — Dynamic Testing Framework
3.1 Runtime executor
- Code: containerized test runner; CPU/mem/time capture
- Docs: /docs/backend/services/runtime-executor.md; runbook performance-regression.md
- Changelog: codie-backend/CHANGELOG.md
- CI: perf guardrail job (advisory)

3.2 Anomaly detection
- Code: z-score baseline; comparisons
- Docs: /docs/architecture/performance-engineering.md
- Changelog: codie-backend/CHANGELOG.md
- CI: metrics regression detector enabled

3.3 Dashboard
- Code: runtime analytics UI; charts
- Docs: /docs/frontend/components/performance-panel.md
- Changelog: codie-frontend/CHANGELOG.md
- CI: e2e smoke

## Phase 2 (Weeks 4–5): AI + Conversational + Adaptive Style

### Week 4 — Conversational Review
4.1 LLM review service
- Code: prompt builder; structured JSON outputs; diffs
- Docs: /docs/ai/prompting-standards.md; /docs/backend/services/llm-review.md
- Changelog: codie-backend/CHANGELOG.md
- CI: LLM redaction tests

4.2 Chat-first UI
- Code: conversation panel; context chips; diff overlay
- Docs: /docs/frontend/components/chat-panel.md; /docs/frontend/components/diff-viewer.md
- Changelog: codie-frontend/CHANGELOG.md
- CI: e2e ask-why flow

4.3 Apply-fix workflow
- Code: patch application, dry-run, signed commit/PR
- Docs: /docs/runbooks/apply-fix.md
- Changelog: root + backend + frontend
- CI: gating tests + perf smoke on apply

### Week 5 — Style-Adaptive Engine
5.1 Style ML training
- Code: style-ml service; n-gram model; deviation scores
- Docs: /docs/ai/structured-outputs.md; /docs/backend/services/style-ml.md
- Changelog: codie-backend/CHANGELOG.md
- CI: dataset privacy/redaction checks

5.2 UI surfacing and autofix toggles
- Code: style insights page; autofix toggle
- Docs: /docs/frontend/components/style-insights.md
- Changelog: codie-frontend/CHANGELOG.md
- CI: a11y checks; snapshot

## Phase 3 (Weeks 6–7): Test Generation + Refactor Planner

### Week 6 — Test Generation
6.1 GPT test chains (Py/JS)
- Code: generators; coverage diff computation
- Docs: /docs/ai/test-generation.md; /docs/frontend/components/tests-coverage.md
- Changelog: backend + frontend
- CI: flake detection, quarantine gates

6.2 Diffblue for Java (flagged)
- Code: connector; feature flag controls
- Docs: /docs/integrations/diffblue.md
- Changelog: backend
- CI: license/availability guard

### Week 7 — Refactor Intelligence
7.1 ROI-ranked planner
- Code: combine churn + complexity + coupling; rank suggestions
- Docs: /docs/backend/services/scoring-service.md; /docs/frontend/components/refactor-planner.md
- Changelog: backend + frontend
- CI: ranking determinism tests

## Phase 4 (Weeks 8–9): Security + Noise Reduction + Launch

### Week 8 — Security Intelligence
8.1 Snyk ingestion + CVE enrichment
- Code: security-enrichment service; remediation snippets
- Docs: /docs/backend/services/security-enrichment.md; /docs/devops/sbom-and-scanning.md
- Changelog: backend
- CI: SAST + image scans; block on criticals

### Week 9 — Confidence Scoring & Launch
9.1 Confidence scorer + filter
- Code: blend logprobs + severity + priors + feedback
- Docs: /docs/architecture/analytics-metrics.md (confidence scoring)
- Changelog: backend
- CI: precision/recall sampling tests

9.2 Launch hardening
- Code: rate limits, CSP, audit logs, dashboards
- Docs: /docs/devops/k8s-deploy.md; /docs/devops/ci-cd.md
- Changelog: root release entry
- CI: release workflow; README badges

## Documentation and Changelog Enforcement

- Every step requires:
  - Docs updates to relevant service/component pages
  - CHANGELOG entries in root and module directories
  - CI will fail if:
    - OpenAPI changed without docs
    - Code paths changed without related docs or changelog entries
    - Security/perf-sensitive areas changed without required reviewers
