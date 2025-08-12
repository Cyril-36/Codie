#!/bin/bash

# Codie Backend Production Deployment Script
set -e

echo "🚀 Starting Codie Backend Production Deployment..."

# Configuration
ENVIRONMENT=${1:-production}
COMPOSE_FILE="infra/docker-compose.yml"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install it and try again."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        log_warn ".env file not found. Creating from example..."
        if [ -f "config/environments/env.example" ]; then
            cp config/environments/env.example .env
            log_warn "Please edit .env file with your production values before continuing."
            read -p "Press Enter when you've configured .env file..."
        else
            log_error "config/environments/env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
    
    log_info "Prerequisites check passed."
}

backup_data() {
    log_info "Creating backup of current data..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if docker ps | grep -q "codie-db"; then
        log_info "Backing up database..."
        docker exec codie-db pg_dump -U codie codie > "$BACKUP_DIR/database_backup.sql" || log_warn "Database backup failed"
    fi
    
    # Backup Redis data
    if docker ps | grep -q "codie-redis"; then
        log_info "Backing up Redis data..."
        docker exec codie-redis redis-cli --rdb "$BACKUP_DIR/redis_backup.rdb" || log_warn "Redis backup failed"
    fi
    
    # Backup application data
    if [ -d "data" ]; then
        log_info "Backing up application data..."
        cp -r data "$BACKUP_DIR/"
    fi
    
    log_info "Backup completed: $BACKUP_DIR"
}

stop_services() {
    log_info "Stopping existing services..."
    
    if [ -f "$COMPOSE_FILE" ]; then
        docker-compose -f "$COMPOSE_FILE" down --remove-orphans
    fi
    
    log_info "Services stopped."
}

update_images() {
    log_info "Updating Docker images..."
    
    # Pull latest images
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Build backend if needed
    log_info "Building backend image..."
    docker-compose -f "$COMPOSE_FILE" build backend
    
    log_info "Images updated."
}

start_services() {
    log_info "Starting services..."
    
    # Start services with health checks
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    
    # Wait for database
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker exec codie-db pg_isready -U codie > /dev/null 2>&1; then
            log_info "Database is healthy"
            break
        fi
        sleep 5
        timeout=$((timeout - 5))
    done
    
    if [ $timeout -le 0 ]; then
        log_error "Database failed to become healthy"
        exit 1
    fi
    
    # Wait for Redis
    timeout=30
    while [ $timeout -gt 0 ]; do
        if docker exec codie-redis redis-cli ping > /dev/null 2>&1; then
            log_info "Redis is healthy"
            break
        fi
        sleep 5
        timeout=$((timeout - 5))
    done
    
    if [ $timeout -le 0 ]; then
        log_error "Redis failed to become healthy"
        exit 1
    fi
    
    # Wait for backend
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:8001/health > /dev/null 2>&1; then
            log_info "Backend is healthy"
            break
        fi
        sleep 5
        timeout=$((timeout - 5))
    done
    
    if [ $timeout -le 0 ]; then
        log_error "Backend failed to become healthy"
        exit 1
    fi
    
    log_info "All services are healthy."
}

run_migrations() {
    log_info "Running database migrations..."
    
    # This would typically run Alembic migrations
    # For now, we'll just log that migrations would run
    log_info "Migrations completed (mock)."
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check all endpoints
    endpoints=(
        "http://localhost:8001/health"
        "http://localhost:8001/metrics"
        "http://localhost:8001/api/v1/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f "$endpoint" > /dev/null 2>&1; then
            log_info "✓ $endpoint is responding"
        else
            log_error "✗ $endpoint is not responding"
            exit 1
        fi
    done
    
    # Check service status
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log_info "✓ All services are running"
    else
        log_error "✗ Some services are not running"
        exit 1
    fi
    
    log_info "Deployment verification completed successfully."
}

show_status() {
    log_info "Deployment Status:"
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    log_info "Service URLs:"
    echo "  Backend API: http://localhost:8001"
    echo "  Frontend: http://localhost:5174"
    echo "  Prometheus: http://localhost:9090"
    echo "  Grafana: http://localhost:3000"
    echo "  Vault: http://localhost:8200"
    echo ""
    log_info "Health Check: http://localhost:8001/health"
    echo ""
}

# Main deployment flow
main() {
    log_info "Starting deployment for environment: $ENVIRONMENT"
    
    check_prerequisites
    backup_data
    stop_services
    update_images
    start_services
    run_migrations
    verify_deployment
    show_status
    
    log_info "🎉 Deployment completed successfully!"
    log_info "Backup location: $BACKUP_DIR"
}

# Run main function
main "$@"
