"""WebSocket connection manager."""

from typing import Dict

from fastapi import WebSocket


class ConnectionManager:
    """Manager for WebSocket connections."""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect new client."""
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        """Disconnect client."""
        if client_id in self.active_connections:
            del self.active_connections[client_id]

    async def send_progress(self, client_id: str, data: dict):
        """Send progress update to client."""
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(data)

    async def broadcast(self, data: dict):
        """Broadcast message to all connected clients."""
        for connection in self.active_connections.values():
            await connection.send_json(data)


# Singleton instance
manager = ConnectionManager()
