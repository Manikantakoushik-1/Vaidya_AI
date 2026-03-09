"""
VaidyaAI – STT (Speech-to-Text) router.
POST /api/stt/transcribe — transcribe audio to text using Sarvam AI.
"""

import logging
from fastapi import APIRouter, UploadFile, File, Form, Request, HTTPException
from app.services.stt_service import STTService
from app.middleware.rate_limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/stt", tags=["stt"])

_stt = STTService()


@router.post("/transcribe", summary="Speech-to-text transcription")
@limiter.limit("20/minute")
async def transcribe(
    request: Request,
    file: UploadFile = File(...),
    language: str = Form(default="en"),
):
    """Transcribe audio file to text using Sarvam AI."""
    audio_bytes = await file.read()
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file.")
    if len(audio_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=413, detail="Audio file too large (max 10MB).")

    transcript = await _stt.transcribe(audio_bytes, language)
    if transcript is None:
        raise HTTPException(
            status_code=503,
            detail="STT service unavailable. Set SARVAM_API_KEY in .env.",
        )

    return {"transcript": transcript, "language": language}
