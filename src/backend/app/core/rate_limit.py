from __future__ import annotations

import asyncio
import logging
import os
import time
from typing import Awaitable, Dict, Protocol, Tuple, Union, Optional, Any, List
from dataclasses import dataclass

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import PlainTextResponse, Response

from .settings import get_settings

logger = logging.getLogger(__name__)


@dataclass
class RateLimitConfig:
    """Rate limiting configuration"""

    window_sec: int = 60
    max_requests: int = 120
    store: str = "redis"  # memory, redis
    redis_url: str = "redis://localhost:6379/0"
    enable_analytics: bool = True


class RateLimitStore(Protocol):
    """Protocol for rate limiting storage backends"""

    window_sec: int
    max_requests: int

    async def hit(self, key: str) -> Tuple[bool, int, int]: ...


class SlidingWindowRateLimiter:
    """Production-grade sliding window rate limiter"""

    def __init__(self, window_sec: int, max_requests: int):
        self.window_sec = window_sec
        self.max_requests = max_requests
        self._requests: Dict[str, list] = {}

    async def hit(self, key: str) -> Tuple[bool, int, int]:
        """Record a request and check if it's allowed"""
        now = time.time()
        window_start = now - self.window_sec

        # Get or create request list for this key
        if key not in self._requests:
            self._requests[key] = []

        # Remove old requests outside the window
        self._requests[key] = [
            req_time for req_time in self._requests[key] if req_time > window_start
        ]

        # Check if we can add another request
        if len(self._requests[key]) >= self.max_requests:
            # Rate limit exceeded
            oldest_request = min(self._requests[key])
            retry_after = int(oldest_request + self.window_sec - now)
            return False, 0, max(retry_after, 0)

        # Add current request
        self._requests[key].append(now)

        # Calculate remaining requests and retry after
        remaining = self.max_requests - len(self._requests[key])
        retry_after = int(now + self.window_sec)

        return True, remaining, retry_after


class RedisSlidingWindowRateLimiter:
    """Redis-based sliding window rate limiter for distributed systems"""

    def __init__(self, redis_url: str, window_sec: int, max_requests: int):
        self.redis_url = redis_url
        self.window_sec = window_sec
        self.max_requests = max_requests
        self._redis = None

    async def _get_redis(self) -> Any:
        """Get Redis connection with lazy initialization"""
        if self._redis is None:
            try:
                from redis import asyncio as aioredis

                self._redis = aioredis.from_url(
                    self.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True,
                    health_check_interval=30,
                )
                # Test connection
                await self._redis.ping()
                logger.info("Redis rate limiting initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Redis rate limiting: {e}")
                logger.info("Falling back to in-memory rate limiting")
                self._redis = None
                raise RuntimeError(f"Redis connection failed: {e}")
        return self._redis

    async def hit(self, key: str) -> Tuple[bool, int, int]:
        """Record a request using Redis sliding window"""
        try:
            redis = await self._get_redis()
            now = time.time()
            window_start = now - self.window_sec

            # Use Redis sorted set for sliding window
            pipe = redis.pipeline()

            # Add current request timestamp
            pipe.zadd(f"rate_limit:{key}", {str(now): now})

            # Remove old requests outside the window
            pipe.zremrangebyscore(f"rate_limit:{key}", 0, window_start)

            # Count requests in current window
            pipe.zcard(f"rate_limit:{key}")

            # Set expiry on the key
            pipe.expire(f"rate_limit:{key}", self.window_sec)

            # Execute pipeline
            _, _, current_count, _ = await pipe.execute()

            # Check if rate limit exceeded
            if current_count > self.max_requests:
                # Get oldest request to calculate retry after
                oldest = await redis.zrange(f"rate_limit:{key}", 0, 0, withscores=True)
                if oldest:
                    oldest_time = oldest[0][1]
                    retry_after = int(oldest_time + self.window_sec - now)
                    return False, 0, max(retry_after, 0)
                return False, 0, self.window_sec

            # Calculate remaining requests
            remaining = max(self.max_requests - current_count, 0)
            retry_after = int(now + self.window_sec)

            return True, remaining, retry_after

        except Exception as e:
            logger.error(f"Redis rate limiting error: {e}")
            # Fallback to allow request if Redis fails
            return True, self.max_requests - 1, int(time.time() + self.window_sec)


