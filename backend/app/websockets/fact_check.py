"""WebSocket for fact checking with progress updates."""

import asyncio
import logging
import uuid
import time
from typing import Any, Dict, Literal, Optional

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from app.api.dependencies import get_content_service
from app.core.config import MAX_STATEMENTS
from app.models.schemas import BodyData
from app.services.content_service import ContentService

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("factcheck_websocket")

router = APIRouter(tags=["websockets"])

# Store active connections
active_connections: Dict[str, WebSocket] = {}
# Store last activity time for each connection
connection_last_activity: Dict[str, float] = {}
# Connection timeout in seconds (10 minutes)
CONNECTION_TIMEOUT = 10 * 60
# How often to check for inactive connections (5 minutes)
CLEANUP_INTERVAL = 5 * 60

# Define progress type for better type safety
ProgressStage = Literal[
    "started", "video-processing", "extraction", "extraction_complete", "verification"
]


class ProgressUpdate(Dict[str, Any]):
    """Standard progress update message."""

    def __init__(
        self,
        stage: ProgressStage,
        statements: Optional[list[str]] = None,
        statementIndex: Optional[int] = None,
        totalStatements: Optional[int] = None,
        currentStatement: Optional[str] = None,
    ):
        data = {
            "type": "progress",
            "stage": stage,
        }

        if statements is not None:
            data["statements"] = statements

        if totalStatements is not None:
            data["totalStatements"] = totalStatements

        if statementIndex is not None:
            data["statementIndex"] = statementIndex

        if currentStatement is not None:
            data["currentStatement"] = currentStatement

        super().__init__(data)


class ErrorMessage(Dict[str, Any]):
    def __init__(self, message: str):
        super().__init__({"type": "error", "message": message})


class CompleteMessage(Dict[str, Any]):
    def __init__(self, results: list[Dict[str, Any]]):
        super().__init__({"type": "complete", "results": results})


class ConnectionMessage(Dict[str, Any]):
    def __init__(self, client_id: str):
        super().__init__(
            {
                "type": "connection",
                "client_id": client_id,
            }
        )


@router.websocket("/ws/fact-check/{client_id}")
async def websocket_fact_check(
    websocket: WebSocket,
    client_id: str,
    content_service: ContentService = Depends(get_content_service),
):
    """
    WebSocket endpoint for fact checking with real-time progress updates.

    Connect to this WebSocket endpoint to receive real-time updates during fact checking.

    - **client_id**: A unique identifier for the client connection. If not provided or "undefined", a UUID will be generated.

    The client should send a JSON message with the following structure:
    ```json
    {
        "data": "Text content or URL to fact check"
    }
    ```

    The server will send progress updates with the following types:
    - **connection**: Initial connection confirmation
    - **progress**: Updates during the fact checking process
        - **started**: Starting the fact checking process
        - **video-processing**: Processing a video (only for Instagram and TikTok URLs)
        - **extraction**: Extracting statements from the content
        - **extraction_complete**: Extraction complete
        - **verification**: Verifying statements
    - **error**: Error messages
    - **complete**: Final results of the fact checking process

    Connections will automatically close after 10 minutes of inactivity.
    """
    # Use client_id if provided, otherwise generate one
    if not client_id or client_id == "undefined":
        client_id = str(uuid.uuid4())
        logger.debug(f"Generated new client_id: {client_id}")

    # Accept connection
    await websocket.accept()
    active_connections[client_id] = websocket
    # Set initial activity time
    connection_last_activity[client_id] = time.time()

    # Start the cleanup task if it's not already running
    if not hasattr(websocket_fact_check, "cleanup_task_running"):
        websocket_fact_check.cleanup_task_running = True
        asyncio.create_task(cleanup_inactive_connections())

    try:
        # Send initial connection confirmation
        await send_message(client_id, ConnectionMessage(client_id=client_id))

        while True:
            # Wait for messages from the client
            data = await websocket.receive_json()
            # Update last activity time
            connection_last_activity[client_id] = time.time()

            logger.info(f"Received message from client {client_id}")
            logger.debug(f"Message data: {data}")

            # Start processing in the background
            asyncio.create_task(process_request(client_id, data, content_service))

    except WebSocketDisconnect:
        disconnect(client_id)
    except Exception as e:
        # Handle unexpected errors
        logger.error(
            f"Unexpected error in websocket connection for {client_id}: {str(e)}",
            exc_info=True,
        )
        try:
            await send_message(client_id, ErrorMessage(f"Unexpected error: {str(e)}"))
        except Exception:
            # If we can't send the error, just disconnect
            logger.error(f"Failed to send error message to {client_id}", exc_info=True)
            pass
        finally:
            disconnect(client_id)


async def send_message(client_id: str, data: Dict[str, Any]):
    """Send message to client."""

    logger.debug(f"Sending message to {client_id}: {data}")
    if client_id in active_connections:
        await active_connections[client_id].send_json(data)
        # Update last activity time when sending messages
        connection_last_activity[client_id] = time.time()


