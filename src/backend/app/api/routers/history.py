from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from datetime import datetime

from ...core.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter(tags=["history"])


class HistoryItem(BaseModel):
    """History item model"""

    id: int
    language: str
    complexity: float
    created_at: str
    filename: Optional[str] = None
    analysis_type: Optional[str] = None


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
    db: AsyncSession = Depends(get_db),
) -> HistoryResponse:
    """Get analysis history with pagination and filtering"""
    try:
        # This would typically query the database
        # For now, return mock data
        mock_items = [
            {
                "id": i,
                "language": "python",
                "complexity": 8.5,
                "created_at": "2024-01-15T10:30:00Z",
                "filename": f"analysis_{i}.py",
                "analysis_type": "code_review",
            }
            for i in range(1, 11)
        ]

        # Apply language filter if specified
        if language:
            mock_items = [item for item in mock_items if item["language"] == language]

        # Calculate pagination
        total = len(mock_items)
        start_index = (page - 1) * size
        end_index = start_index + size
        paginated_items = mock_items[start_index:end_index]

        return HistoryResponse(items=paginated_items, total=total, page=page, size=size)

    except Exception as e:
        logger.error(f"Failed to get history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get history")


@router.get("/history/{item_id}")
async def get_history_item(
    item_id: int, db: AsyncSession = Depends(get_db)
) -> HistoryItem:
    """Get a specific history item"""
    try:
        # This would typically query the database
        # For now, return mock data
        mock_item = {
            "id": item_id,
            "language": "python",
            "complexity": 8.5,
            "created_at": "2024-01-15T10:30:00Z",
            "filename": f"analysis_{item_id}.py",
            "analysis_type": "code_review",
        }

        return HistoryItem(**mock_item)

    except Exception as e:
        logger.error(f"Failed to get history item {item_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get history item")


@router.delete("/history/{item_id}")
async def delete_history_item(item_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    """Delete a history item"""
    try:
        # This would typically delete from the database
        # For now, return success response
        return {
            "message": f"History item {item_id} deleted successfully",
            "deleted_id": item_id,
        }

    except Exception as e:
        logger.error(f"Failed to delete history item {item_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete history item")


@router.delete("/history")
async def clear_history(db: AsyncSession = Depends(get_db)) -> dict:
    """Clear all history"""
    try:
        # This would typically clear the database
        # For now, return success response
        return {"message": "All history cleared successfully", "cleared_count": 100}

    except Exception as e:
        logger.error(f"Failed to clear history: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear history")


@router.get("/history/stats")
async def get_history_stats(db: AsyncSession = Depends(get_db)) -> dict:
    """Get history statistics"""
    try:
        # This would typically query the database
        # For now, return mock data
        return {
            "total_analyses": 100,
            "languages": {"python": 45, "javascript": 30, "typescript": 15, "java": 10},
            "average_complexity": 7.2,
            "analysis_types": {
                "code_review": 60,
                "security_scan": 25,
                "performance": 15,
            },
            "last_analysis": "2024-01-15T10:30:00Z",
        }

    except Exception as e:
        logger.error(f"Failed to get history stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get history stats")
