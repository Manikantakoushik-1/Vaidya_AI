"""
VaidyaAI – Vision Engine Service.
Sends images to Gemini 2.5 Flash multimodal for visual symptom analysis.
"""

import asyncio
import base64
import logging
from typing import Any

logger = logging.getLogger(__name__)


class VisionEngine:
    """Analyse images of symptoms using Gemini Vision (multimodal)."""

    def __init__(self) -> None:
        self._model: Any = None
        self._initialized = False
        self._init_gemini()

    def _init_gemini(self) -> None:
        try:
            from app.config import get_settings
            import google.generativeai as genai

            settings = get_settings()
            if not settings.gemini_configured:
                logger.warning("GEMINI_API_KEY not set — image analysis unavailable.")
                return

            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._model = genai.GenerativeModel(model_name="gemini-1.5-flash")
            self._initialized = True
            logger.info("Gemini Vision model initialised.")
        except Exception as exc:
            logger.error("Failed to init Gemini Vision: %s", exc)

    async def analyze_image(
        self, image_bytes: bytes, mime_type: str, text: str = "", language: str = "en"
    ) -> str:
        """Send image + optional text to Gemini for visual analysis."""
        if not self._initialized or self._model is None:
            return "Image analysis is not available at this time. Please consult a doctor."

        lang_names = {"en": "English", "hi": "Hindi", "te": "Telugu"}
        lang = lang_names.get(language, "English")

        prompt = (
            f"You are VaidyaAI, a compassionate AI health assistant for rural India. "
            f"Respond in {lang}. "
            f"A patient has shared an image of their symptom. "
            f"Analyse the image and provide:\n"
            f"1. What you observe in the image\n"
            f"2. Possible conditions (NOT diagnoses)\n"
            f"3. Basic first-aid or care suggestions\n"
            f"4. Whether they should see a doctor urgently\n\n"
            f"NEVER diagnose. Always recommend visiting a doctor.\n"
        )
        if text:
            prompt += f"\nPatient also says: {text}"

        try:
            import google.generativeai as genai
            image_part = {"mime_type": mime_type, "data": image_bytes}
            response = await asyncio.to_thread(
                self._model.generate_content, [prompt, image_part]
            )
            return response.text or "Unable to analyze the image. Please consult a doctor."
        except Exception as exc:
            logger.error("Gemini Vision error: %s", exc)
            return "Image analysis failed. Please consult a doctor for proper diagnosis."
