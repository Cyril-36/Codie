#!/bin/bash

# Codie Project Health Check Script
# This script verifies that all issues have been resolved

echo "🔍 Checking Codie Project Health..."
echo "=================================="

# Check if required directories exist
echo "📁 Checking directory structure..."

directories=(
    "codie-backend"
    "codie-frontend"
    "codie-backend/app"
    "codie-backend/data"
    "codie-backend/logs"
    "config/environments"
    "deployments/development/config/postgres"
    "deployments/development/config/redis"
    "docs"
    "infra"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
    else
        echo "❌ $dir missing"
    fi
done

# Check if required files exist
echo ""
echo "📄 Checking required files..."

files=(
    "codie-backend/requirements.txt"
    "codie-backend/env.sample"
    "codie-backend/ruff.toml"
    "codie-backend/pytest.ini"
    "codie-backend/mypy.ini"
    "codie-frontend/package.json"
    "codie-frontend/env.local.example"
    "codie-frontend/.eslintrc.json"
    "config/environments/env.example"
    "infra/env.sample"
    "deployments/development/config/postgres/init.sql"
    "deployments/development/config/redis/redis.conf"
    "config/monitoring/prometheus.yml"
    ".gitignore"
    "README.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check for aiosqlite in requirements
echo ""
echo "🔧 Checking database driver fix..."
if grep -q "aiosqlite" codie-backend/requirements.txt; then
    echo "✅ aiosqlite driver added to requirements.txt"
else
    echo "❌ aiosqlite driver not found in requirements.txt"
fi

# Check if environment files exist
echo ""
echo "🔐 Checking environment configuration..."
if [ -f "codie-backend/env.sample" ]; then
    echo "✅ Backend environment sample exists"
else
    echo "❌ Backend environment sample missing"
fi

if [ -f "codie-frontend/env.local.example" ]; then
    echo "✅ Frontend environment sample exists"
else
    echo "❌ Frontend environment sample missing"
fi

if [ -f "infra/env.sample" ]; then
    echo "✅ Infrastructure environment sample exists"
else
    echo "❌ Infrastructure environment sample missing"
fi

# Check database URL in environment
echo ""
echo "🗄️ Checking database configuration..."
if grep -q "sqlite+aiosqlite" codie-backend/env.sample; then
    echo "✅ Database URL configured for async SQLite"
else
    echo "❌ Database URL not properly configured"
fi

# Check for configuration files
echo ""
echo "⚙️ Checking configuration files..."
if [ -f "codie-backend/ruff.toml" ]; then
    echo "✅ Ruff configuration exists"
else
    echo "❌ Ruff configuration missing"
fi

if [ -f "codie-backend/pytest.ini" ]; then
    echo "✅ Pytest configuration exists"
else
    echo "❌ Pytest configuration missing"
fi

if [ -f "codie-backend/mypy.ini" ]; then
    echo "✅ MyPy configuration exists"
else
    echo "❌ MyPy configuration missing"
fi

if [ -f "codie-frontend/.eslintrc.json" ]; then
    echo "✅ ESLint configuration exists"
else
    echo "❌ ESLint configuration missing"
fi

echo ""
echo "🎉 Health check complete!"
echo ""
echo "Next steps:"
echo "1. Install backend dependencies: cd codie-backend && pip install -r requirements.txt"
echo "2. Copy environment file: cp codie-backend/env.sample codie-backend/.env"
echo "3. Copy frontend environment: cp codie-frontend/env.local.example codie-frontend/.env.local"
echo "4. Copy infra environment: cp infra/env.sample infra/.env"
echo "5. Start backend: cd codie-backend && uvicorn app.main:app --reload"
echo "6. Start frontend: cd codie-frontend && npm install && npm run dev"
