"""
VaidyaAI – Emergency detection router.
POST /api/emergency/check — classifies whether a patient's description is a medical emergency.
"""

from fastapi import APIRouter, HTTPException, Request
from app.models.emergency import EmergencyCheckRequest, EmergencyCheckResponse
from app.services.severity_assessor import SeverityAssessor
from app.services.analytics_service import AnalyticsService
from app.middleware.rate_limiter import limiter

router = APIRouter(prefix="/api/emergency", tags=["emergency"])

_assessor = SeverityAssessor()
_analytics = AnalyticsService()


@router.post(
    "/check",
    response_model=EmergencyCheckResponse,
    summary="Check for medical emergency",
)
@limiter.limit("20/minute")
async def check_emergency(request: Request, body: EmergencyCheckRequest) -> EmergencyCheckResponse:
    """
    Analyse the patient's description and return whether it constitutes an emergency.

    Responds with the appropriate helpline number (108 in India) and an
    actionable message in the patient's language.
    """
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    severity, emergency_type = _assessor.classify(body.text, body.language)
    is_emergency = severity == "emergency"

    if is_emergency:
        messages = {
            "en": (
                "⚠️ This sounds like a medical emergency! "
                "Please call 108 immediately or go to the nearest hospital right away."
            ),
            "hi": (
                "⚠️ यह एक चिकित्सा आपातकाल लग रहा है! "
                "कृपया तुरंत 108 पर कॉल करें या निकटतम अस्पताल जाएं।"
            ),
            "te": (
                "⚠️ ఇది వైద్య అత్యవసర పరిస్థితి లా కనిపిస్తోంది! "
                "దయచేసి వెంటనే 108కు కాల్ చేయండి లేదా సమీప ఆసుపత్రికి వెళ్ళండి."
            ),
        }
        message = messages.get(body.language, messages["en"])
    else:
        messages = {
            "en": "No immediate emergency detected. Please monitor symptoms and consult a doctor if they worsen.",
            "hi": "तत्काल आपातकाल नहीं पाया गया। लक्षणों की निगरानी करें और बिगड़ने पर डॉक्टर से मिलें।",
            "te": "తక్షణ అత్యవసరం గుర్తించబడలేదు. లక్షణాలను గమనించండి, అవి తీవ్రమైతే వైద్యుడిని సంప్రదించండి.",
        }
        message = messages.get(request.language, messages["en"])

    # Log analytics
    try:
        _analytics.log_emergency(
            emergency_type=emergency_type if is_emergency else None,
            language=body.language,
        )
    except Exception:
        pass

    return EmergencyCheckResponse(
        is_emergency=is_emergency,
        emergency_type=emergency_type if is_emergency else None,
        message=message,
        call_number="108",
    )
