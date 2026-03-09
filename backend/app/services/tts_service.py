"""
VaidyaAI – TTS Service.
Generates audio from text using Sarvam AI (primary) or gTTS fallback.
Sarvam AI provides high-quality, natural-sounding Indian language voices.
"""

import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class TTSService:
    """Text-to-speech service with Sarvam AI and gTTS fallback."""

    # Sarvam AI voice options per language
    SARVAM_VOICES = {
        "en": "meera",      # English female voice
        "hi": "meera",      # Hindi female voice
        "te": "meera",      # Telugu female voice
    }

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
            logger.info("Sarvam AI TTS configured — using high-quality Indian voices.")
        else:
            logger.info("Sarvam AI key not set — using gTTS fallback for TTS.")

    async def synthesize(self, text: str, language: str = "en") -> tuple[bytes, str]:
        """
        Synthesise speech from text.
        Returns (audio_bytes, content_type).
        Priority: Sarvam AI → gTTS fallback.
        """
        if self._has_sarvam:
            result = await self._sarvam_tts(text, language)
            if result:
                return result
            logger.warning("Sarvam TTS failed, falling back to gTTS.")

        return self._gtts_fallback(text, language)

    async def _sarvam_tts(self, text: str, language: str) -> Optional[tuple[bytes, str]]:
        """Try Sarvam AI TTS API with proper language and voice selection."""
        try:
            import httpx
            target_lang = self.SARVAM_LANG_MAP.get(language, "en-IN")
            speaker = self.SARVAM_VOICES.get(language, "meera")

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.sarvam.ai/text-to-speech",
                    json={
                        "inputs": [text[:500]],
                        "target_language_code": target_lang,
                        "speaker": speaker,
                        "model": "bulbul:v1",
                        "pitch": 0,
                        "pace": 1.0,
                        "loudness": 1.5,
                        "speech_sample_rate": 22050,
                        "enable_preprocessing": True,
                    },
                    headers={
                        "api-subscription-key": self._sarvam_key,
                        "Content-Type": "application/json",
                    },
                    timeout=15.0,
                )
                if response.status_code == 200:
                    data = response.json()
                    audios = data.get("audios", [])
                    if audios:
                        import base64
                        audio_bytes = base64.b64decode(audios[0])
                        logger.info("Sarvam TTS success — lang=%s, speaker=%s", language, speaker)
                        return audio_bytes, "audio/wav"
                else:
                    logger.warning("Sarvam TTS HTTP %d: %s", response.status_code, response.text[:200])
        except Exception as exc:
            logger.warning("Sarvam TTS error: %s", exc)
        return None

    def _gtts_fallback(self, text: str, language: str) -> tuple[bytes, str]:
        """Fallback to Google TTS (gTTS). Works without API key."""
        try:
            from gtts import gTTS
            lang_map = {"en": "en", "hi": "hi", "te": "te"}
            tts = gTTS(text=text[:500], lang=lang_map.get(language, "en"), slow=False)
            buffer = io.BytesIO()
            tts.write_to_fp(buffer)
            buffer.seek(0)
            return buffer.read(), "audio/mpeg"
        except Exception as exc:
            logger.error("gTTS failed: %s", exc)
            return b"", "audio/mpeg"
