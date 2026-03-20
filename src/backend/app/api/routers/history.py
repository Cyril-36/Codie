from __future__ import annotations

import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime
from sqlalchemy import delete, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.db import get_db
from ...models.analysis import Analysis

logger = logging.getLogger(__name__)

router = APIRouter(tags=["history"])


class HistoryItem(BaseModel):
    """History item model"""

    id: int
    language: str
    complexity: float
    created_at: datetime
    filename: Optional[str] = None
    analysis_type: Optional[str] = None
    score: Optional[float] = None
    suggestion_count: int = 0

    model_config = {"from_attributes": True}


class HistoryResponse(BaseModel):
    """History response model"""

    items: list[HistoryItem]
    total: int
    page: int
    size: int


@router.get("/history")
async def get_history(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    language: Optional[str] = Query(None, description="Filter by language"),
    analysis_type: Optional[str] = Query(None, description="Filter by analysis type"),
    db: AsyncSession = Depends(get_db),
) -> HistoryResponse:
    """Get analysis history with pagination and filtering"""
    try:
        # Build base query
        query = select(Analysis).order_by(desc(Analysis.created_at))
        count_query = select(func.count(Analysis.id))

        # Apply filters
        if language:
            query = query.where(Analysis.language == language)
            count_query = count_query.where(Analysis.language == language)
        if analysis_type:
            query = query.where(Analysis.analysis_type == analysis_type)
            count_query = count_query.where(Analysis.analysis_type == analysis_type)

        # Get total count
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination
        offset = (page - 1) * size
        query = query.offset(offset).limit(size)

        result = await db.execute(query)
        rows = result.scalars().all()

        items = []
        for row in rows:
            suggestion_count = 0
            if row.suggestions:
                try:
                    suggestions = json.loads(row.suggestions)
                    suggestion_count = len(suggestions) if isinstance(suggestions, list) else 0
                except (json.JSONDecodeError, TypeError):
                    pass

            items.append(
                HistoryItem(
                    id=row.id,
                    language=row.language,
                    complexity=row.complexity,
                    created_at=row.created_at,
                    filename=row.filename,
                    analysis_type=row.analysis_type,
                    score=row.score,
                    suggestion_count=suggestion_count,
                )
            )

        return HistoryResponse(items=items, total=total, page=page, size=size)

    except Exception as e:
        logger.error(f"Failed to get history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get history")


@router.get("/history/stats")
async def get_history_stats(db: AsyncSession = Depends(get_db)) -> dict:
    """Get history statistics"""
    try:
        # Total analyses
        total_result = await db.execute(select(func.count(Analysis.id)))
        total = total_result.scalar() or 0

        # Language breakdown
        lang_result = await db.execute(
            select(Analysis.language, func.count(Analysis.id))
            .group_by(Analysis.language)
        )
        languages = dict(lang_result.all())

        # Average complexity
        avg_result = await db.execute(select(func.avg(Analysis.complexity)))
        avg_complexity = avg_result.scalar() or 0.0

        # Analysis type breakdown
        type_result = await db.execute(
            select(Analysis.analysis_type, func.count(Analysis.id))
            .group_by(Analysis.analysis_type)
        )
        analysis_types = dict(type_result.all())

        # Last analysis
        last_result = await db.execute(
            select(Analysis.created_at)
            .order_by(desc(Analysis.created_at))
            .limit(1)
        )
        last_analysis = last_result.scalar()

        return {
            "total_analyses": total,
            "languages": languages,
            "average_complexity": round(float(avg_complexity), 2),
            "analysis_types": analysis_types,
            "last_analysis": last_analysis.isoformat() if last_analysis else None,
        }

    except Exception as e:
        logger.error(f"Failed to get history stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get history stats")


@router.get("/history/{item_id}")
async def get_history_item(
    item_id: int, db: AsyncSession = Depends(get_db)
) -> HistoryItem:
    """Get a specific history item"""
    try:
        result = await db.execute(select(Analysis).where(Analysis.id == item_id))
        row = result.scalar_one_or_none()

        if row is None:
            raise HTTPException(status_code=404, detail="History item not found")

        suggestion_count = 0
        if row.suggestions:
            try:
                suggestions = json.loads(row.suggestions)
                suggestion_count = len(suggestions) if isinstance(suggestions, list) else 0
            except (json.JSONDecodeError, TypeError):
                pass

        return HistoryItem(
            id=row.id,
            language=row.language,
            complexity=row.complexity,
            created_at=row.created_at,
            filename=row.filename,
            analysis_type=row.analysis_type,
            score=row.score,
            suggestion_count=suggestion_count,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get history item {item_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get history item")


@router.delete("/history/{item_id}")
async def delete_history_item(item_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    """Delete a history item"""
    try:
        result = await db.execute(select(Analysis).where(Analysis.id == item_id))
        row = result.scalar_one_or_none()

        if row is None:
            raise HTTPException(status_code=404, detail="History item not found")

        await db.delete(row)
        await db.commit()

        return {
            "message": f"History item {item_id} deleted successfully",
            "deleted_id": item_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete history item {item_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete history item")


@router.delete("/history")
async def clear_history(db: AsyncSession = Depends(get_db)) -> dict:
    """Clear all history"""
    try:
        result = await db.execute(delete(Analysis))
        await db.commit()
        cleared = result.rowcount or 0

        return {"message": "All history cleared successfully", "cleared_count": cleared}

    except Exception as e:
        logger.error(f"Failed to clear history: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear history")