class InMemoryRateLimiter(RateLimitStore):
    """In-memory rate limiting store for development/testing"""

    def __init__(self, window_sec: int, max_requests: int):
        self.window_sec = window_sec
        self.max_requests = max_requests
        self._requests: Dict[str, List[float]] = {}
        self._lock = asyncio.Lock()

    async def hit(self, key: str) -> Tuple[bool, int, int]:
        """Record a request using in-memory sliding window"""
        async with self._lock:
            now = time.time()
            window_start = now - self.window_sec

            # Initialize key if not exists
            if key not in self._requests:
                self._requests[key] = []

            # Remove old requests outside the window
            self._requests[key] = [
                req_time for req_time in self._requests[key] if req_time > window_start
            ]

            # Add current request
            self._requests[key].append(now)

            # Check if rate limit exceeded
            current_count = len(self._requests[key])
            if current_count > self.max_requests:
                # Get oldest request to calculate retry after
                oldest = min(self._requests[key])
                retry_after = int(oldest + self.window_sec - now)
                return False, 0, max(retry_after, 0)

            # Calculate remaining requests
            remaining = max(self.max_requests - current_count, 0)
            retry_after = int(now + self.window_sec)

            return True, remaining, retry_after

    async def reset(self, key: str) -> None:
        """Reset rate limit for a key"""
        async with self._lock:
            if key in self._requests:
                del self._requests[key]

    async def get_remaining(self, key: str) -> Tuple[int, int]:
        """Get remaining requests and retry after time"""
        async with self._lock:
            now = time.time()
            window_start = now - self.window_sec

            if key not in self._requests:
                return self.max_requests, int(now + self.window_sec)

            # Remove old requests outside the window
            self._requests[key] = [
                req_time for req_time in self._requests[key] if req_time > window_start
            ]

            current_count = len(self._requests[key])
            remaining = max(self.max_requests - current_count, 0)
            retry_after = int(now + self.window_sec)

            return remaining, retry_after


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Production-grade rate limiting middleware"""

    def __init__(self, app, config: Optional[RateLimitConfig] = None):
        super().__init__(app)
        self.settings = get_settings()

        # Use provided config or load from settings
        if config is None:
            config = RateLimitConfig(
                window_sec=self.settings.security.rate_limit_window,
                max_requests=self.settings.security.rate_limit_max_requests,
                store=self.settings.security.rate_limit_store,
                redis_url=self.settings.redis.url,
                enable_analytics=self.settings.monitoring.enable_metrics,
            )

        self.config = config
        self.store: RateLimitStore = self._initialize_store()

        logger.info(
            f"Rate limiting initialized: {config.store} store, "
            f"{config.max_requests} requests per {config.window_sec}s"
        )

    def _initialize_store(self) -> RateLimitStore:
        """Initialize the appropriate rate limiting store"""
        if self.config.store == "redis":
            try:
                return RedisSlidingWindowRateLimiter(
                    self.config.redis_url,
                    self.config.window_sec,
                    self.config.max_requests,
                )
            except Exception as e:
                logger.warning(
                    f"Redis rate limiting failed, falling back to memory: {e}"
                )
                return InMemoryRateLimiter(
                    self.config.window_sec, self.config.max_requests
                )
        else:
            return InMemoryRateLimiter(self.config.window_sec, self.config.max_requests)

    async def dispatch(self, request: Request, call_next):
        # Only protect API routes
        path = request.url.path
        if not path.startswith("/api/v1/"):
            return await call_next(request)

        # Skip rate limiting for health checks
        if path in ["/api/v1/health", "/api/v1/metrics"]:
            return await call_next(request)

        # Generate rate limit key
        rate_limit_key = self._generate_rate_limit_key(request)

        try:
            # Check rate limit
            allowed, remaining, retry_after = await self.store.hit(rate_limit_key)

            if not allowed:
                # Rate limit exceeded
                headers = {
                    "X-RateLimit-Limit": str(self.config.max_requests),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(retry_after),
                    "Retry-After": str(max(retry_after - int(time.time()), 0)),
                }

                logger.warning(f"Rate limit exceeded for {rate_limit_key}")

                return PlainTextResponse(
                    "Too Many Requests", status_code=429, headers=headers
                )

            # Request allowed, add rate limit headers
            response: Response = await call_next(request)
            response.headers.update(
                {
                    "X-RateLimit-Limit": str(self.config.max_requests),
                    "X-RateLimit-Remaining": str(remaining),
                    "X-RateLimit-Reset": str(retry_after),
                }
            )

            # Log analytics if enabled
            if self.config.enable_analytics:
                logger.info(f"Rate limit: {rate_limit_key} - {remaining} remaining")

            return response

        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            # Allow request if rate limiting fails
            return await call_next(request)

    def _generate_rate_limit_key(self, request: Request) -> str:
        """Generate rate limit key based on client identity"""
        # Try to get client IP from various headers
        xff = request.headers.get("x-forwarded-for")
        x_real_ip = request.headers.get("x-real-ip")
        cf_connecting_ip = request.headers.get("cf-connecting-ip")

        if cf_connecting_ip:
            client_ip = cf_connecting_ip
        elif x_real_ip:
            client_ip = x_real_ip
        elif xff:
            # Take the first IP from X-Forwarded-For
            client_ip = xff.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"

        # Include user ID if authenticated
        user_id = getattr(request.state, "user_id", None)
        if user_id:
            return f"user:{user_id}:{request.url.path}"

        # Include API key if present
        api_key = request.headers.get("x-api-key")
        if api_key:
            return f"api_key:{api_key}:{request.url.path}"

        # Default to IP-based rate limiting
        return f"ip:{client_ip}:{request.url.path}"


# Factory function for easy configuration
def create_rate_limit_middleware(
    app,
    window_sec: Optional[int] = None,
    max_requests: Optional[int] = None,
    store: Optional[str] = None,
    redis_url: Optional[str] = None,
) -> RateLimitMiddleware:
    """Create a configured rate limiting middleware"""
    config = RateLimitConfig(
        window_sec=window_sec or int(os.getenv("RL_WINDOW_SEC", "60")),
        max_requests=max_requests or int(os.getenv("RL_MAX_REQ", "120")),
        store=store or os.getenv("RL_STORE", "redis").lower(),
        redis_url=redis_url or os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    )

    return RateLimitMiddleware(app, config)
