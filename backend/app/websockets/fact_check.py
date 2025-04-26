"""WebSocket for fact checking with progress updates."""

import asyncio
import uuid
from typing import Any, Dict

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from app.api.dependencies import get_content_service
from app.core.config import MAX_STATEMENTS
from app.models.schemas import BodyData
from app.services.content_service import ContentService

router = APIRouter()

# Store active connections
active_connections: Dict[str, WebSocket] = {}


@router.websocket("/ws/fact-check/{client_id}")
async def websocket_fact_check(
    websocket: WebSocket,
    client_id: str,
    content_service: ContentService = Depends(get_content_service),
):
    """
    WebSocket endpoint for fact checking with real-time progress updates.
    """
    # Use client_id if provided, otherwise generate one
    if not client_id or client_id == "undefined":
        client_id = str(uuid.uuid4())

    # Accept connection
    await websocket.accept()
    active_connections[client_id] = websocket

    try:
        # Send initial connection confirmation
        await send_progress(
            client_id,
            {
                "type": "connection",
                "message": "Connected to fact checking service",
                "client_id": client_id,
            },
        )

        while True:
            # Wait for messages from the client
            data = await websocket.receive_json()

            # Start processing in the background
            asyncio.create_task(process_request(client_id, data, content_service))

    except WebSocketDisconnect:
        disconnect(client_id)
    except Exception as e:
        # Handle unexpected errors
        try:
            await send_progress(
                client_id, {"type": "error", "message": f"Unexpected error: {str(e)}"}
            )
        except:
            # If we can't send the error, just disconnect
            pass
        finally:
            disconnect(client_id)


async def send_progress(client_id: str, data: Dict[str, Any]):
    """Send progress update to client."""
    if client_id in active_connections:
        await active_connections[client_id].send_json(data)


def disconnect(client_id: str):
    """Disconnect client."""
    if client_id in active_connections:
        del active_connections[client_id]


async def process_request(
    client_id: str, data: Dict[str, Any], content_service: ContentService
):
    """Process a fact-checking request with progress updates via WebSocket."""
    try:
        # Extract data from the request
        if not data.get("data"):
            await send_error(client_id, "No data provided")
            return

        # Create a BodyData object
        body_data = BodyData(data=data.get("data"))

        # Send initial progress
        await send_progress(
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
            if content_service._is_instagram_url(
                body_data.data
            ) or content_service._is_tiktok_url(body_data.data):
                await send_progress(
                    client_id,
                    {
                        "type": "progress",
                        "stage": "extraction",
                        "message": "Getting transcript from social media",
                        "progress": 20,
                    },
                )

                # Get transcript based on URL type
                if content_service._is_instagram_url(body_data.data):
                    transcript = content_service._get_instagram_transcript(
                        body_data.data
                    )
                else:
                    transcript = content_service._get_tiktok_transcript(body_data.data)

                # Extract statements from transcript
                await send_progress(
                    client_id,
                    {
                        "type": "progress",
                        "stage": "extraction",
                        "message": "Extracting statements from transcript",
                        "progress": 40,
                    },
                )
                statements = content_service.openai_service.extract_statements(
                    transcript
                )
            else:
                # Process as text
                await send_progress(
                    client_id,
                    {
                        "type": "progress",
                        "stage": "extraction",
                        "message": "Extracting statements from text",
                        "progress": 30,
                    },
                )
                statements = content_service.openai_service.extract_statements(
                    str(body_data.data)
                )

            # Limit number of statements
            statements = statements[:MAX_STATEMENTS]

            await send_progress(
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
                await send_progress(
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
                    content_service.openai_service.check_statement(statement)
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
            await send_progress(
                client_id,
                {
                    "type": "complete",
                    "message": "Fact checking complete",
                    "progress": 100,
                    "results": results,
                },
            )

        except Exception as e:
            await send_error(client_id, f"Error during fact checking: {str(e)}")

    except Exception as e:
        await send_error(client_id, f"Unexpected error: {str(e)}")


async def send_error(client_id: str, message: str):
    """Send error message to client."""
    await send_progress(client_id, {"type": "error", "message": message})
