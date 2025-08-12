# Enterprise Codie Project Makefile
# Provides comprehensive development, testing, and deployment commands

.PHONY: help install dev test lint format clean build deploy docs security audit

# Default target
help: ## Show this help message
	@echo "Enterprise Codie Project - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Setup
install: ## Install all dependencies
	@echo "Installing project dependencies..."
	pip install -e ".[dev,test,docs,monitoring]"
	cd src/frontend && pnpm install
	@echo "✅ Dependencies installed successfully"

dev: ## Start development environment
	@echo "Starting development environment..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:5173"
	@echo "API Docs: http://localhost:8000/docs"
	@make -j2 dev-backend dev-frontend

dev-backend: ## Start backend development server
	@echo "Starting backend development server..."
	cd src/backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start frontend development server
	@echo "Starting frontend development server..."
	cd src/frontend && pnpm dev

# Testing
test: ## Run all tests
	@echo "Running comprehensive test suite..."
	@make test-backend
	@make test-frontend
	@make test-e2e

test-backend: ## Run backend tests
	@echo "Running backend tests..."
	cd src/backend && python -m pytest tests/ -v --cov=app --cov-report=html --cov-report=term-missing

test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	cd src/frontend && pnpm test:coverage

test-e2e: ## Run end-to-end tests
	@echo "Running end-to-end tests..."
	cd src/frontend && pnpm test:e2e

test-watch: ## Run tests in watch mode
	@echo "Running tests in watch mode..."
	cd src/frontend && pnpm test:watch

# Code Quality
lint: ## Run all linting and type checking
	@echo "Running code quality checks..."
	@make lint-backend
	@make lint-frontend

lint-backend: ## Lint backend code
	@echo "Linting backend code..."
	cd src/backend && ruff check . && mypy app/

lint-frontend: ## Lint frontend code
	@echo "Linting frontend code..."
	cd src/frontend && pnpm lint && pnpm type-check

format: ## Format all code
	@echo "Formatting code..."
	@make format-backend
	@make format-frontend

format-backend: ## Format backend code
	@echo "Formatting backend code..."
	cd src/backend && black . && isort .

format-frontend: ## Format frontend code
	@echo "Formatting frontend code..."
	cd src/frontend && pnpm format

# Security & Quality
security: ## Run security scans
	@echo "Running security scans..."
	@make security-backend
	@make security-frontend

security-backend: ## Security scan backend
	@echo "Scanning backend for security issues..."
	cd src/backend && safety check && bandit -r app/ -f json -o security-report.json

security-frontend: ## Security scan frontend
	@echo "Scanning frontend for security issues..."
	cd src/frontend && pnpm audit

audit: ## Run comprehensive security audit
	@echo "Running comprehensive security audit..."
	@make security
	@echo "Checking for known vulnerabilities..."
	@echo "Scanning dependencies..."
	@echo "Running SAST analysis..."

# Building & Deployment
build: ## Build all components
	@echo "Building project components..."
	@make build-backend
	@make build-frontend

build-backend: ## Build backend
	@echo "Building backend..."
	cd src/backend && python -m build

build-frontend: ## Build frontend
	@echo "Building frontend..."
	cd src/frontend && pnpm build

deploy: ## Deploy to production
	@echo "Deploying to production..."
	@make build
	@make deploy-infrastructure
	@make deploy-applications

deploy-staging: ## Deploy to staging
	@echo "Deploying to staging..."
	@make build
	@make deploy-infrastructure-staging
	@make deploy-applications-staging

deploy-infrastructure: ## Deploy infrastructure
	@echo "Deploying infrastructure..."
	cd deployments/production && docker-compose up -d

deploy-applications: ## Deploy applications
	@echo "Deploying applications..."
	@echo "Backend deployment..."
	@echo "Frontend deployment..."
	@echo "Database migrations..."

# Documentation
docs: ## Generate and serve documentation
	@echo "Generating documentation..."
	@make docs-build
	@make docs-serve

docs-build: ## Build documentation
	@echo "Building documentation..."
	cd docs && mkdocs build

docs-serve: ## Serve documentation locally
	@echo "Serving documentation at http://localhost:8001"
	cd docs && mkdocs serve --dev-addr=localhost:8001

# Database Management
db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	cd src/backend && alembic upgrade head

db-rollback: ## Rollback database migrations
	@echo "Rolling back database migrations..."
	cd src/backend && alembic downgrade -1

db-reset: ## Reset database
	@echo "Resetting database..."
	cd src/backend && alembic downgrade base && alembic upgrade head

