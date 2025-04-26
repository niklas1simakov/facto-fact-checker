"""Dependency injection functions."""

from functools import lru_cache

from app.services.content_service import ContentService
from app.services.openai_service import OpenAIService
from app.services.ws_service import WebSocketService


@lru_cache()
def get_openai_service() -> OpenAIService:
    """Get or create OpenAI service singleton."""
    return OpenAIService()


@lru_cache()
def get_content_service() -> ContentService:
    """Get or create Content service singleton."""
    openai_service = get_openai_service()
    return ContentService(openai_service)


@lru_cache()
def get_ws_service() -> WebSocketService:
    """Get or create WebSocket service singleton."""
    content_service = get_content_service()
    return WebSocketService(content_service)
