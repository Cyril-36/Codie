# Codie — AI Code Review Assistant

Secure, efficient, and explainable AI platform for end-to-end code quality

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/) [![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/) [![Docker Ready](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

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
        UI["🎨 UI<br/>Monaco Editor + D3 Viz"]
    end
    
    subgraph "API Gateway"
        GW["🚪 API Gateway<br/>Authentication & Routing"]
    end
    
    subgraph "Core Services"
        AUTH["🔐 Security<br/>User Management"]
        ANALYSIS["🔍 Analysis<br/>Static & Runtime"]
        AI["🤖 AI Orchestrator<br/>LLM Integration"]
        REVIEW["📝 Review<br/>Code Analysis"]
    end
    
    subgraph "Testing & Quality"
        TEST["🧪 Tests<br/>Generation & Execution"]
        METRICS["📊 Metrics<br/>Quality Scoring"]
    end
    
    subgraph "Data Layer"
        DB[("🐘 PostgreSQL<br/>Application Data")]
        CACHE[("🔴 Redis<br/>Session & Cache")]
        STORAGE[("📦 MinIO<br/>File Storage")]
    end
    
    UI --> GW
    GW --> AUTH
    GW --> ANALYSIS
    GW --> AI
    GW --> REVIEW
    
    ANALYSIS --> TEST
    AI --> REVIEW
    REVIEW --> METRICS
    
    AUTH --> DB
    ANALYSIS --> DB
    AI --> CACHE
    REVIEW --> DB
    TEST --> STORAGE
    METRICS --> DB
```

_Architecture diagram showing the core components and data flow_

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

• 🐳 Docker & Docker Compose  
• 🟢 Node.js 18+  
• 🐍 Python 3.11+  
• 💾 Git  

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
   • 🌐 Frontend: [http://localhost:5174](http://localhost:5174)  
   • 📡 Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)  
   • 🗄️ MinIO: [http://localhost:9001](http://localhost:9001)  
   • 🐘 PostgreSQL: localhost:5432  
   • 🔴 Redis: localhost:6379  

## 🛠️ Tech Stack

### Backend
• **Framework:** FastAPI  
• **Language:** Python 3.11+  
• **Database:** PostgreSQL  
• **Cache:** Redis  
• **Storage:** MinIO  
• **Container:** Docker  

### Frontend
• **Framework:** Next.js/React  
• **Styling:** Tailwind CSS  
• **Components:** Radix UI  
• **Editor:** Monaco  
• **Visualization:** D3, VisX  

### AI & ML
• **LLM Integration:** GPT-4, Claude  
• **Code Analysis:** AST parsing  
• **Test Generation:** Diffblue (Java)  
• **Style Learning:** Custom ML models  

### DevOps & Infrastructure
• **Containerization:** Docker, Docker Compose  
• **Orchestration:** Kubernetes  
• **CI/CD:** GitHub Actions  
• **Monitoring:** Custom metrics  

## 📸 Screenshots

### 🏠 Dashboard Overview
_Coming soon - Dashboard interface_

### 📊 Code Analysis Report
_Coming soon - Analysis report view_

### 💬 AI Chat Interface
_Coming soon - AI chat interface_

_Screenshots will be updated with actual application images_

## 🛡️ Security & Quality

### Security Features
• 🔐 TLS encryption in production  
• 🎫 Least-privilege tokens  
• 📦 Sandboxed runtimes  
• 🔍 SBOM & vulnerability scans  
• 🤐 Secret/PII redaction to LLMs  

### Code Quality
• 🐍 Python: ruff, black, mypy  
• 📜 TypeScript: ESLint, strict mode  
• 🧪 Testing: Unit, integration, E2E  
• 📈 Coverage gates enforced  

### Documentation Governance
• 📝 Keep a Changelog + SemVer  
• 📚 Per-module CHANGELOGs  
• 🤖 CI-enforced docs updates  
• 🔍 OpenAPI sync with Spectral lint  
• 📊 Optional metrics: Docs/Test Coverage, Performance, Security  

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
• 🔄 Fork the repository  
• 🌟 Create a feature branch  
• ✅ Add tests for new features  
• 📝 Update documentation  
• 🚀 Submit a pull request  

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

### 💬 Get in Touch

[![GitHub Issues](https://img.shields.io/github/issues/Cyril-36/Codie.svg)](https://github.com/Cyril-36/Codie/issues) [![Discussions](https://img.shields.io/github/discussions/Cyril-36/Codie.svg)](https://github.com/Cyril-36/Codie/discussions) [![Email](https://img.shields.io/badge/Email-Contact-blue.svg)](mailto:cyrilchaitanya@gmail.com)

Contact Email: [cyrilchaitanya@gmail.com](mailto:cyrilchaitanya@gmail.com)
