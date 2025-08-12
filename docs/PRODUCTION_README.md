# Codie Backend - Production Deployment Guide

## 🚀 Overview

This guide covers deploying the production-grade Codie Backend, which has been completely rewritten with enterprise-level features including:

- **Production Database**: PostgreSQL with connection pooling and health checks
- **Redis Integration**: Distributed rate limiting and caching
- **Enhanced Security**: Real CVE database integration, circuit breakers, comprehensive monitoring
- **AI Provider Management**: Multiple AI providers with fallback and circuit breaker patterns
- **Monitoring Stack**: Prometheus + Grafana for metrics and dashboards
- **Production Middleware**: Error handling, request logging, compression, security headers

## 📋 Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- At least 4GB RAM and 20GB disk space
- Domain name and SSL certificates (for production)
- API keys for AI providers (Gemini, Hugging Face, etc.)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   PostgreSQL    │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │      Redis      │
                       │  (Rate Limiting)│
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Prometheus    │
                       │   + Grafana     │
                       └─────────────────┘
```

## 🔧 Configuration

### 1. Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp config/environments/env.example .env

# Edit with your production values
nano .env
```

**Required Variables:**
```bash
# Database
CODIE_DB_USER=codie
CODIE_DB_PASS=your_secure_password_here
CODIE_DB_HOST=db
CODIE_DB_NAME=codie

# Redis
REDIS_PASSWORD=your_redis_password_here

# AI Providers
GEMINI_API_KEY=your_gemini_api_key_here
HUGGINGFACE_TOKEN=your_huggingface_token_here

# Security
SECURITY_SECRET_KEY=your_very_long_secret_key_here
SECURITY_NVD_API_KEY=your_nvd_api_key_here

# Application
APP_DEBUG=false
APP_ENVIRONMENT=production
```

### 2. SSL Configuration (Production)

For production, configure SSL certificates:

```bash
# Create SSL directory
mkdir -p infra/ssl

# Copy your certificates
cp your_cert.pem infra/ssl/cert.pem
cp your_key.pem infra/ssl/key.pem
```

Update `docker-compose.yml` to include SSL configuration.

## 🚀 Deployment

### Quick Start

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh production
```

### Manual Deployment

```bash
# 1. Start services
docker-compose -f infra/docker-compose.yml up -d

# 2. Wait for services to be healthy
docker-compose -f infra/docker-compose.yml ps

# 3. Check health endpoint
curl http://localhost:8001/health
```

### Service Verification

```bash
# Check all services
docker-compose -f infra/docker-compose.yml ps

# Check logs
docker-compose -f infra/docker-compose.yml logs -f backend

# Test endpoints
curl http://localhost:8001/health
curl http://localhost:8001/metrics
curl http://localhost:8001/api/v1/health
```

## 📊 Monitoring

### Prometheus Metrics

- **Endpoint**: `http://localhost:8001/metrics`
- **Key Metrics**:
  - `http_requests_total`: Total HTTP requests
  - `http_request_duration_seconds`: Request duration
  - `ai_provider_latency_seconds`: AI provider response time
  - `rate_limit_hits_total`: Rate limiting statistics

### Grafana Dashboards

- **URL**: `http://localhost:3000`
- **Default Credentials**: `admin/admin`
- **Dashboards**: Pre-configured Codie Backend metrics

### Health Checks

- **Comprehensive Health**: `http://localhost:8001/health`
- **Database Health**: Included in main health check
- **AI Provider Status**: Circuit breaker and provider health
- **Service Dependencies**: Redis, database, and external services

## 🔒 Security Features

### Rate Limiting
- **Redis-based**: Distributed rate limiting for production
- **Configurable**: Per-endpoint and per-client limits
- **Headers**: Rate limit information in response headers

### Security Headers
- **CORS**: Configurable cross-origin policies
- **Security Headers**: HSTS, XSS protection, content security policy
- **Authentication**: JWT-based authentication (configurable)

### CVE Scanning
- **Real Databases**: NVD and OSV API integration
- **Caching**: Configurable TTL for vulnerability data
- **Multiple Languages**: Python, JavaScript, Java, Go, Rust support

## 🧪 Testing

### Health Checks
```bash
# Basic health
curl http://localhost:8001/health

# API health
curl http://localhost:8001/api/v1/health

# Metrics
curl http://localhost:8001/metrics
```

### API Testing
```bash
# Code analysis
curl -X POST http://localhost:8001/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"language":"python","code":"def hello(): print(\"world\")"}'

# Security scan
curl -X POST http://localhost:8001/api/v1/security \
  -H "Content-Type: application/json" \
  -d '{"language":"python","requirements":"flask==2.0.0"}'
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend services
docker-compose -f infra/docker-compose.yml up -d --scale backend=3

# Load balancer configuration (example with nginx)
# Add nginx service to docker-compose.yml
```

### Database Scaling
- **Connection Pooling**: Configurable pool sizes
- **Read Replicas**: PostgreSQL read replicas for read-heavy workloads
- **Sharding**: Database sharding for very large datasets

### Redis Clustering
- **Redis Cluster**: For high availability
- **Sentinel**: Redis Sentinel for failover
- **Persistence**: RDB and AOF persistence options

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database logs
   docker-compose -f infra/docker-compose.yml logs db
   
   # Check database health
   docker exec codie-db pg_isready -U codie
   ```

2. **Redis Connection Failed**
   ```bash
   # Check Redis logs
   docker-compose -f infra/docker-compose.yml logs redis
   
   # Test Redis connection
   docker exec codie-redis redis-cli ping
   ```

3. **AI Providers Unavailable**
   ```bash
   # Check provider status
   curl http://localhost:8001/health | jq '.ai_providers'
   
   # Check environment variables
   docker exec codie-backend env | grep AI_
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose -f infra/docker-compose.yml logs -f

# View specific service logs
docker-compose -f infra/docker-compose.yml logs -f backend

# Check container status
docker-compose -f infra/docker-compose.yml ps

# Execute commands in containers
docker exec -it codie-backend bash
```

## 🔄 Updates and Maintenance

### Rolling Updates
```bash
# Zero-downtime deployment
./scripts/deploy.sh production

# Or manual rolling update
docker-compose -f infra/docker-compose.yml up -d --no-deps backend
```

### Backup and Recovery
```bash
# Create backup
./scripts/deploy.sh backup

# Restore from backup
docker exec -i codie-db psql -U codie codie < backup.sql
```

### Monitoring Maintenance
```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check Grafana health
curl http://localhost:3000/api/health
```

## 📚 Additional Resources

- **API Documentation**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`
- **OpenAPI Schema**: `http://localhost:8001/openapi.json`
- **Health Dashboard**: `http://localhost:8001/health`

## 🆘 Support

For production support:
1. Check the logs first: `docker-compose logs -f`
2. Verify health endpoints: `/health`, `/metrics`
3. Check service status: `docker-compose ps`
4. Review this documentation for common issues

---

**Note**: This is a production-grade deployment. Always test in staging first and ensure proper backup procedures are in place.
