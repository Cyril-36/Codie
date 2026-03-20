from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...services.ai_analyzer import analyze_code
from ...services.complexity_analyzer import compute_complexity
from ...core.db import get_db
from ...models.analysis import Analysis

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
    id: Optional[int] = None


class FileAnalysisRequest(BaseModel):
    """File analysis request"""

    language: str
    show_all: bool = False


async def _save_analysis(
    db: AsyncSession,
    language: str,
    complexity: float,
    suggestions: list[str],
    metrics: dict,
    code: Optional[str] = None,
    filename: Optional[str] = None,
    analysis_type: str = "code_review",
) -> Analysis:
    """Save analysis result to database."""
    score = max(0, 100 - min(complexity * 5, 40) + min(len(suggestions) * 2, 20))
    record = Analysis(
        language=language,
        complexity=complexity,
        code=code,
        suggestions=json.dumps(suggestions),
        analysis_type=analysis_type,
        filename=filename,
        score=score,
        metrics=json.dumps(metrics),
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)
    return record


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

        # Save to DB
        record = await _save_analysis(
            db, request.language, complexity, suggestions, metrics, code=request.code
        )

        return AnalyzeResponse(
            complexity=complexity,
            suggestions=suggestions,
            metrics=metrics,
            language=request.language,
            timestamp=datetime.now(timezone.utc).isoformat(),
            id=record.id,
        )

    except HTTPException:
        raise
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

        # Save to DB
        record = await _save_analysis(
            db, language, complexity, suggestions, metrics,
            code=code, filename=file.filename,
        )

        return AnalyzeResponse(
            complexity=complexity,
            suggestions=suggestions,
            metrics=metrics,
            language=language,
            timestamp=datetime.now(timezone.utc).isoformat(),
            id=record.id,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"File analysis failed: {str(e)}")


@router.get("/analysis-history")
async def get_analysis_history(
    page: int = 1, size: int = 10, db: AsyncSession = Depends(get_db)
) -> dict:
    """Get analysis history (real DB query)"""
    try:
        count_result = await db.execute(select(func.count(Analysis.id)))
        total = count_result.scalar() or 0

        offset = (page - 1) * size
        result = await db.execute(
            select(Analysis)
            .order_by(desc(Analysis.created_at))
            .offset(offset)
            .limit(size)
        )
        rows = result.scalars().all()

        items = [
            {
                "id": r.id,
                "language": r.language,
                "complexity": r.complexity,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "filename": r.filename,
                "analysis_type": r.analysis_type,
                "score": r.score,
            }
            for r in rows
        ]

        return {"items": items, "total": total, "page": page, "size": size}

    except Exception as e:
        logger.error(f"Failed to get analysis history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get analysis history")
