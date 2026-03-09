"""
VaidyaAI – Report router.
POST /api/report/generate — generates and returns a PDF health report.
"""

import logging
from fastapi import APIRouter, Request
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import List, Optional
from app.services.pdf_generator import generate_consultation_pdf
from app.middleware.rate_limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/report", tags=["report"])


class ReportRequest(BaseModel):
    """Request body for PDF report generation."""
    guidance: str = Field(..., description="AI guidance text")
    symptoms: List[dict] = Field(default_factory=list)
    severity: str = Field(default="moderate")
    language: str = Field(default="en")
    home_remedies: Optional[List[str]] = None
    when_to_seek_help: Optional[str] = None
    patient_text: str = Field(default="", description="Original patient description")


@router.post("/generate", summary="Generate PDF health report")
@limiter.limit("10/minute")
async def generate_report(request: Request, body: ReportRequest) -> Response:
    """Generate a PDF health report from consultation data."""
    try:
        pdf_bytes = generate_consultation_pdf(
            guidance=body.guidance,
            symptoms=body.symptoms,
            severity=body.severity,
            language=body.language,
            home_remedies=body.home_remedies,
            when_to_seek_help=body.when_to_seek_help,
            patient_text=body.patient_text,
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=VaidyaAI_Health_Report.pdf"},
        )
    except Exception as exc:
        logger.exception("PDF generation failed: %s", exc)
        return Response(content="PDF generation failed", status_code=500)
