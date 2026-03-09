"""
VaidyaAI – Chat router.
POST /api/chat — text-based chat consultation with multi-turn support.
"""

import logging
import uuid
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from app.services.llm_engine import LLMEngine
from app.services.symptom_extractor import SymptomExtractor
from app.services.severity_assessor import SeverityAssessor
from app.services.conversation import conversation_manager
from app.services.analytics_service import AnalyticsService
from app.middleware.rate_limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])

_llm = LLMEngine()
_extractor = SymptomExtractor()
_assessor = SeverityAssessor()
_analytics = AnalyticsService()


class ChatRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    language: str = Field(default="en")
    session_id: Optional[str] = Field(default=None)


class ChatResponse(BaseModel):
    message: str
    session_id: str
    symptoms: List[dict] = []
    severity: str = "moderate"
    is_emergency: bool = False


@router.post("", response_model=ChatResponse, summary="Text chat consultation")
@limiter.limit("15/minute")
async def chat(request: Request, body: ChatRequest) -> ChatResponse:
    """Multi-turn text chat with AI health assistant."""
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    lang = body.language if body.language in ("en", "hi", "te") else "en"
    session_id = body.session_id or str(uuid.uuid4())

    # Get conversation history
    history = conversation_manager.get_history(session_id)

    # Extract symptoms and severity
    symptoms = _extractor.extract(body.text, lang)
    severity, emergency_type = _assessor.classify(body.text, lang)
    is_emergency = severity == "emergency"
    symptom_names = [s.name for s in symptoms]

    # Build context with history
    history_context = ""
    if history:
        history_lines = []
        for turn in history[-5:]:  # Last 5 turns
            history_lines.append(f"Patient: {turn['user']}")
            history_lines.append(f"VaidyaAI: {turn['assistant'][:200]}...")
        history_context = "\n".join(history_lines)

    try:
        guidance = await _llm.generate_medical_guidance(
            patient_text=body.text,
            language=lang,
            symptoms=symptom_names,
            severity=severity,
            rag_context={"conversation_history": history_context} if history_context else None,
        )

        # Save turn
        conversation_manager.add_turn(
            session_id=session_id,
            user_text=body.text,
            ai_response=guidance,
            symptoms=symptom_names,
            severity=severity,
        )

        # Log analytics
        try:
            _analytics.log_consultation(
                symptoms=symptom_names,
                severity=severity,
                language=lang,
                is_emergency=is_emergency,
            )
        except Exception:
            pass

        return ChatResponse(
            message=guidance,
            session_id=session_id,
            symptoms=[{"name": s.name, "severity": s.severity} for s in symptoms],
            severity=severity,
            is_emergency=is_emergency,
        )
    except Exception as exc:
        logger.exception("Chat error: %s", exc)
        raise HTTPException(status_code=500, detail="An error occurred. Please try again.")
