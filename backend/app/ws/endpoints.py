"""WebSocket endpoints."""

import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.ws.manager import manager

# Create router for WebSocket endpoints
router = APIRouter()


@router.websocket("/ws/fact-check/{client_id}")
async def websocket_fact_check(websocket: WebSocket, client_id: str):
    """
    WebSocket endpoint for fact checking with real-time progress updates.
    """
    # Use client_id if provided, otherwise generate one
    if not client_id or client_id == "undefined":
        client_id = str(uuid.uuid4())

    await manager.connect(websocket, client_id)
    try:
        while True:
            # Wait for messages from the client
            data = await websocket.receive_json()

            # Process user request
            # TODO: Implement async processing with progress updates

            # Send back the client_id for future reference
            await manager.send_progress(
                client_id, {"type": "connection_established", "client_id": client_id}
            )

    except WebSocketDisconnect:
        manager.disconnect(client_id)
