"""
VaidyaAI – TTS router.
POST /api/tts/synthesize — returns audio from text.
"""

import logging
from fastapi import APIRouter, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field
from app.services.tts_service import TTSService
from app.middleware.rate_limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/tts", tags=["tts"])

_tts = TTSService()


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    language: str = Field(default="en")


@router.post("/synthesize", summary="Text-to-speech synthesis")
@limiter.limit("20/minute")
async def synthesize(request: Request, body: TTSRequest) -> Response:
    """Convert text to speech audio."""
    audio_bytes, content_type = await _tts.synthesize(body.text, body.language)
    if not audio_bytes:
        return Response(content="TTS failed", status_code=500)
    return Response(content=audio_bytes, media_type=content_type)
