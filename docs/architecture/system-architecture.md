# System Architecture

Codie is an AI-first code quality platform combining static analysis, runtime testing, adaptive style learning, conversational review, CVE-enriched security scanning, and confidence-based filtering.

## High-Level Components

- Frontend (Next.js/React): PR review UI, diff viewer, chat, graphs (call graph, hotspots), dashboards.
- API Gateway (FastAPI): AuthN/Z, REST/WebSocket, aggregation for frontend.
- Analysis Orchestrator: Schedules jobs (static, runtime, style, security, LLM).
- Static Analysis Service: Tree-sitter-Graph parsing, call graph, complexity, churn calculations.
- Runtime Executor: Dockerized tests/benchmarks; metrics capture (time, CPU, memory, heap).
- Style ML Service: NATURALIZE-like n-gram model training; deviation scoring and suggestions.
- LLM Review Service: Prompt assembly, explainable recommendations, proposed diffs/patches.
- Security Enrichment: Snyk integration; CVE/NVD enrichment; remediation snippets.
- Scoring Service: Confidence blending (LLM logprobs + severity + priors + feedback).
- Export Service: Markdown/PDF reports for audit trails and sharing.

## Data Stores and Infra

- PostgreSQL (+ pgvector): metadata, job results, vectors (optional).
- Redis: queues, caching, WebSocket pub/sub.
- Object Storage (MinIO/S3): artifacts (logs, coverage, call graphs).
- Observability: OpenTelemetry, Prometheus, Grafana, Loki logs.
- Container Runtime: Docker; K8s for production; Helm for deployment.

## Security Architecture

- OAuth via GitHub/GitLab; short-lived JWT; RBAC per org/project.
- Sandboxed runtime: seccomp/apparmor, read-only FS, CPU/memory limits, no host mounts.
- LLM redaction: secrets/PII masking before outbound prompts.
- Supply chain: SBOM (syft) and scans (grype/Snyk), pinned digests, Renovate bot.
- Network policies: egress allowlist (GitHub, Snyk, OpenAI) and TLS termination.
- Secrets: Vault/Doppler or GH secrets; never commit real secrets.

## Performance and Efficiency

- Async I/O services, connection pooling, indexes for critical queries.
- Incremental analyses using diffs; reuse call graph snapshots.
- Redis cache for hot endpoints; artifact offload to S3 with signed URLs.
- Anomaly detection on runtime metrics (z-score; Netflix-style approach later).

## Governance and Docs

- Conventional Commits; root and per-module CHANGELOGs.
- OpenAPI generated and linted (Spectral); API diffing in CI.
- Docs coverage metric; policy-as-code (Oso) to enforce merge policies.

## Sequence (PR Review)

1. Webhook received -> orchestrator enqueues jobs.
2. Static analysis: call graphs, complexity, churn.
3. Runtime: tests/benchmarks -> metrics + artifacts.
4. Security: ingest Snyk -> CVE enrichment.
5. LLM review combines context -> suggestions & diffs.
6. Scoring consolidates confidence -> noise filter applied.
7. UI renders prioritized findings; user can “Ask Why” or “Apply Fix”.
8. Apply Fix triggers patch commit/PR -> CI reruns checks.
