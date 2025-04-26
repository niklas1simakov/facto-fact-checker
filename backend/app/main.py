"""Main application module."""

import fastapi
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.ws.endpoints import router as ws_router


def create_app() -> fastapi.FastAPI:
    """Create and configure FastAPI application."""
    app = fastapi.FastAPI(
        title="Fact Checker API",
        description="API for checking factual accuracy of content",
        version="0.1.0",
    )

    # Set up CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Adjust in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routes
    app.include_router(api_router)

    # Include WebSocket routes
    app.include_router(ws_router)

    return app


app = create_app()
