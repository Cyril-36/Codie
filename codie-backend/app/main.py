from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response as StarletteResponse
from typing import Callable, Awaitable
from pydantic import BaseModel
import time

from .core.config import get_settings
from .health import router as health_router

def add_security_headers(response: Response) -> None:
    # Strict security headers; adjust CSP in frontend for nonce if needed
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    # HSTS should be enabled behind TLS/ingress in prod only
    # response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"

class Health(BaseModel):
    status: str
    uptime_ms: int

started_at = time.time()

s = get_settings()

app = FastAPI(
    title=s.app_name or "Codie API",
    version=s.app_version or "0.1.0",
    description="API Gateway for Codie — AI Code Review Assistant",
    contact={"name": "Codie", "url": "https://example.com"},
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS: configured via env
app.add_middleware(
    CORSMiddleware,
    allow_origins=s.cors.origins or ["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=s.cors.allow_credentials,
    allow_methods=s.cors.allow_methods,
    allow_headers=s.cors.allow_headers,
)

@app.middleware("http")
async def security_headers_mw(request: Request, call_next: Callable[[StarletteRequest], Awaitable[StarletteResponse]]) -> StarletteResponse:
    response: StarletteResponse = await call_next(request)
    add_security_headers(response)  # type: ignore[arg-type]
    return response

@app.get("/health", response_model=Health, tags=["health"])
async def health() -> Health:
    return Health(status="ok", uptime_ms=int((time.time() - started_at) * 1000))

# Mount health router providing /livez and /readyz
app.include_router(health_router)

@app.get("/", tags=["root"])
async def root():
    return {"service": s.app_name, "status": "ok"}