def disconnect(client_id: str):
    """Disconnect client."""
    if client_id in active_connections:
        del active_connections[client_id]
    if client_id in connection_last_activity:
        del connection_last_activity[client_id]


async def cleanup_inactive_connections():
    """Periodically check and close inactive connections."""
    while True:
        try:
            current_time = time.time()
            clients_to_disconnect = []

            # Find inactive connections
            for client_id, last_activity in connection_last_activity.items():
                if current_time - last_activity > CONNECTION_TIMEOUT:
                    clients_to_disconnect.append(client_id)

            # Disconnect inactive clients
            for client_id in clients_to_disconnect:
                logger.info(
                    f"Closing inactive connection for client {client_id} after {CONNECTION_TIMEOUT / 60} minutes"
                )
                if client_id in active_connections:
                    try:
                        # Send timeout message before closing
                        await send_message(
                            client_id,
                            ErrorMessage("Connection closed due to inactivity"),
                        )
                        await active_connections[client_id].close(
                            code=1000, reason="Inactive connection"
                        )
                    except Exception as e:
                        logger.error(
                            f"Error closing connection for {client_id}: {str(e)}"
                        )
                    finally:
                        disconnect(client_id)

        except Exception as e:
            logger.error(f"Error in cleanup task: {str(e)}", exc_info=True)

        # Wait for next cleanup cycle
        await asyncio.sleep(CLEANUP_INTERVAL)


async def process_request(
    client_id: str, data: Dict[str, Any], content_service: ContentService
):
    """Process a fact-checking request with progress updates via WebSocket."""
    try:
        # Extract data from the request
        if not data.get("data"):
            await send_message(client_id, ErrorMessage("No data provided"))
            return

        # Create a BodyData object
        body_data = BodyData(data=data.get("data"))

        # Send initial progress - started
        await send_message(client_id, ProgressUpdate(stage="started"))

        # Initial URL parsing for progress reporting
        from urllib.parse import urlparse

        parsed_url = urlparse(str(body_data.data))

        # Determine if we're processing a URL or text
        if parsed_url.netloc:
            # Handle URL
            if content_service._is_instagram_url(
                body_data.data
            ) or content_service._is_tiktok_url(body_data.data):
                # Notify about video processing
                await send_message(client_id, ProgressUpdate(stage="video-processing"))

                # Get transcript based on URL type
                if content_service._is_instagram_url(body_data.data):
                    transcript = content_service._get_instagram_transcript(
                        body_data.data
                    )
                else:
                    transcript = content_service._get_tiktok_transcript(body_data.data)

                logger.debug(f"Transcript: {transcript}")

                # Extract statements from transcript
                await send_message(client_id, ProgressUpdate(stage="extraction"))
                statements = content_service.openai_service.extract_statements(
                    transcript
                )
                logger.debug(f"Statements: {statements}")
            else:
                await send_message(
                    client_id,
                    ErrorMessage(
                        "Invalid URL (only Instagram and TikTok are supported)"
                    ),
                )
                return
        else:
            # Process as text
            await send_message(client_id, ProgressUpdate(stage="extraction"))
            statements = content_service.openai_service.extract_statements(
                str(body_data.data)
            )

        # Wait 2 second - this is a hack to allow the client to update the UI
        await asyncio.sleep(2)

        # Limit number of statements
        # TODO: add back in and notify user if statements were limited
        # original_count = len(statements)
        statements = statements[:MAX_STATEMENTS]
        # was_limited = original_count > MAX_STATEMENTS

        # await send_message(
        #     client_id,
        #     ProgressUpdate(
        #         stage="extraction_complete",
        #         statements=statements,
        #     ),
        # )

        # Wait 2 second - this is a hack to allow the client to update the UI
        # await asyncio.sleep(2)

        # Check each statement
        results = []
        for i, statement in enumerate(statements):
            # Send progress update for each statement
            await send_message(
                client_id,
                ProgressUpdate(
                    stage="verification",
                    statementIndex=i,
                    totalStatements=len(statements),
                    currentStatement=statement,
                ),
            )

            # Give a small delay to allow progress updates to be seen
            await asyncio.sleep(0.1)

            # Check the statement
            statement_check, sources = content_service.openai_service.check_statement(
                statement
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
        await send_message(client_id, CompleteMessage(results=results))

        logger.info(f"Fact check complete for {client_id}")
        logger.debug(f"Results: {results}")

    except Exception as e:
        logger.error(
            f"Error during fact checking for {client_id}: {str(e)}", exc_info=True
        )
        await send_message(
            client_id, ErrorMessage(f"Error during fact checking: {str(e)}")
        )


async def send_error(client_id: str, message: str):
    """Send error message to client."""
    logger.error(f"Sending error to client {client_id}: {message}")
    await send_message(client_id, ErrorMessage(message))
