from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from ...services.ai_analyzer import analyze_code
from ...services.complexity_analyzer import compute_complexity
from ...core.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter(tags=["analysis"])


class AnalyzeRequest(BaseModel):
    """Code analysis request"""

    language: str
    code: str
    show_all: bool = False


class AnalyzeResponse(BaseModel):
    """Code analysis response"""

    complexity: float
    suggestions: list[str]
    metrics: dict
    language: str
    timestamp: str


class FileAnalysisRequest(BaseModel):
    """File analysis request"""

    language: str
    show_all: bool = False


@router.post("/analyze")
async def analyze_snippet(
    request: AnalyzeRequest, db: AsyncSession = Depends(get_db)
) -> AnalyzeResponse:
    """Analyze a code snippet"""
    try:
        # Validate language
        if request.language not in ["python", "javascript", "java", "typescript"]:
            raise HTTPException(status_code=400, detail="Unsupported language")

        # Compute complexity
        complexity = compute_complexity(request.language, request.code)

        # Get AI suggestions
        suggestions = await analyze_code(
            request.code, request.language, request.show_all
        )

        # Generate metrics
        metrics = {
            "complexity": complexity,
            "lines": len(request.code.splitlines()),
            "characters": len(request.code),
            "suggestions_count": len(suggestions),
        }

        return AnalyzeResponse(
            complexity=complexity,
            suggestions=suggestions,
            metrics=metrics,
            language=request.language,
            timestamp=datetime.now().isoformat(),
        )

    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze-file")
async def analyze_file(
    file: UploadFile = File(...),
    language: str = Form(...),
    show_all: bool = Form(False),
    db: AsyncSession = Depends(get_db),
) -> AnalyzeResponse:
    """Analyze an uploaded file"""
    try:
        # Validate file type
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")

        # Read file content
        content = await file.read()
        code = content.decode("utf-8")

        # Validate language
        if language not in ["python", "javascript", "java", "typescript"]:
            raise HTTPException(status_code=400, detail="Unsupported language")

        # Compute complexity
        complexity = compute_complexity(language, code)

        # Get AI suggestions
        suggestions = await analyze_code(code, language, show_all)

        # Generate metrics
        metrics = {
            "complexity": complexity,
            "lines": len(code.splitlines()),
            "characters": len(code),
            "suggestions_count": len(suggestions),
            "filename": file.filename,
        }

        return AnalyzeResponse(
            complexity=complexity,
            suggestions=suggestions,
            metrics=metrics,
            language=language,
            timestamp=datetime.now().isoformat(),
        )

    except Exception as e:
        logger.error(f"File analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"File analysis failed: {str(e)}")


@router.get("/analysis-history")
async def get_analysis_history(
    page: int = 1, size: int = 10, db: AsyncSession = Depends(get_db)
) -> dict:
    """Get analysis history"""
    try:
        # This would typically query the database
        # For now, return mock data
        mock_items = [
            {
                "id": i,
                "language": "python",
                "complexity": 8.5,
                "created_at": "2024-01-15T10:30:00Z",
            }
            for i in range(1, 11)
        ]

        return {"items": mock_items, "total": 100, "page": page, "size": size}

    except Exception as e:
        logger.error(f"Failed to get analysis history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get analysis history")


# Import datetime for timestamp generation
from datetime import datetime
