#!/bin/bash

# Codie Project Health Check Script
# This script verifies that all issues have been resolved

echo "🔍 Checking Codie Project Health..."
echo "=================================="

# Check if required directories exist
echo "📁 Checking directory structure..."

directories=(
    "src/backend"
    "src/frontend"
    "src/backend/app"
    "config/environments"
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
    "src/backend/requirements.txt"
    "src/frontend/package.json"
    "config/environments/env.example"
    "infra/env.sample"
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
if grep -q "aiosqlite" src/backend/requirements.txt; then
    echo "✅ aiosqlite driver added to requirements.txt"
else
    echo "❌ aiosqlite driver not found in requirements.txt"
fi

# Check if environment files exist
echo ""
echo "🔐 Checking environment configuration..."
if [ -f ".env.example" ]; then
    echo "✅ Environment example exists"
else
    echo "❌ Environment example missing"
fi

if [ -f "infra/env.sample" ]; then
    echo "✅ Infrastructure environment sample exists"
else
    echo "❌ Infrastructure environment sample missing"
fi

# Check database configuration
echo ""
echo "🗄️ Checking database configuration..."
if grep -q "DATABASE_URL" .env.example 2>/dev/null; then
    echo "✅ Database URL configured in .env.example"
else
    echo "⚠️  DATABASE_URL not found in .env.example (SQLite default will be used)"
fi

echo ""
echo "🎉 Health check complete!"
echo ""
echo "Next steps:"
echo "1. Install backend dependencies: cd src/backend && pip install -r requirements.txt"
echo "2. Copy environment file: cp .env.example .env"
echo "3. Start backend: cd src/backend && uvicorn app.main:app --reload"
echo "4. Start frontend: cd src/frontend && pnpm install && pnpm run dev"
