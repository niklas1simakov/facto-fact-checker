"""Fact checking API endpoints."""

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_content_service
from app.models.schemas import BodyData
from app.services.content_service import ContentService

router = APIRouter()


@router.post("/fact-check")
async def fact_check(
    data: BodyData, content_service: ContentService = Depends(get_content_service)
):
    """
    Check if content (URL or text) contains fake information.

    Returns:
        List of statements with fact-check results
    """
    try:
        return content_service.process_content(data.data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
