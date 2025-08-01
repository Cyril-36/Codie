from __future__ import annotations

import json
import os
from functools import lru_cache
from typing import List, Optional, Dict, Any

from pydantic import BaseModel, Field, ValidationError
try:
    # pydantic-settings for Pydantic v2
    from pydantic_settings import BaseSettings, SettingsConfigDict  # type: ignore[reportMissingImports]
except Exception:  # pragma: no cover - editor/type fallback
    # Fallback type stubs for editors if pydantic-settings isn't installed in the venv
    class BaseSettings(BaseModel):  # type: ignore[misc]
        pass
    class SettingsConfigDict(dict):  # type: ignore[misc]
        pass


class CorsSettings(BaseModel):
    # Use plain str for origins to avoid editor type inference issues while still validating at runtime if needed
    origins: List[str] = Field(default_factory=list)
    allow_credentials: bool = False
    allow_methods: List[str] = Field(default_factory=lambda: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
    allow_headers: List[str] = Field(default_factory=lambda: ["*"])


class ProbeSettings(BaseModel):
    enable_postgres_probe: bool = False
    postgres_dsn: Optional[str] = None

    enable_redis_probe: bool = False
    redis_url: Optional[str] = None


class AppSettings(BaseSettings):  # type: ignore[misc]
    model_config: SettingsConfigDict = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)  # type: ignore[assignment]

    app_name: str = "codie-backend"
    app_version: str = "0.1.0"
    debug: bool = False

    cors: CorsSettings = Field(default_factory=CorsSettings)
    probes: ProbeSettings = Field(default_factory=ProbeSettings)

    @staticmethod
    def _split_csv(value: Optional[str]) -> List[str]:
        if not value:
            return []
        return [v.strip() for v in value.split(",") if v.strip()]

    @classmethod
    def from_env(cls) -> "AppSettings":
        # Support simple CSV envs for origins for convenience
        cors_origins_env = os.getenv("CORS_ORIGINS")
        cors = CorsSettings()
        if cors_origins_env:
            # allow plain strings (http://localhost:3000) without URL validation to keep DX simple
            try:
                parsed: List[str] = list(cls._split_csv(cors_origins_env))
                cors.origins = parsed
            except ValidationError:
                parsed2: List[str] = list(cls._split_csv(cors_origins_env))
                cors.origins = parsed2

        probes = ProbeSettings(
            enable_postgres_probe=os.getenv("ENABLE_POSTGRES_PROBE", "false").lower() == "true",
            postgres_dsn=os.getenv("POSTGRES_DSN"),
            enable_redis_probe=os.getenv("ENABLE_REDIS_PROBE", "false").lower() == "true",
            redis_url=os.getenv("REDIS_URL"),
        )

        return cls(
            app_name=os.getenv("APP_NAME", "codie-backend"),
            app_version=os.getenv("APP_VERSION", "0.1.0"),
            debug=os.getenv("DEBUG", "false").lower() == "true",
            cors=cors,
            probes=probes,
        )


@lru_cache()
def get_settings() -> AppSettings:
    return AppSettings.from_env()


def safe_json_dumps(data: Dict[str, Any]) -> str:
    try:
        return json.dumps(data, separators=(",", ":"), sort_keys=True)
    except Exception:
        return "{}"
