"""
VaidyaAI – Safety Layer Service.
Applies medical safety guardrails to LLM-generated responses:
- Strips any definitive diagnostic statements.
- Ensures emergency escalation language is present when severity requires it.
- Appends appropriate multi-language disclaimers.
"""

import re
import logging

logger = logging.getLogger(__name__)

# Patterns that could imply a definitive diagnosis — replace with cautious phrasing
_DIAGNOSTIC_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\byou have\b", re.IGNORECASE), "you may have"),
    (re.compile(r"\byou are suffering from\b", re.IGNORECASE), "you may be experiencing"),
    (re.compile(r"\bdiagnosed with\b", re.IGNORECASE), "possibly related to"),
    (re.compile(r"\bthis is definitely\b", re.IGNORECASE), "this could be"),
    (re.compile(r"\bthis is certainly\b", re.IGNORECASE), "this might be"),
    (re.compile(r"\bit is confirmed\b", re.IGNORECASE), "it is possible"),
    (re.compile(r"\bआपको .{0,30} है\b"), "आपको शायद संबंधित समस्या हो सकती है"),
]

# Emergency escalation phrases appended when severity is emergency
_EMERGENCY_APPENDS: dict[str, str] = {
    "en": "\n\n🚨 EMERGENCY: Please call 108 immediately or go to the nearest hospital right now!",
    "hi": "\n\n🚨 आपातकाल: कृपया तुरंत 108 पर कॉल करें या अभी नजदीकी अस्पताल जाएं!",
    "te": "\n\n🚨 అత్యవసరం: దయచేసి వెంటనే 108కు కాల్ చేయండి లేదా ఇప్పుడే సమీప ఆసుపత్రికి వెళ్ళండి!",
}

# Closing reminder appended to every non-empty response
_CLOSING_REMINDER: dict[str, str] = {
    "en": "\n\nPlease visit your nearest doctor or Primary Health Centre (PHC) for proper diagnosis and treatment.",
    "hi": "\n\nकृपया उचित निदान और उपचार के लिए अपने नजदीकी डॉक्टर या प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं।",
    "te": "\n\nదయచేసి సరైన రోగ నిర్ధారణ మరియు చికిత్స కోసం మీ సమీప వైద్యుడు లేదా ప్రాథమిక ఆరోగ్య కేంద్రాన్ని (PHC) సందర్శించండి.",
}


class SafetyLayer:
    """Post-processes LLM output to enforce medical safety standards."""

    def apply(self, text: str, severity: str, language: str = "en") -> str:
        """
        Apply all safety guardrails to *text* and return the cleaned version.

        Args:
            text:     Raw LLM-generated guidance.
            severity: One of "mild" | "moderate" | "severe" | "emergency".
            language: Response language code ("en" | "hi" | "te").
        """
        if not text:
            return self._fallback(language)

        processed = self._remove_diagnostic_statements(text)
        processed = self._ensure_emergency_escalation(processed, severity, language)
        processed = self._append_closing_reminder(processed, language)
        return processed

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _remove_diagnostic_statements(self, text: str) -> str:
        """Replace language that implies a definitive diagnosis with cautious phrasing."""
        for pattern, replacement in _DIAGNOSTIC_PATTERNS:
            text = pattern.sub(replacement, text)
        return text

    def _ensure_emergency_escalation(self, text: str, severity: str, language: str) -> str:
        """Prepend an emergency call-to-action when severity is 'emergency'."""
        if severity == "emergency":
            emergency_msg = _EMERGENCY_APPENDS.get(language, _EMERGENCY_APPENDS["en"])
            # Avoid duplicating if the LLM already included 108 reference
            if "108" not in text:
                text = emergency_msg.strip() + "\n\n" + text
        return text

    def _append_closing_reminder(self, text: str, language: str) -> str:
        """Always close with a reminder to visit a doctor (unless already present)."""
        reminder = _CLOSING_REMINDER.get(language, _CLOSING_REMINDER["en"])
        keywords = {"PHC", "doctor", "डॉक्टर", "వైద్యుడు", "अस्पताल", "ఆసుపత్రి"}
        already_present = any(kw in text for kw in keywords)
        if not already_present:
            text = text.rstrip() + reminder
        return text

    def _fallback(self, language: str) -> str:
        """Return a safe fallback message when LLM output is empty."""
        fallbacks = {
            "en": (
                "I'm sorry, I couldn't generate a proper response right now. "
                "Please consult your nearest doctor or call 104 (health helpline)."
            ),
            "hi": (
                "मुझे खेद है, मैं अभी उचित प्रतिक्रिया नहीं दे सका। "
                "कृपया अपने नजदीकी डॉक्टर से परामर्श करें या 104 (स्वास्थ्य हेल्पलाइन) पर कॉल करें।"
            ),
            "te": (
                "క్షమించండి, నేను ఇప్పుడు సరైన స్పందన ఇవ్వలేకపోయాను. "
                "దయచేసి మీ సమీప వైద్యుడిని సంప్రదించండి లేదా 104 (ఆరోగ్య హెల్ప్‌లైన్) కు కాల్ చేయండి."
            ),
        }
        return fallbacks.get(language, fallbacks["en"])
