"""Main application module."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.fact_check import router as fact_check_router
from app.websockets.fact_check import router as ws_router


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    app = FastAPI(
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

    # Include routers directly
    app.include_router(fact_check_router, tags=["fact-check"])
    app.include_router(ws_router)

    return app


app = create_app()
