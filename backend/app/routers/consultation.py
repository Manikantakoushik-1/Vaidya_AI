"""
VaidyaAI – Consultation router.
POST /api/consultation — full AI-assisted medical consultation pipeline.
"""

import logging
from fastapi import APIRouter, HTTPException, Request

from app.models.consultation import ConsultationRequest, ConsultationResponse, SymptomInfo
from app.services.symptom_extractor import SymptomExtractor
from app.services.severity_assessor import SeverityAssessor
from app.services.medical_rag import MedicalRAG
from app.services.llm_engine import LLMEngine
from app.services.safety_layer import SafetyLayer
from app.services.analytics_service import AnalyticsService
from app.middleware.rate_limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/consultation", tags=["consultation"])

# Service singletons — instantiated once at module load (not per-request)
_symptom_extractor = SymptomExtractor()
_severity_assessor = SeverityAssessor()
_rag = MedicalRAG()
_llm = LLMEngine()
_safety = SafetyLayer()
_analytics = AnalyticsService()

# Disclaimer text per language
_DISCLAIMERS: dict[str, str] = {
    "en": (
        "⚠️ DISCLAIMER: VaidyaAI is an AI assistant and NOT a substitute for professional medical advice. "
        "Always consult a qualified doctor for diagnosis and treatment."
    ),
    "hi": (
        "⚠️ अस्वीकरण: VaidyaAI एक AI सहायक है और पेशेवर चिकित्सा सलाह का विकल्प नहीं है। "
        "निदान और उपचार के लिए हमेशा किसी योग्य डॉक्टर से परामर्श करें।"
    ),
    "te": (
        "⚠️ నిరాకరణ: VaidyaAI ఒక AI సహాయకుడు మరియు వృత్తిపరమైన వైద్య సలహాకు ప్రత్యామ్నాయం కాదు. "
        "రోగ నిర్ధారణ మరియు చికిత్స కోసం ఎల్లప్పుడూ అర్హత గల వైద్యుడిని సంప్రదించండి."
    ),
}


@router.post(
    "",
    response_model=ConsultationResponse,
    summary="AI medical consultation",
)
@limiter.limit("10/minute")
async def consult(request: Request, body: ConsultationRequest) -> ConsultationResponse:
    """
    Full consultation pipeline:
    1. Extract symptoms from the patient's text.
    2. Assess overall severity (including emergency detection).
    3. Retrieve relevant RAG context from the medical knowledge base.
    4. Generate guidance via Gemini LLM.
    5. Apply safety guardrails before returning the response.
    """
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Consultation text cannot be empty.")

    lang = body.language if body.language in ("en", "hi", "te") else "en"

    try:
        # Step 1 – symptom extraction
        symptoms: list[SymptomInfo] = _symptom_extractor.extract(body.text, lang)

        # Step 2 – severity / emergency assessment
        severity, emergency_type = _severity_assessor.classify(body.text, lang)
        is_emergency = severity == "emergency"

        # Step 3 – RAG context retrieval
        symptom_names = [s.name for s in symptoms]
        rag_context = _rag.get_context(symptom_names, lang)

        # Step 4 – LLM guidance generation
        raw_guidance = await _llm.generate_medical_guidance(
            patient_text=body.text,
            language=lang,
            symptoms=symptom_names,
            severity=severity,
            rag_context=rag_context,
        )

        # Step 5 – safety layer post-processing
        safe_guidance = _safety.apply(
            text=raw_guidance,
            severity=severity,
            language=lang,
        )

        # Build home remedies and when-to-seek-help from RAG data.
        # Provide home remedies for mild and moderate conditions — not for severe/emergency.
        home_remedies = rag_context.get("home_remedies") if severity in ("mild", "moderate") else None
        when_to_seek_help = rag_context.get("when_to_see_doctor")

        disclaimer = _DISCLAIMERS.get(lang, _DISCLAIMERS["en"])

        # Log analytics
        try:
            _analytics.log_consultation(
                symptoms=symptom_names,
                severity=severity,
                language=lang,
                is_emergency=is_emergency,
            )
        except Exception:
            logger.warning("Failed to log analytics for consultation.")

        return ConsultationResponse(
            guidance=safe_guidance,
            symptoms=symptoms,
            severity=severity,
            is_emergency=is_emergency,
            disclaimer=disclaimer,
            language=lang,
            home_remedies=home_remedies,
            when_to_seek_help=when_to_seek_help,
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error during consultation: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again later.",
        )
