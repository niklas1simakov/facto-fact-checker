"""WebSocket endpoints."""

import uuid

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from app.api.dependencies import get_ws_service
from app.services.ws_service import WebSocketService
from app.ws.manager import manager

# Create router for WebSocket endpoints
router = APIRouter()


@router.websocket("/ws/fact-check/{client_id}")
async def websocket_fact_check(
    websocket: WebSocket,
    client_id: str,
    ws_service: WebSocketService = Depends(get_ws_service),
):
    """
    WebSocket endpoint for fact checking with real-time progress updates.
    """
    # Use client_id if provided, otherwise generate one
    if not client_id or client_id == "undefined":
        client_id = str(uuid.uuid4())

    await manager.connect(websocket, client_id)
    try:
        # Send initial connection confirmation
        await manager.send_progress(
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
            import asyncio

            asyncio.create_task(ws_service.process_request(client_id, data))

    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        # Handle unexpected errors
        try:
            await manager.send_progress(
                client_id, {"type": "error", "message": f"Unexpected error: {str(e)}"}
            )
        except:
            # If we can't send the error, just disconnect
            pass
        finally:
            manager.disconnect(client_id)
