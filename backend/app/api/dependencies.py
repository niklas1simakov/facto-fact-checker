"""Dependency injection functions."""

from functools import lru_cache

from app.services.content_service import ContentService
from app.services.openai_service import OpenAIService


def get_openai_service() -> OpenAIService:
    """Get or create OpenAI service singleton."""
    return OpenAIService()


def get_content_service() -> ContentService:
    """Get or create Content service singleton."""
    openai_service = get_openai_service()
    return ContentService(openai_service)
