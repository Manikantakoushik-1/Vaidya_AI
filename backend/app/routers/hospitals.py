"""
VaidyaAI – Hospital finder router.
GET /api/hospitals/nearby — returns the closest public health facilities to a GPS coordinate.
"""

from fastapi import APIRouter, Query, HTTPException, Request
from app.models.hospital import Hospital, HospitalListResponse
from app.services.hospital_finder import HospitalFinder
from app.middleware.rate_limiter import limiter

router = APIRouter(prefix="/api/hospitals", tags=["hospitals"])

_finder = HospitalFinder()


@router.get(
    "/nearby",
    response_model=HospitalListResponse,
    summary="Find nearby hospitals",
)
@limiter.limit("30/minute")
async def get_nearby_hospitals(
    request: Request,
    lat: float = Query(..., description="Patient latitude", ge=-90, le=90),
    lng: float = Query(..., description="Patient longitude", ge=-180, le=180),
    limit: int = Query(default=10, ge=1, le=50, description="Maximum number of results"),
) -> HospitalListResponse:
    """
    Return the closest government hospitals / PHCs / CHCs to the supplied coordinates.
    Results are sorted by distance (ascending).
    """
    hospitals: list[Hospital] = _finder.find_nearest(lat=lat, lng=lng, limit=limit)
    return HospitalListResponse(hospitals=hospitals, total=len(hospitals))
