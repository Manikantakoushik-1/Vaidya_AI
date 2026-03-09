"""
VaidyaAI – LLM Engine Service.
Integrates with Groq API (Llama 3.3 70B) for fast, high-quality
multilingual medical guidance generation.
Falls back to a rule-based response when the API is unavailable.
"""

import asyncio
import logging
from typing import Any

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are VaidyaAI, a compassionate AI health assistant for rural India.

CRITICAL RULES:
1. You are NOT a doctor. NEVER diagnose diseases.
2. Only provide general health guidance and first-aid advice.
3. ALWAYS recommend visiting a doctor for serious symptoms.
4. For emergencies (chest pain, breathing difficulty, heavy bleeding, unconsciousness),
   IMMEDIATELY tell the patient to call 108 or go to nearest hospital.
5. Respond in the SAME LANGUAGE the patient used (Telugu/Hindi/English).
6. Use simple, easy-to-understand language suitable for rural patients.
7. Be warm, empathetic, and reassuring.
8. Suggest home remedies only for clearly mild conditions (common cold, mild headache).
9. ALWAYS end with: "Please visit your nearest doctor/PHC for proper diagnosis and treatment."
10. If unsure about severity, err on the side of caution and recommend doctor visit.
"""

# Fallback messages when Groq is unavailable
_FALLBACK: dict[str, str] = {
    "en": (
        "I understand you're not feeling well. Based on what you've described, "
        "I recommend you stay hydrated, rest, and monitor your symptoms closely. "
        "If your symptoms worsen or you experience any difficulty breathing, chest pain, "
        "or loss of consciousness, please call 108 immediately.\n\n"
        "Please visit your nearest doctor or Primary Health Centre (PHC) for proper diagnosis and treatment."
    ),
    "hi": (
        "मैं समझता हूँ कि आप अच्छे नहीं हैं। आपके विवरण के आधार पर, "
        "मैं आपको पर्याप्त पानी पीने, आराम करने और अपने लक्षणों पर ध्यान देने की सलाह देता हूँ। "
        "यदि लक्षण बिगड़ें या सांस लेने में कठिनाई, सीने में दर्द हो, तो तुरंत 108 पर कॉल करें।\n\n"
        "कृपया उचित निदान और उपचार के लिए अपने नजदीकी डॉक्टर या PHC जाएं।"
    ),
    "te": (
        "మీకు అనారోగ్యంగా ఉందని అర్థమవుతోంది. మీరు వివరించిన దాని ఆధారంగా, "
        "నీళ్ళు ఎక్కువగా తాగండి, విశ్రాంతి తీసుకోండి మరియు లక్షణాలను గమనించండి. "
        "లక్షణాలు తీవ్రమైతే లేదా శ్వాస తీసుకోవడం కష్టమైతే వెంటనే 108కు కాల్ చేయండి.\n\n"
        "సరైన రోగ నిర్ధారణ మరియు చికిత్స కోసం సమీప వైద్యుడు లేదా PHCని సందర్శించండి."
    ),
}


class LLMEngine:
    """Async wrapper around the Groq API using Llama 3.3 70B."""

    _MAX_RETRIES = 3
    _BASE_DELAY = 1.0  # seconds
    _MODEL = "llama-3.3-70b-versatile"  # Fast, multilingual, high-quality

    def __init__(self) -> None:
        self._client: Any = None
        self._initialized = False
        self._init_groq()

    def _init_groq(self) -> None:
        """Initialise the Groq client. Logs a warning if the key is absent."""
        try:
            from app.config import get_settings
            settings = get_settings()

            if not settings.groq_configured:
                logger.warning("GROQ_API_KEY not set — using fallback responses.")
                return

            from groq import Groq
            self._client = Groq(api_key=settings.GROQ_API_KEY)
            self._initialized = True
            logger.info("Groq client initialised successfully (model: %s).", self._MODEL)
        except ImportError:
            logger.warning("groq package not installed — using fallback responses.")
        except Exception as exc:
            logger.error("Failed to initialise Groq: %s", exc)

    async def generate_medical_guidance(
        self,
        patient_text: str,
        language: str = "en",
        symptoms: list[str] | None = None,
        severity: str = "moderate",
        rag_context: dict | None = None,
    ) -> str:
        """
        Generate medical guidance using Groq + Llama 3.3 70B.

        Falls back to a canned response if:
        - API key is missing
        - Rate limit is hit after retries
        - Any other API error occurs
        """
        if not self._initialized or self._client is None:
            return _FALLBACK.get(language, _FALLBACK["en"])

        prompt = self._build_prompt(patient_text, language, symptoms, severity, rag_context)

        for attempt in range(self._MAX_RETRIES):
            try:
                # Run synchronous Groq call in thread pool
                response = await asyncio.to_thread(
                    self._client.chat.completions.create,
                    model=self._MODEL,
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.7,
                    max_tokens=1024,
                    top_p=0.9,
                )
                text = response.choices[0].message.content
                return text or _FALLBACK.get(language, _FALLBACK["en"])

            except Exception as exc:
                error_str = str(exc).lower()
                is_rate_limit = "rate" in error_str or "429" in error_str or "quota" in error_str

                if is_rate_limit and attempt < self._MAX_RETRIES - 1:
                    delay = self._BASE_DELAY * (2 ** attempt)
                    logger.warning("Groq rate limit hit, retrying in %.1fs (attempt %d)…", delay, attempt + 1)
                    await asyncio.sleep(delay)
                    continue

                logger.error("Groq API error on attempt %d: %s", attempt + 1, exc)
                break

        return _FALLBACK.get(language, _FALLBACK["en"])

    # ------------------------------------------------------------------

    def _build_prompt(
        self,
        patient_text: str,
        language: str,
        symptoms: list[str] | None,
        severity: str,
        rag_context: dict | None,
    ) -> str:
        """Compose the full user-turn prompt sent to Groq."""
        lang_names = {"en": "English", "hi": "Hindi", "te": "Telugu"}
        lang_name = lang_names.get(language, "English")

        parts: list[str] = [
            f"Language: {lang_name}",
            f"Severity assessment: {severity}",
        ]

        if symptoms:
            parts.append(f"Identified symptoms: {', '.join(symptoms)}")

        if rag_context:
            if rag_context.get("condition_name"):
                parts.append(f"Possible related condition: {rag_context['condition_name']}")
            if rag_context.get("guidance"):
                parts.append(f"Knowledge base guidance: {rag_context['guidance']}")
            if rag_context.get("when_to_see_doctor"):
                parts.append(f"When to see doctor: {rag_context['when_to_see_doctor']}")
            if rag_context.get("emergency_signs"):
                parts.append(f"Emergency signs to watch for: {', '.join(rag_context['emergency_signs'])}")
            if rag_context.get("conversation_history"):
                parts.append(f"\nPrevious conversation:\n{rag_context['conversation_history']}")

        parts.append(f"\nPatient says: {patient_text}")
        parts.append(
            f"\nPlease provide compassionate health guidance in {lang_name}. "
            "Remember you are NOT a doctor and must not diagnose. "
            "Keep the response concise and easy to understand for a rural patient."
        )

        return "\n".join(parts)
