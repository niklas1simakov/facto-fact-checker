"""Pydantic models for the application."""

from typing import List, Literal, Optional

from pydantic import BaseModel, HttpUrl


class BodyData(BaseModel):
    """Request body for fake-check endpoint."""

    data: HttpUrl | str


class StatementList(BaseModel):
    """List of extracted statements."""

    statements: list[str]


class StatementCheck(BaseModel):
    """Result of checking a single statement."""

    probability: Literal["high", "low", "uncertain"]
    reason: str


class Statement:
    """Complete statement information including check results."""

    statement: str
    probability: Literal["high", "low", "uncertain"]
    reason: str
    sources: List[str]


# WebSocket response models
class WSResponseBase(BaseModel):
    """Base model for WebSocket responses."""

    type: str
    message: Optional[str] = None


class WSConnectionResponse(WSResponseBase):
    """Response for WebSocket connection establishment."""

    type: Literal["connection"]
    client_id: str


class WSProgressResponse(WSResponseBase):
    """Response for progress updates."""

    type: Literal["progress"]
    stage: str
    progress: float
    current_statement: Optional[str] = None
    statements: Optional[List[str]] = None


class WSErrorResponse(WSResponseBase):
    """Response for error messages."""

    type: Literal["error"]


class WSCompleteResponse(WSResponseBase):
    """Response for completed fact checking."""

    type: Literal["complete"]
    progress: float = 100
    results: List[dict]
