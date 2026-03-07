"""
VaidyaAI – Health-check router.
Provides a lightweight liveness/readiness probe endpoint.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/health", tags=["health"])

APP_VERSION = "1.0.0"


class HealthResponse(BaseModel):
    status: str
    version: str
    service: str


@router.get("", response_model=HealthResponse, summary="Health check")
async def health_check() -> HealthResponse:
    """Returns service status and version — used by load-balancers and monitoring tools."""
    return HealthResponse(
        status="ok",
        version=APP_VERSION,
        service="VaidyaAI Backend",
    )
