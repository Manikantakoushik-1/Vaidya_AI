"""
VaidyaAI – STT (Speech-to-Text) Service.
Uses Sarvam AI for high-quality Telugu/Hindi/English transcription.
Falls back to returning empty (frontend Web Speech API handles STT by default).
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


class STTService:
    """Speech-to-text service using Sarvam AI."""

    SARVAM_LANG_MAP = {
        "en": "en-IN",
        "hi": "hi-IN",
        "te": "te-IN",
    }

    def __init__(self) -> None:
        from app.config import get_settings
        settings = get_settings()
        self._sarvam_key = settings.SARVAM_API_KEY.strip()
        self._has_sarvam = bool(self._sarvam_key) and not self._sarvam_key.startswith("your_")
        if self._has_sarvam:
            logger.info("Sarvam AI STT configured.")
        else:
            logger.info("Sarvam AI key not set — STT will rely on frontend Web Speech API.")

    async def transcribe(self, audio_bytes: bytes, language: str = "en") -> Optional[str]:
        """
        Transcribe audio to text using Sarvam AI.
        Returns transcribed text or None if failed.
        """
        if not self._has_sarvam:
            return None

        try:
            import httpx
            target_lang = self.SARVAM_LANG_MAP.get(language, "en-IN")

            async with httpx.AsyncClient() as client:
                # Sarvam AI expects multipart form data with audio file
                files = {"file": ("audio.wav", audio_bytes, "audio/wav")}
                data = {
                    "language_code": target_lang,
                    "model": "saarika:v2",
                    "with_timestamps": "false",
                }

                response = await client.post(
                    "https://api.sarvam.ai/speech-to-text",
                    files=files,
                    data=data,
                    headers={"api-subscription-key": self._sarvam_key},
                    timeout=20.0,
                )

                if response.status_code == 200:
                    result = response.json()
                    transcript = result.get("transcript", "")
                    logger.info("Sarvam STT success — lang=%s, length=%d", language, len(transcript))
                    return transcript
                else:
                    logger.warning("Sarvam STT HTTP %d: %s", response.status_code, response.text[:200])
        except Exception as exc:
            logger.warning("Sarvam STT error: %s", exc)

        return None
