from __future__ import annotations

import logging
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from ...services.ai_analyzer import analyze_code
from ...services.complexity_analyzer import compute_complexity
from ...core.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter(tags=["code_review"])


class CodeReviewRequest(BaseModel):
    """Code review request"""

    language: str
    code: str
    show_all: bool = False


class CodeReviewResponse(BaseModel):
    """Code review response"""

    complexity: float
    suggestions: List[str]
    score: float
    language: str
    timestamp: str


@router.post("/review")
async def review_code(
    request: CodeReviewRequest, db: AsyncSession = Depends(get_db)
) -> CodeReviewResponse:
    """Review code for improvements"""
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

        # Calculate score based on complexity and suggestions
        base_score = 100
        complexity_penalty = min(complexity * 5, 40)  # Max 40 point penalty
        suggestion_bonus = min(len(suggestions) * 2, 20)  # Max 20 point bonus

        score = max(0, base_score - complexity_penalty + suggestion_bonus)

        return CodeReviewResponse(
            complexity=complexity,
            suggestions=suggestions,
            score=score,
            language=request.language,
            timestamp=datetime.now().isoformat(),
        )

    except Exception as e:
        logger.error(f"Code review failed: {e}")
        raise HTTPException(status_code=500, detail=f"Code review failed: {str(e)}")


@router.post("/review-file")
async def review_file(
    file: UploadFile = File(...),
    language: str = Form(...),
    show_all: bool = Form(False),
    db: AsyncSession = Depends(get_db),
) -> CodeReviewResponse:
    """Review uploaded file for improvements"""
    try:
        # Validate file
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

        # Calculate score
        base_score = 100
        complexity_penalty = min(complexity * 5, 40)
        suggestion_bonus = min(len(suggestions) * 2, 20)

        score = max(0, base_score - complexity_penalty + suggestion_bonus)

        return CodeReviewResponse(
            complexity=complexity,
            suggestions=suggestions,
            score=score,
            language=language,
            timestamp=datetime.now().isoformat(),
        )

    except Exception as e:
        logger.error(f"File review failed: {e}")
        raise HTTPException(status_code=500, detail=f"File review failed: {str(e)}")


# Import datetime for timestamp generation
from datetime import datetime
