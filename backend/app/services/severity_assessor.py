"""
VaidyaAI – Severity Assessor Service.
Classifies patient text into one of four severity tiers:
  emergency → immediate life threat (call 108)
  severe    → needs urgent doctor visit today
  moderate  → needs doctor within 1–2 days
  mild      → can be managed at home
"""

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_DATA_DIR = Path(__file__).parent.parent / "data"


class SeverityAssessor:
    """
    Keyword-based severity classifier supporting English, Hindi, and Telugu.
    Uses the emergency_keywords.json data file for keyword lists.
    """

    # Inline fallback keywords if the data file is missing
    _FALLBACK_EMERGENCY_KEYWORDS: dict[str, list[str]] = {
        "en": ["chest pain", "can't breathe", "unconscious", "heavy bleeding", "heart attack",
               "stroke", "seizure", "snake bite", "not breathing"],
        "hi": ["सीने में दर्द", "सांस नहीं", "बेहोश", "भारी रक्तस्राव", "दिल का दौरा"],
        "te": ["గుండె నొప్పి", "శ్వాస తీసుకోలేకపోతున్నాను", "అపస్మారం", "పాము కాటు"],
    }

    _SEVERE_KEYWORDS: dict[str, list[str]] = {
        "en": ["high fever", "very high fever", "severe pain", "can't walk", "difficulty breathing",
               "vomiting blood", "blood in urine", "blood in stool", "severe headache",
               "loss of vision", "loss of consciousness", "paralysis", "cannot speak"],
        "hi": ["तेज बुखार", "गंभीर दर्द", "खून की उल्टी", "उच्च बुखार", "चलने में असमर्थ"],
        "te": ["తీవ్రమైన నొప్పి", "అధిక జ్వరం", "రక్తం వాంతి", "చలించలేకపోతున్నాను"],
    }

    _MODERATE_KEYWORDS: dict[str, list[str]] = {
        "en": ["fever", "persistent cough", "diarrhea", "vomiting", "rash", "body pain",
               "headache", "ear pain", "eye infection", "urinary pain", "joint pain", "stomach pain"],
        "hi": ["बुखार", "दस्त", "उल्टी", "खांसी", "दाने", "शरीर में दर्द", "सिरदर्द"],
        "te": ["జ్వరం", "విరేచనాలు", "వాంతులు", "దగ్గు", "దద్దుర్లు", "శరీర నొప్పి"],
    }

    # Map emergency types to keyword groups
    _EMERGENCY_TYPES: dict[str, list[str]] = {
        "cardiac": ["chest pain", "heart attack", "heart", "cardiac", "सीने में दर्द",
                    "दिल का दौरा", "గుండె నొప్పి", "హార్ట్ అటాక్"],
        "respiratory": ["can't breathe", "difficulty breathing", "not breathing", "choke",
                        "सांस नहीं", "श्वास", "శ్వాస తీసుకోలేకపోతున్నాను"],
        "neurological": ["unconscious", "seizure", "stroke", "paralysis", "बेहोश",
                         "दौरा", "लकवा", "అపస్మారం", "పక్షవాతం"],
        "trauma": ["heavy bleeding", "severe accident", "fracture", "भारी रक्तस्राव",
                   "गंभीर दुर्घटना", "తీవ్రమైన రక్తస్రావం"],
        "poisoning": ["poisoning", "snake bite", "dog bite", "scorpion", "विषाक्तता",
                      "सांप का काटना", "పాము కాటు", "విషం"],
    }

    def __init__(self) -> None:
        self._emergency_keywords = self._load_emergency_keywords()

    def _load_emergency_keywords(self) -> dict[str, list[str]]:
        """Load keywords from emergency_keywords.json, falling back to inline defaults."""
        path = _DATA_DIR / "emergency_keywords.json"
        if path.exists():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                merged: dict[str, list[str]] = {}
                for lang, groups in data.items():
                    if isinstance(groups, dict):
                        # Flatten all keyword groups into one list per language
                        all_kws: list[str] = []
                        for kws in groups.values():
                            if isinstance(kws, list):
                                all_kws.extend(kws)
                        merged[lang] = [kw.lower() for kw in all_kws]
                    elif isinstance(groups, list):
                        merged[lang] = [kw.lower() for kw in groups]
                return merged
            except Exception as exc:
                logger.warning("Could not load emergency_keywords.json: %s", exc)
        return {k: [kw.lower() for kw in v] for k, v in self._FALLBACK_EMERGENCY_KEYWORDS.items()}

    def classify(self, text: str, language: str = "en") -> tuple[str, str | None]:
        """
        Classify *text* into a severity level.

        Returns:
            (severity, emergency_type) — emergency_type is None unless severity == 'emergency'.
        """
        lower = text.lower()

        # 1. Check emergency keywords (all languages simultaneously)
        for lang_kws in self._emergency_keywords.values():
            for kw in lang_kws:
                if kw in lower:
                    emergency_type = self._detect_emergency_type(lower)
                    return "emergency", emergency_type

        # 2. Check severe keywords
        for lang_kws in self._SEVERE_KEYWORDS.values():
            for kw in lang_kws:
                if kw in lower:
                    return "severe", None

        # 3. Check moderate keywords
        for lang_kws in self._MODERATE_KEYWORDS.values():
            for kw in lang_kws:
                if kw in lower:
                    return "moderate", None

        # Default — mild
        return "mild", None

    def _detect_emergency_type(self, lower_text: str) -> str:
        """Return the most likely emergency category."""
        for etype, keywords in self._EMERGENCY_TYPES.items():
            for kw in keywords:
                if kw.lower() in lower_text:
                    return etype
        return "general"
