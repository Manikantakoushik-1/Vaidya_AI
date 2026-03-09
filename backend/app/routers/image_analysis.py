"""
VaidyaAI – Image Analysis router.
POST /api/consultation/image — multimodal image-based symptom analysis.
"""

import logging
from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException
from fastapi.responses import JSONResponse
from app.services.vision_engine import VisionEngine
from app.services.analytics_service import AnalyticsService
from app.middleware.rate_limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/consultation", tags=["consultation"])

_vision = VisionEngine()
_analytics = AnalyticsService()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/image", summary="Image-based symptom analysis")
@limiter.limit("10/minute")
async def analyze_image(
    request: Request,
    image: UploadFile = File(..., description="Image of symptom"),
    text: str = Form(default="", description="Optional description"),
    language: str = Form(default="en", description="Language: en/hi/te"),
) -> JSONResponse:
    """Analyse an uploaded image of a symptom using Gemini Vision."""

    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image type. Use JPEG, PNG, or WEBP.")

    image_bytes = await image.read()
    if len(image_bytes) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="Image too large. Max 10 MB.")

    analysis = await _vision.analyze_image(
        image_bytes=image_bytes,
        mime_type=image.content_type or "image/jpeg",
        text=text,
        language=language,
    )

    # Log analytics
    try:
        _analytics.log_consultation(
            symptoms=["image_analysis"],
            severity="moderate",
            language=language,
            is_emergency=False,
        )
    except Exception:
        pass

    return JSONResponse(content={
        "analysis": analysis,
        "language": language,
        "disclaimer": "⚠️ This is AI-based visual analysis only. Always consult a doctor for proper diagnosis.",
    })
