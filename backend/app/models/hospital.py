"""
VaidyaAI – Pydantic models for hospital data.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class Hospital(BaseModel):
    """Represents a single hospital / health facility."""

    id: str
    name: str
    type: str = Field(..., description="PHC | CHC | District Hospital | Government Hospital")
    address: str
    district: str
    state: str
    lat: float
    lng: float
    phone: Optional[str] = None
    beds: Optional[int] = None
    distance_km: Optional[float] = Field(
        default=None, description="Distance from the queried location (computed at runtime)"
    )


class HospitalListResponse(BaseModel):
    """Paginated list of nearby hospitals."""

    hospitals: List[Hospital]
    total: int
