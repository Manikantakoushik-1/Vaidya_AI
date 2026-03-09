"""
VaidyaAI – Analytics router.
GET /api/analytics/summary — returns aggregated dashboard metrics.
"""

from fastapi import APIRouter, Request
from app.services.analytics_service import AnalyticsService
from app.middleware.rate_limiter import limiter

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

_analytics = AnalyticsService()


@router.get("/summary", summary="Analytics dashboard summary")
@limiter.limit("60/minute")
async def analytics_summary(request: Request) -> dict:
    """
    Return aggregated analytics for the dashboard:
    total consultations, time-filtered counts, top symptoms,
    severity/language distributions, emergency alerts, peak hours, etc.
    """
    return _analytics.get_summary()