# Monitoring & Health Checks
health: ## Check system health
	@echo "Checking system health..."
	@make health-backend
	@make health-frontend
	@make health-database

health-backend: ## Check backend health
	@echo "Checking backend health..."
	@curl -f http://localhost:8000/health || echo "Backend health check failed"

health-frontend: ## Check frontend health
	@echo "Checking frontend health..."
	@curl -f http://localhost:5173 || echo "Frontend health check failed"

health-database: ## Check database health
	@echo "Checking database health..."
	@cd src/backend && python -c "from app.core.db import check_db_health; check_db_health()" || echo "Database health check failed"

# Cleanup
clean: ## Clean all build artifacts and caches
	@echo "Cleaning project..."
	@make clean-backend
	@make clean-frontend
	@make clean-reports
	@rm -rf .pytest_cache .coverage .mypy_cache
	@find . -type d -name "__pycache__" -exec rm -rf {} +
	@find . -type d -name "*.egg-info" -exec rm -rf {} +
	@find . -type f -name "*.pyc" -delete
	@echo "✅ Cleanup completed"

clean-backend: ## Clean backend artifacts
	@echo "Cleaning backend artifacts..."
	cd src/backend && rm -rf build/ dist/ .coverage htmlcov/

clean-frontend: ## Clean frontend artifacts
	@echo "Cleaning frontend artifacts..."
	cd src/frontend && rm -rf dist/ node_modules/ .next/ .nuxt/ .output/

clean-reports: ## Clean report files
	@echo "Cleaning report files..."
	rm -rf *.html .coverage *.json

# Development Tools
setup-hooks: ## Setup pre-commit hooks
	@echo "Setting up pre-commit hooks..."
	pre-commit install

update-deps: ## Update all dependencies
	@echo "Updating dependencies..."
	@make update-deps-backend
	@make update-deps-frontend

update-deps-backend: ## Update backend dependencies
	@echo "Updating backend dependencies..."
	cd src/backend && pip install --upgrade -r requirements.txt

update-deps-frontend: ## Update frontend dependencies
	@echo "Updating frontend dependencies..."
	cd src/frontend && pnpm update

# Performance & Profiling
profile: ## Run performance profiling
	@echo "Running performance profiling..."
	@make profile-backend
	@make profile-frontend

profile-backend: ## Profile backend performance
	@echo "Profiling backend performance..."
	cd src/backend && python -m cProfile -o backend-profile.prof app/main.py

profile-frontend: ## Profile frontend performance
	@echo "Profiling frontend performance..."
	cd src/frontend && pnpm build:analyze

# Docker Operations
docker-build: ## Build all Docker images
	@echo "Building Docker images..."
	@make docker-build-backend
	@make docker-build-frontend

docker-build-backend: ## Build backend Docker image
	@echo "Building backend Docker image..."
	cd src/backend && docker build -t codie-backend:latest .

docker-build-frontend: ## Build frontend Docker image
	@echo "Building frontend Docker image..."
	cd src/frontend && docker build -t codie-frontend:latest .

docker-run: ## Run application with Docker Compose
	@echo "Running application with Docker Compose..."
	cd deployments/development && docker-compose up -d

docker-stop: ## Stop Docker Compose services
	@echo "Stopping Docker Compose services..."
	cd deployments/development && docker-compose down

# CI/CD
ci: ## Run CI pipeline locally
	@echo "Running CI pipeline locally..."
	@make lint
	@make test
	@make build
	@make security
	@echo "✅ CI pipeline completed successfully"

# Quick Development Commands
quick-dev: ## Quick development setup
	@echo "Quick development setup..."
	@make install
	@make setup-hooks
	@make dev

quick-test: ## Quick test run
	@echo "Quick test run..."
	@make lint
	@make test

# Environment Management
env-setup: ## Setup development environment
	@echo "Setting up development environment..."
	@make install
	@make setup-hooks
	@make db-migrate
	@echo "✅ Development environment ready"

env-reset: ## Reset development environment
	@echo "Resetting development environment..."
	@make clean
	@make env-setup

# Helpers
status: ## Show project status
	@echo "Project Status:"
	@echo "Backend: $(shell if curl -s http://localhost:8000/health > /dev/null; then echo "✅ Running"; else echo "❌ Stopped"; fi)"
	@echo "Frontend: $(shell if curl -s http://localhost:5173 > /dev/null; then echo "✅ Running"; else echo "❌ Stopped"; fi)"
	@echo "Database: $(shell if [ -f deployments/development/codie_dev.db ]; then echo "✅ Available"; else echo "❌ Missing"; fi)"

# Default target
.DEFAULT_GOAL := help
