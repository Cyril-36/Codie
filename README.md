# 🤖 Codie — AI Code Review Assistant

*Secure, efficient, and explainable AI platform for end-to-end code quality*

[![Backend CI](https://github.com/Cyril-36/Codie/actions/workflows/backend.yml/badge.svg)](https://github.com/Cyril-36/Codie/actions/workflows/backend.yml) [![Frontend CI](https://github.com/Cyril-36/Codie/actions/workflows/frontend.yml/badge.svg)](https://github.com/Cyril-36/Codie/actions/workflows/frontend.yml) [![OpenAPI CI](https://github.com/Cyril-36/Codie/actions/workflows/openapi.yml/badge.svg)](https://github.com/Cyril-36/Codie/actions/workflows/openapi.yml) [![Docs CI](https://github.com/Cyril-36/Codie/actions/workflows/docs.yml/badge.svg)](https://github.com/Cyril-36/Codie/actions/workflows/docs.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/) [![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/) [![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

---

## ✨ Key Features

🗺️ **Repository-wide dependency mapping and hotspots**  
🔍 **Dynamic runtime analysis for regressions**  
💬 **Chat-first, explainable reviews with diffs and one-click fixes**  
🎯 **Adaptive style learning (project-specific)**  
🧪 **AI test generation (Java via Diffblue, JS/Python via GPT)**  
💰 **ROI-ranked refactoring guidance**  
🛡️ **CVE-enriched security remediation**  
🎛️ **Confidence-scored noise filtering**  

> This repository is a monorepo with backend, frontend, AI orchestration, infrastructure, and comprehensive documentation with automated changelogs and governance.

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph "User Interface"
        UI["🎨 Next.js Frontend<br/>Monaco Editor + D3 Viz"]
    end
    
    subgraph "API Gateway"
        GW["🚪 FastAPI Gateway<br/>Authentication & Routing"]
    end
    
    subgraph "Core Services"
        AS["🔍 Analysis Service<br/>AST + Runtime Profiling"]
        RS["📊 Review Service<br/>LLM + Style ML"]
        TS["🧪 Test Generation<br/>Diffblue + GPT"]
        SS["🛡️ Security Service<br/>CVE + SAST"]
    end
    
    subgraph "Data Layer"
        PG[("📊 PostgreSQL<br/>Analysis Results")]
        RD[("⚡ Redis<br/>Cache & Sessions")]
        MO[("📁 MinIO<br/>Artifacts & Reports")]
    end
    
    UI --> GW
    GW --> AS
    GW --> RS
    GW --> TS
    GW --> SS
    AS --> PG
    RS --> PG
    TS --> MO
    SS --> PG
    GW --> RD
```

*Architecture diagram showing the core components and data flow*

## 📁 Monorepo Structure

```
Codie/
├── 🔧 codie-backend/     # FastAPI microservices
│   ├── API Gateway
│   ├── Analysis orchestration
│   ├── Static/runtime analysis
│   ├── Style ML & LLM review
│   └── Security & scoring
├── 🎨 codie-frontend/     # Next.js/React with Tailwind
│   ├── Radix UI components
│   ├── Monaco editor
│   └── D3/VisX visualizations
├── 🤖 ai-agents/          # AI prompts & automation
│   ├── Prompts & pipelines
│   ├── .clinerules
│   └── Codemods & scripts
├── 🐳 infra/              # Infrastructure & DevOps
│   ├── Docker Compose (local)
│   ├── Kubernetes manifests
│   └── CI/CD configurations
└── 📚 docs/               # Comprehensive documentation
    ├── PRDs & architecture
    ├── Service documentation
    ├── DevOps runbooks
    └── ADRs & OpenAPI specs
```

## 🚀 Quick Start

### Prerequisites

- 🐳 Docker & Docker Compose
- 🟢 Node.js 18+
- 🐍 Python 3.11+
- 💾 Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Cyril-36/Codie.git
   cd Codie
   ```

2. **Set up environment**
   ```bash
   # Copy environment templates
   cp .env.sample .env
   # Fill in your secrets and configuration
   ```

3. **Start the application**
   ```bash
   docker compose up --build
   ```

4. **Access the services**
   - 🌐 Frontend: http://localhost:5174
   - 📡 Backend API: http://localhost:8000/docs
   - 🗄️ MinIO: http://localhost:9001
   - 🐘 PostgreSQL: localhost:5432
   - 🔴 Redis: localhost:6379

## 🛠️ Tech Stack

### Backend
• **Framework**: FastAPI
• **Language**: Python 3.11+
• **Database**: PostgreSQL
• **Cache**: Redis
• **Storage**: MinIO
• **Container**: Docker

### Frontend
• **Framework**: Next.js/React
• **Styling**: Tailwind CSS
• **Components**: Radix UI
• **Editor**: Monaco
• **Visualization**: D3, VisX

### AI & ML
• **LLM Integration**: GPT-4, Claude
• **Code Analysis**: AST parsing
• **Test Generation**: Diffblue (Java)
• **Style Learning**: Custom ML models

### DevOps & Infrastructure
• **Containerization**: Docker, Docker Compose
• **Orchestration**: Kubernetes
• **CI/CD**: GitHub Actions
• **Monitoring**: Custom metrics

## 📸 Screenshots

### 🏠 Dashboard Overview
*Coming soon - Dashboard interface*

### 📊 Code Analysis Report
*Coming soon - Analysis report view*

### 💬 AI Chat Interface
*Coming soon - AI chat interface*

*Screenshots will be updated with actual application images*

## 🛡️ Security & Quality

### Security Features

- 🔐 TLS encryption in production
- 🎫 Least-privilege tokens
- 📦 Sandboxed runtimes
- 🔍 SBOM & vulnerability scans
- 🤐 Secret/PII redaction to LLMs

### Code Quality

- 🐍 Python: ruff, black, mypy
- 📜 TypeScript: ESLint, strict mode
- 🧪 Testing: Unit, integration, E2E
- 📈 Coverage gates enforced

### Documentation Governance

- 📝 Keep a Changelog + SemVer
- 📚 Per-module CHANGELOGs
- 🤖 CI-enforced docs updates
- 🔍 OpenAPI sync with Spectral lint
- 📊 Optional metrics: Docs/Test Coverage, Performance, Security

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

**Backend Development:**
```bash
cd codie-backend
python3 -m pip install -r requirements.txt
# Configure optional probes via .env
export ENABLE_POSTGRES_PROBE=true
export POSTGRES_DSN=postgresql://postgres:postgres@localhost:5432/postgres
export ENABLE_REDIS_PROBE=true
export REDIS_URL=redis://localhost:6379/0
uvicorn app.main:app --reload
```

**Health Checks:**
```bash
curl http://localhost:8000/livez   # Liveness probe
curl http://localhost:8000/readyz  # Readiness probe
```

**Frontend Development:**
```bash
cd codie-frontend
npm install
npm run dev
```

### 📋 Contribution Guidelines

- 🔄 Fork the repository
- 🌟 Create a feature branch
- ✅ Add tests for new features
- 📝 Update documentation
- 🚀 Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

### 💬 Get in Touch

[![GitHub Issues](https://img.shields.io/github/issues/Cyril-36/Codie.svg)](https://github.com/Cyril-36/Codie/issues) [![Discussions](https://img.shields.io/badge/GitHub-Discussions-blue.svg)](https://github.com/Cyril-36/Codie/discussions) [![Email](https://img.shields.io/badge/Email-Contact-red.svg)](mailto:cyrilchaitanya@gmail.com)

**Contact Email:** [cyrilchaitanya@gmail.com](mailto:cyrilchaitanya@gmail.com)

---

*Made with ❤️ by the Codie Team*  
*Empowering developers with intelligent code review*
