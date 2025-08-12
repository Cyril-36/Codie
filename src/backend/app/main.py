import asyncio
import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .api.routers.chat import router as chat_ws_router
from .api.routers.code_review import router as review_router
from .api.routers.export import router as export_router
from .api.routers.graph import router as graph_router
from .api.routers.health import router as health_router
from .api.routers.perf import router as perf_router
from .api.routers.refactor import router as refactor_router
from .api.routers.security import router as security_router
from .api.routers.style import router as style_router
from .api.routers.testgen import router as testgen_router
from .api.routers.history import router as history_router
from .api.routers.analysis import router as analysis_router
from .core.metrics import inc, render_prom
from .core.rate_limit import RateLimitMiddleware, RateLimitConfig
from .core.security_headers import SecurityHeadersMiddleware
from .core.db import initialize_database, close_database, check_database_health
from .core.settings import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("codie_backend.log"),
    ],
)

logger = logging.getLogger(__name__)


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Global error handling middleware"""

    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except HTTPException:
            # Re-raise HTTP exceptions as they're handled by FastAPI
            raise
        except Exception as e:
            logger.error(f"Unhandled error in {request.url.path}: {e}", exc_info=True)
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "detail": "An unexpected error occurred",
                    "request_id": getattr(request.state, "request_id", "unknown"),
                },
            )


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Request logging middleware for monitoring and debugging"""

    async def dispatch(self, request: Request, call_next):
        start_time = asyncio.get_event_loop().time()

        # Generate request ID
        request.state.request_id = f"req_{int(start_time * 1000)}"

        # Log request
        logger.info(
            f"Request started: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )

        try:
            response = await call_next(request)

            # Log response
            process_time = asyncio.get_event_loop().time() - start_time
            logger.info(
                f"Request completed: {request.method} {request.url.path} "
                f"status={response.status_code} duration={process_time:.3f}s"
            )

            # Add request ID to response headers
            response.headers["X-Request-ID"] = request.state.request_id

            return response

        except Exception as e:
            process_time = asyncio.get_event_loop().time() - start_time
            logger.error(
                f"Request failed: {request.method} {request.url.path} "
                f"duration={process_time:.3f}s error={e}"
            )
            raise


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifecycle manager"""
    # Startup
    logger.info("Starting Codie Backend...")

    try:
        # Initialize database
        await initialize_database()
        logger.info("Database initialized successfully")

        # Initialize other services
        logger.info("All services initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down Codie Backend...")

    try:
        # Close database connections
        await close_database()
        logger.info("Database connections closed")

        # Close other services
        logger.info("All services shut down successfully")

    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


def create_app() -> FastAPI:
    """Create and configure FastAPI application"""
    settings = get_settings()

    app = FastAPI(
        title=settings.app.title,
        version=settings.app.version,
        description="Production-grade code analysis and AI-powered development assistant",
        docs_url="/docs" if settings.app.debug else None,
        redoc_url="/redoc" if settings.app.debug else None,
        openapi_url="/openapi.json" if settings.app.debug else None,
        lifespan=lifespan,
    )

    # Add middleware in order (last added = first executed)

    # 1. Error handling (outermost)
    app.add_middleware(ErrorHandlingMiddleware)

    # 2. Request logging
    app.add_middleware(RequestLoggingMiddleware)

    # 3. Gzip compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # 4. CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.app.cors_origins,
        allow_credentials=settings.app.cors_allow_credentials,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-API-Key", "X-Request-ID"],
        expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
    )

    # 5. Security headers
    app.add_middleware(SecurityHeadersMiddleware)

    # 6. Rate limiting
    app.add_middleware(
        RateLimitMiddleware,
        config=RateLimitConfig(
            window_sec=settings.security.rate_limit_window,
            max_requests=settings.security.rate_limit_max_requests,
            store=settings.security.rate_limit_store,
            redis_url=settings.redis.url,
        ),
    )

    # 7. Metrics middleware
    @app.middleware("http")
    async def metrics_middleware(request: Request, call_next):
        response: Response = await call_next(request)
        try:
            path = request.url.path
            status = str(response.status_code)
            method = request.method

            # Record metrics
            inc(
                "http_requests_total",
                {
                    "path": path,
                    "status": status,
                    "method": method,
                    "endpoint": path.split("/")[-1] if path else "unknown",
                },
            )

            # Record request duration
            process_time = asyncio.get_event_loop().time() - getattr(
                request.state, "start_time", 0
            )
            # Note: Current metrics system only supports counters, not histograms
            # For now, we'll just increment a counter for requests with duration > 0
            if process_time > 0:
                inc("http_request_duration_seconds", {"path": path, "method": method})

        except Exception as e:
            logger.error(f"Metrics middleware error: {e}")

        return response

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Comprehensive health check"""
        try:
            # Check database health
            db_health = await check_database_health()

            # Check AI providers
            from .services.ai_providers import get_ai_provider_manager

            ai_manager = get_ai_provider_manager()
            ai_status = ai_manager.get_provider_status()

            # Overall health
            overall_healthy = db_health["status"] == "healthy" and any(
                provider["enabled"] for provider in ai_status.values()
            )

            return {
                "status": "healthy" if overall_healthy else "unhealthy",
                "timestamp": asyncio.get_event_loop().time(),
                "version": settings.app.version,
                "environment": settings.app.environment,
                "database": db_health,
                "ai_providers": ai_status,
                "services": {
                    "database": db_health["status"] == "healthy",
                    "ai_providers": len(ai_status) > 0,
                    "rate_limiting": True,
                    "security_headers": True,
                },
            }

        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return JSONResponse(
                status_code=503,
                content={
                    "status": "unhealthy",
                    "error": str(e),
                    "timestamp": asyncio.get_event_loop().time(),
                },
            )

    # Metrics endpoint
    @app.get("/metrics")
    async def metrics_endpoint():
        """Prometheus metrics endpoint"""
        try:
            return Response(
                content=render_prom(), media_type="text/plain; version=0.0.4"
            )
        except Exception as e:
            logger.error(f"Metrics endpoint error: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate metrics")

    # Include all routers
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(analysis_router, prefix="/api/v1")
    app.include_router(review_router, prefix="/api/v1")
    app.include_router(export_router, prefix="/api/v1")
    app.include_router(graph_router, prefix="/api/v1")
    app.include_router(perf_router, prefix="/api/v1")
    app.include_router(chat_ws_router, prefix="/api/v1")
    app.include_router(style_router, prefix="/api/v1")
    app.include_router(testgen_router, prefix="/api/v1")
    app.include_router(refactor_router, prefix="/api/v1")
    app.include_router(security_router, prefix="/api/v1")
    app.include_router(history_router, prefix="/api/v1")

    # Root endpoint
    @app.get("/")
    async def root():
        """Root endpoint with API information"""
        return {
            "name": "Codie Backend",
            "version": settings.app.version,
            "description": "Production-grade code analysis and AI-powered development assistant",
            "status": "running",
            "docs": "/docs" if settings.app.debug else None,
            "health": "/health",
            "metrics": "/metrics",
        }

    logger.info(
        f"Application '{settings.app.title}' v{settings.app.version} created successfully"
    )
    return app


# Create application instance
app = create_app()

# Export for testing
__all__ = ["app", "create_app"]
