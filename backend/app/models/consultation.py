"""
VaidyaAI – Pydantic models for medical consultations.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ConsultationRequest(BaseModel):
    """Incoming consultation request from the patient."""

    text: str = Field(..., min_length=1, max_length=2000, description="Patient's symptom description")
    language: str = Field(default="en", description="Language code: 'en', 'hi', or 'te'")
    user_id: Optional[str] = Field(default=None, description="Optional anonymous user identifier")


class SymptomInfo(BaseModel):
    """A single identified symptom with its severity classification."""

    name: str = Field(..., description="Symptom name")
    severity: str = Field(
        ...,
        description="Severity level: mild | moderate | severe | emergency",
    )


class ConsultationResponse(BaseModel):
    """Full consultation response returned to the patient."""

    guidance: str = Field(..., description="AI-generated health guidance text")
    symptoms: List[SymptomInfo] = Field(default_factory=list, description="Extracted symptoms list")
    severity: str = Field(
        ...,
        description="Overall severity: mild | moderate | severe | emergency",
    )
    is_emergency: bool = Field(..., description="True when immediate medical attention is required")
    disclaimer: str = Field(..., description="Medical disclaimer text")
    language: str = Field(..., description="Language in which the response is given")
    home_remedies: Optional[List[str]] = Field(
        default=None, description="Suggested home remedies (only for mild conditions)"
    )
    when_to_seek_help: Optional[str] = Field(
        default=None, description="Guidance on when the patient must see a doctor"
    )
