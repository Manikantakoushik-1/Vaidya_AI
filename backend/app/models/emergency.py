"""
VaidyaAI – Pydantic models for emergency detection.
"""

from typing import Optional
from pydantic import BaseModel, Field


class EmergencyCheckRequest(BaseModel):
    """Request body for the emergency-check endpoint."""

    text: str = Field(..., min_length=1, max_length=2000, description="Patient's symptom description")
    language: str = Field(default="en", description="Language code: 'en', 'hi', or 'te'")


class EmergencyCheckResponse(BaseModel):
    """Result of the emergency classification."""

    is_emergency: bool
    emergency_type: Optional[str] = Field(
        default=None, description="Category of emergency (e.g. 'cardiac', 'trauma')"
    )
    message: str = Field(..., description="Human-readable emergency guidance message")
    call_number: str = Field(default="108", description="Emergency helpline to call")
