"""API router configuration."""

from fastapi import APIRouter

from app.api.endpoints import fact_check

# Main API router
api_router = APIRouter()

# Include routers from endpoint modules
api_router.include_router(fact_check.router, tags=["fact-check"])

# For future websocket endpoints
# ws_router = APIRouter()
# ws_router.include_router(...)
