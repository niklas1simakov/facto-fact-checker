"""Service for handling content from different sources."""

from typing import List
from urllib.parse import urlparse

from pydantic import HttpUrl

from app.services.openai_service import OpenAIService


class ContentService:
    """Service for processing content from different sources."""

    def __init__(self, openai_service: OpenAIService):
        self.openai_service = openai_service

    def process_content(self, data: str | HttpUrl) -> List[dict]:
        """Process content from text or URL and return fact-check results."""
        # Check if it appears to be a URL or just text content
        parsed_url = urlparse(str(data))
        if parsed_url.netloc:
            return self._process_url(data)
        else:
            # For testing, use a sample text if needed
            text = data
            return self._process_text(str(text))

    def _process_url(self, url: HttpUrl) -> List[dict]:
        """Process content from a URL."""
        if self._is_instagram_url(url):
            return self._process_instagram(url)
        elif self._is_tiktok_url(url):
            return self._process_tiktok(url)
        else:
            raise ValueError("Invalid URL (only Instagram and TikTok are supported)")

    def _process_text(self, text: str) -> List[dict]:
        """Process raw text content."""
        statements = self.openai_service.extract_statements(text)
        return self._check_statements(statements)

    def _is_instagram_url(self, url: HttpUrl) -> bool:
        """Check if URL is from Instagram."""
        parsed_url = urlparse(str(url))
        return parsed_url.netloc in ["www.instagram.com", "instagram.com"]

    def _is_tiktok_url(self, url: HttpUrl) -> bool:
        """Check if URL is from TikTok."""
        parsed_url = urlparse(str(url))
        return parsed_url.netloc in ["www.tiktok.com", "tiktok.com", "vm.tiktok.com"]

    def _process_instagram(self, url: HttpUrl) -> List[dict]:
        """Process content from Instagram URL."""
        transcript = self._get_instagram_transcript(url)
        statements = self.openai_service.extract_statements(transcript)
        return self._check_statements(statements)

    def _process_tiktok(self, url: HttpUrl) -> List[dict]:
        """Process content from TikTok URL."""
        transcript = self._get_tiktok_transcript(url)
        statements = self.openai_service.extract_statements(transcript)
        return self._check_statements(statements)

    def _get_instagram_transcript(self, url: HttpUrl) -> str:
        """Get transcript from Instagram post."""
        # TODO: Implement
        return "This is a fake transcript"

    def _get_tiktok_transcript(self, url: HttpUrl) -> str:
        """Get transcript from TikTok video."""
        # TODO: Implement
        return "This is a fake transcript"

    def _check_statements(self, statements: List[str]) -> List[dict]:
        """Check multiple statements."""
        # Limit to MAX_STATEMENTS
        from app.core.config import MAX_STATEMENTS

        statements = statements[:MAX_STATEMENTS]

        results = []
        for statement in statements:
            statement_check, sources = self.openai_service.check_statement(statement)
            result = {
                "statement": statement,
                "probability": statement_check.probability,
                "reason": statement_check.reason,
                "sources": sources,
            }
            results.append(result)

        return results
