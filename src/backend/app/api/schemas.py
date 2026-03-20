"""Canonical Pydantic response models for all API endpoints.

This file is the single source of truth for request/response contracts.
Frontend TypeScript types should be generated from these models.
All routers MUST import their schemas from here.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ── Auth ─────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    created_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── Analysis ─────────────────────────────────────────────────────────

class Suggestion(BaseModel):
    message: str
    category: str = "general"
    severity: str = "info"  # info, warning, error, critical
    confidence: float = 0.5
    line: Optional[int] = None
    fix_code: Optional[str] = None


class CodeMetrics(BaseModel):
    lines: int = 0
    characters: int = 0
    functions: int = 0
    classes: int = 0
    imports: int = 0
    comment_ratio: float = 0.0
    avg_function_length: float = 0.0
    max_function_length: int = 0
    maintainability_index: float = 0.0


class AnalyzeRequest(BaseModel):
    language: str
    code: str
    show_all: bool = False


class AnalyzeResponse(BaseModel):
    ok: bool = True
    complexity: float
    suggestions: List[Suggestion]
    metrics: CodeMetrics
    score: float = 0.0
    language: str
    timestamp: datetime


class FileAnalysisRequest(BaseModel):
    language: str
    show_all: bool = False


# ── Code Review ──────────────────────────────────────────────────────

class CodeReviewRequest(BaseModel):
    language: str
    code: str
    show_all: bool = False


class CodeReviewResponse(BaseModel):
    complexity: float
    suggestions: List[Suggestion]
    score: float
    language: str
    timestamp: datetime


# ── History ──────────────────────────────────────────────────────────

class HistoryItem(BaseModel):
    id: int
    language: str
    complexity: float
    created_at: datetime
    filename: Optional[str] = None
    analysis_type: Optional[str] = None
    score: Optional[float] = None
    suggestion_count: int = 0


class HistoryResponse(BaseModel):
    items: List[HistoryItem]
    total: int
    page: int
    size: int


class HistoryStatsResponse(BaseModel):
    total_analyses: int
    languages: Dict[str, int]
    average_complexity: float
    analysis_types: Dict[str, int]
    last_analysis: Optional[datetime] = None


class DeleteResponse(BaseModel):
    message: str
    deleted_id: Optional[int] = None


class ClearResponse(BaseModel):
    message: str
    cleared_count: int


# ── Security ─────────────────────────────────────────────────────────

class Vulnerability(BaseModel):
    package: str
    version: Optional[str] = None
    cve_id: Optional[str] = None
    severity: str = "unknown"  # low, medium, high, critical, unknown
    description: str = ""
    fix_version: Optional[str] = None
    source: str = "unknown"  # nvd, osv, ghsa, local


class SecurityRequest(BaseModel):
    language: str = "python"
    requirements: Optional[str] = None
    code: Optional[str] = None


class SecurityResponse(BaseModel):
    vulnerabilities: List[Vulnerability]
    summary: Dict[str, Any] = Field(default_factory=dict)
    score: float = 100.0  # 100 = no issues, 0 = critical issues


# ── Style ────────────────────────────────────────────────────────────

class StyleIssue(BaseModel):
    line: Optional[int] = None
    message: str
    severity: str = "info"  # info, warning, error
    rule: str = ""


class StyleRequest(BaseModel):
    language: str = "python"
    snippet: str


class StyleResponse(BaseModel):
    style: Dict[str, Any]
    issues: List[StyleIssue]
    score: float = 100.0


# ── Test Generation ──────────────────────────────────────────────────

class TestGenRequest(BaseModel):
    language: str = "python"
    file: Optional[str] = None
    code: str
    function: Optional[str] = None


class TestGenResponse(BaseModel):
    tests: str
    framework: str = "pytest"
    coverage: float = 0.0
    test_file: Optional[str] = None
    function_count: int = 0


# ── Performance ──────────────────────────────────────────────────────

class PerfRequest(BaseModel):
    language: str = "python"
    code: Optional[str] = None
    cmd: Optional[List[str]] = None


class PerfResponse(BaseModel):
    exit_code: int
    execution_time: float = 0.0
    memory_usage: Optional[float] = None
    stdout: str = ""
    stderr: str = ""


# ── Refactor ─────────────────────────────────────────────────────────

class RefactorSuggestion(BaseModel):
    file: str
    description: str
    roi_score: float = 0.0
    complexity: float = 0.0
    lines: int = 0


class RefactorResponse(BaseModel):
    suggestions: List[RefactorSuggestion]
    metrics: Dict[str, Any] = Field(default_factory=dict)


# ── Graph ────────────────────────────────────────────────────────────

class GraphNode(BaseModel):
    id: str
    label: str
    file: Optional[str] = None
    complexity: float = 0.0
    lines: int = 0


class GraphEdge(BaseModel):
    source: str
    target: str
    weight: float = 1.0


class HotspotNode(BaseModel):
    id: str
    label: str
    score: float = 0.0
    complexity: float = 0.0
    degree: int = 0


class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    hotspots: List[HotspotNode]


# ── Chat ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    timestamp: datetime


# ── Health ───────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "ok"
    build: str = ""
    timestamp: datetime
    database: Optional[str] = None
