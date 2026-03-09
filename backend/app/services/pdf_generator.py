"""
VaidyaAI – PDF Report Generator.
Creates downloadable health summary PDFs from consultation data.
"""

import io
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def generate_consultation_pdf(
    guidance: str,
    symptoms: list[dict],
    severity: str,
    language: str,
    home_remedies: list[str] | None = None,
    when_to_seek_help: str | None = None,
    patient_text: str = "",
) -> bytes:
    """Generate a PDF health report and return as bytes."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.colors import HexColor
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.units import inch
    except ImportError:
        logger.error("reportlab not installed — cannot generate PDF")
        raise

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle", parent=styles["Title"],
        textColor=HexColor("#0D9488"), fontSize=22, spaceAfter=20,
    )
    heading_style = ParagraphStyle(
        "CustomHeading", parent=styles["Heading2"],
        textColor=HexColor("#0F766E"), fontSize=14, spaceBefore=15, spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "CustomBody", parent=styles["Normal"],
        fontSize=11, leading=16, spaceAfter=6,
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer", parent=styles["Normal"],
        textColor=HexColor("#DC2626"), fontSize=9, leading=12, spaceBefore=20,
    )

    elements = []

    # Header
    elements.append(Paragraph("🩺 VaidyaAI Health Report", title_style))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%d %B %Y, %I:%M %p')}", body_style))
    elements.append(Spacer(1, 15))

    # Patient symptoms text
    if patient_text:
        elements.append(Paragraph("Patient Description", heading_style))
        elements.append(Paragraph(patient_text, body_style))

    # Severity
    severity_colors = {"mild": "#16A34A", "moderate": "#D97706", "severe": "#EA580C", "emergency": "#DC2626"}
    color = severity_colors.get(severity, "#64748B")
    elements.append(Paragraph("Severity Assessment", heading_style))
    elements.append(Paragraph(
        f'<font color="{color}"><b>{severity.upper()}</b></font>', body_style
    ))

    # Symptoms table
    if symptoms:
        elements.append(Paragraph("Identified Symptoms", heading_style))
        table_data = [["Symptom", "Severity"]]
        for s in symptoms:
            table_data.append([s.get("name", ""), s.get("severity", "")])
        table = Table(table_data, colWidths=[3.5 * inch, 2 * inch])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#0D9488")),
            ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#FFFFFF")),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#E5E7EB")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#F0FDFA"), HexColor("#FFFFFF")]),
            ("PADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(table)

    # Guidance
    elements.append(Paragraph("Health Guidance", heading_style))
    for line in guidance.split("\n"):
        if line.strip():
            elements.append(Paragraph(line.strip(), body_style))

    # Home remedies
    if home_remedies:
        elements.append(Paragraph("Home Remedies", heading_style))
        for remedy in home_remedies:
            elements.append(Paragraph(f"• {remedy}", body_style))

    # When to seek help
    if when_to_seek_help:
        elements.append(Paragraph("When to Seek Medical Help", heading_style))
        elements.append(Paragraph(when_to_seek_help, body_style))

    # Disclaimer
    elements.append(Paragraph(
        "⚠️ DISCLAIMER: VaidyaAI is an AI assistant and NOT a substitute for professional medical advice. "
        "Always consult a qualified doctor for diagnosis and treatment. This report is for informational purposes only.",
        disclaimer_style,
    ))

    doc.build(elements)
    return buffer.getvalue()
