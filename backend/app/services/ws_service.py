"""Service for WebSocket-based fact checking with progress updates."""

import asyncio
from typing import Any, Dict

from app.models.schemas import BodyData
from app.services.content_service import ContentService
from app.ws.manager import manager


class WebSocketService:
    """Service for processing WebSocket-based fact checking requests."""

    def __init__(self, content_service: ContentService):
        self.content_service = content_service

    async def process_request(self, client_id: str, data: Dict[str, Any]):
        """Process a fact-checking request with progress updates via WebSocket."""
        try:
            # Extract data from the request
            if not data.get("data"):
                await self._send_error(client_id, "No data provided")
                return

            # Create a BodyData object
            body_data = BodyData(data=data.get("data"))

            # Send initial progress
            await self._send_progress(
                client_id,
                {
                    "type": "progress",
                    "stage": "started",
                    "message": "Starting fact check process",
                    "progress": 0,
                },
            )

            # Parse input and extract statements
            parsed_url = None
            text_content = None

            try:
                # Extract statements based on input type
                if self.content_service._is_instagram_url(
                    body_data.data
                ) or self.content_service._is_tiktok_url(body_data.data):
                    await self._send_progress(
                        client_id,
                        {
                            "type": "progress",
                            "stage": "extraction",
                            "message": "Getting transcript from social media",
                            "progress": 20,
                        },
                    )

                    # Get transcript based on URL type
                    if self.content_service._is_instagram_url(body_data.data):
                        transcript = self.content_service._get_instagram_transcript(
                            body_data.data
                        )
                    else:
                        transcript = self.content_service._get_tiktok_transcript(
                            body_data.data
                        )

                    # Extract statements from transcript
                    await self._send_progress(
                        client_id,
                        {
                            "type": "progress",
                            "stage": "extraction",
                            "message": "Extracting statements from transcript",
                            "progress": 40,
                        },
                    )
                    statements = self.content_service.openai_service.extract_statements(
                        transcript
                    )
                else:
                    # Process as text
                    await self._send_progress(
                        client_id,
                        {
                            "type": "progress",
                            "stage": "extraction",
                            "message": "Extracting statements from text",
                            "progress": 30,
                        },
                    )
                    statements = self.content_service.openai_service.extract_statements(
                        str(body_data.data)
                    )

                # Limit number of statements
                from app.core.config import MAX_STATEMENTS

                statements = statements[:MAX_STATEMENTS]

                await self._send_progress(
                    client_id,
                    {
                        "type": "progress",
                        "stage": "extraction_complete",
                        "message": f"Found {len(statements)} statements to verify",
                        "progress": 50,
                        "statements": statements,
                    },
                )

                # Check each statement
                results = []
                for i, statement in enumerate(statements):
                    # Send progress update for each statement
                    percent_complete = 50 + (i / len(statements) * 50)
                    await self._send_progress(
                        client_id,
                        {
                            "type": "progress",
                            "stage": "verification",
                            "message": f"Checking statement {i + 1} of {len(statements)}",
                            "progress": percent_complete,
                            "current_statement": statement,
                        },
                    )

                    # Give a small delay to allow progress updates to be seen
                    await asyncio.sleep(0.1)

                    # Check the statement
                    statement_check, sources = (
                        self.content_service.openai_service.check_statement(statement)
                    )

                    # Add result
                    result = {
                        "statement": statement,
                        "probability": statement_check.probability,
                        "reason": statement_check.reason,
                        "sources": sources,
                    }
                    results.append(result)

                # Send final results
                await self._send_progress(
                    client_id,
                    {
                        "type": "complete",
                        "message": "Fact checking complete",
                        "progress": 100,
                        "results": results,
                    },
                )

            except Exception as e:
                await self._send_error(
                    client_id, f"Error during fact checking: {str(e)}"
                )

        except Exception as e:
            await self._send_error(client_id, f"Unexpected error: {str(e)}")

    async def _send_progress(self, client_id: str, data: Dict[str, Any]):
        """Send progress update to client."""
        await manager.send_progress(client_id, data)

    async def _send_error(self, client_id: str, message: str):
        """Send error message to client."""
        await manager.send_progress(client_id, {"type": "error", "message": message})
