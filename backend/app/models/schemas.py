"""Pydantic models for the application."""

from typing import List, Literal

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
