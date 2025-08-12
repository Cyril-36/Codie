from __future__ import annotations
import os
import logging
from dataclasses import dataclass, field
from typing import List, Optional
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class DatabaseSettings:
    """Database configuration settings"""

    url: str = field(default="sqlite+aiosqlite:///./codie_dev.db")
    pool_size: int = field(default=20)
    max_overflow: int = field(default=30)
    pool_pre_ping: bool = field(default=True)
    pool_recycle: int = field(default=3600)
    echo: bool = field(default=False)


@dataclass(frozen=True)
class AISettings:
    """AI provider configuration settings"""

    gemini_api_key: Optional[str] = field(default=None)
    huggingface_api_key: Optional[str] = field(default=None)
    openai_api_key: Optional[str] = field(default=None)
    default_provider: str = field(default="gemini")
    timeout: int = field(default=30)
    max_retries: int = field(default=3)


@dataclass(frozen=True)
class SecuritySettings:
    """Security configuration settings"""

    secret_key: str = field(default="your-secret-key-here")
    algorithm: str = field(default="HS256")
    access_token_expire_minutes: int = field(default=30)
    rate_limit_window: int = field(default=60)
    rate_limit_max_requests: int = field(default=100)
    rate_limit_store: str = field(default="redis")
    cve_cache_ttl: int = field(default=3600)  # 1 hour
    enable_nvd_api: bool = field(default=True)
    enable_osv_api: bool = field(default=True)
    nvd_api_key: Optional[str] = field(default=None)
    osv_api_key: Optional[str] = field(default=None)
    ghsa_api_key: Optional[str] = field(default=None)


@dataclass(frozen=True)
class RedisSettings:
    """Redis configuration settings"""

    url: str = field(default="redis://localhost:6379")
    host: str = field(default="localhost")
    port: int = field(default=6379)
    db: int = field(default=0)
    password: Optional[str] = field(default=None)
    ssl: bool = field(default=False)


@dataclass(frozen=True)
class MonitoringSettings:
    """Monitoring and metrics configuration"""

    enable_metrics: bool = field(default=True)
    prometheus_port: int = field(default=9090)
    health_check_interval: int = field(default=30)
    log_level: str = field(default="INFO")


@dataclass(frozen=True)
class AppSettings:
    """Application configuration settings"""

    title: str = field(default="Codie Backend")
    version: str = field(default="1.0.0")
    environment: str = field(default="development")
    debug: bool = field(default=False)
    cors_origins: List[str] = field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
        ]
    )
    cors_allow_credentials: bool = field(default=True)


@dataclass(frozen=True)
class Settings:
    """Main settings container"""

    database: DatabaseSettings
    ai: AISettings
    security: SecuritySettings
    redis: RedisSettings
    monitoring: MonitoringSettings
    app: AppSettings

    @classmethod
    def load(cls) -> "Settings":
        """Load settings from environment variables"""
        return cls(
            database=DatabaseSettings(
                url=os.getenv(
                    "DATABASE_URL", "sqlite+aiosqlite:///../../data/dev/codie_dev.db"
                ),
                pool_size=int(os.getenv("DB_POOL_SIZE", "20")),
                max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "30")),
                pool_pre_ping=os.getenv("DB_POOL_PRE_PING", "true").lower() == "true",
                echo=os.getenv("DB_ECHO", "false").lower() == "true",
            ),
            ai=AISettings(
                gemini_api_key=os.getenv("GEMINI_API_KEY"),
                huggingface_api_key=os.getenv("HUGGINGFACE_API_KEY"),
                openai_api_key=os.getenv("OPENAI_API_KEY"),
                default_provider=os.getenv("DEFAULT_AI_PROVIDER", "gemini"),
                timeout=int(os.getenv("AI_TIMEOUT", "30")),
                max_retries=int(os.getenv("AI_MAX_RETRIES", "3")),
            ),
            security=SecuritySettings(
                secret_key=os.getenv("SECRET_KEY", "your-secret-key-here"),
                algorithm=os.getenv("ALGORITHM", "HS256"),
                access_token_expire_minutes=int(
                    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
                ),
                rate_limit_window=int(os.getenv("RATE_LIMIT_WINDOW", "60")),
                rate_limit_max_requests=int(
                    os.getenv("RATE_LIMIT_MAX_REQUESTS", "100")
                ),
                rate_limit_store=os.getenv("RATE_LIMIT_STORE", "redis"),
                cve_cache_ttl=int(os.getenv("CVE_CACHE_TTL", "3600")),
                enable_nvd_api=os.getenv("ENABLE_NVD_API", "true").lower() == "true",
                enable_osv_api=os.getenv("ENABLE_OSV_API", "true").lower() == "true",
                nvd_api_key=os.getenv("NVD_API_KEY"),
                osv_api_key=os.getenv("OSV_API_KEY"),
                ghsa_api_key=os.getenv("GHSA_API_KEY"),
            ),
            redis=RedisSettings(
                url=os.getenv("REDIS_URL", "redis://localhost:6379"),
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", "6379")),
                db=int(os.getenv("REDIS_DB", "0")),
                password=os.getenv("REDIS_PASSWORD"),
                ssl=os.getenv("REDIS_SSL", "false").lower() == "true",
            ),
            monitoring=MonitoringSettings(
                enable_metrics=os.getenv("ENABLE_METRICS", "true").lower() == "true",
                prometheus_port=int(os.getenv("PROMETHEUS_PORT", "9090")),
                health_check_interval=int(os.getenv("HEALTH_CHECK_INTERVAL", "30")),
                log_level=os.getenv("LOG_LEVEL", "INFO"),
            ),
            app=AppSettings(
                title=os.getenv("APP_TITLE", "Codie Backend"),
                version=os.getenv("APP_VERSION", "1.0.0"),
                environment=os.getenv("APP_ENVIRONMENT", "development"),
                debug=os.getenv("APP_DEBUG", "false").lower() == "true",
                cors_origins=os.getenv(
                    "CORS_ORIGINS",
                    "http://localhost:3000,http://localhost:5173,http://localhost:5174",
                ).split(","),
                cors_allow_credentials=os.getenv(
                    "CORS_ALLOW_CREDENTIALS", "true"
                ).lower()
                == "true",
            ),
        )

    def get_database_url(self) -> str:
        """Get database URL with fallback logic"""
        # Priority 1: explicit DATABASE_URL
        if self.database.url != "sqlite+aiosqlite:///../../data/dev/codie_dev.db":
            return self.database.url

        # Priority 2: compose from CODIE_DB_* parts
        user = os.getenv("CODIE_DB_USER")
        password = os.getenv("CODIE_DB_PASS")
        host = os.getenv("CODIE_DB_HOST", "db")
        port = os.getenv("CODIE_DB_PORT", "5432")
        name = os.getenv("CODIE_DB_NAME", "codie")

        if user and password and name:
            return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{name}"

        # Fallback: local sqlite file for dev/test
        return "sqlite+aiosqlite:///../../data/dev/codie_dev.db"


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get or create settings instance"""
    global _settings
    if _settings is None:
        _settings = Settings.load()
    return _settings
