"""
VaidyaAI – Symptom Extractor Service.
Extracts structured SymptomInfo objects from free-form patient text in
English, Hindi, and Telugu using a keyword/dictionary approach.
"""

import json
import logging
from pathlib import Path
from app.models.consultation import SymptomInfo

logger = logging.getLogger(__name__)

_DATA_DIR = Path(__file__).parent.parent / "data"

# Built-in symptom dictionary — entries are (canonical_name, severity, keyword_variants)
_BUILTIN_SYMPTOMS: list[tuple[str, str, list[str]]] = [
    # (canonical_name, severity, [keywords in en/hi/te])
    ("chest pain", "emergency", ["chest pain", "सीने में दर्द", "గుండె నొప్పి", "chest tightness", "heart pain"]),
    ("difficulty breathing", "emergency", ["can't breathe", "difficulty breathing", "shortness of breath",
                                            "breathlessness", "सांस नहीं आ रही", "శ్వాస ఇబ్బంది"]),
    ("unconsciousness", "emergency", ["unconscious", "fainted", "passed out", "बेहोश", "అపస్మారం"]),
    ("heavy bleeding", "emergency", ["heavy bleeding", "lot of blood", "भारी रक्तस्राव", "తీవ్రమైన రక్తస్రావం"]),
    ("seizure", "emergency", ["seizure", "fits", "convulsion", "दौरा", "మూర్ఛ"]),
    ("stroke symptoms", "emergency", ["stroke", "facial droop", "arm weakness", "slurred speech",
                                       "लकवा", "पक्षाघात", "పక్షవాతం"]),
    ("snake bite", "emergency", ["snake bite", "snakebite", "सांप का काटना", "పాము కాటు"]),
    ("high fever", "severe", ["high fever", "very high temperature", "तेज बुखार", "అధిక జ్వరం", "104", "105"]),
    ("severe headache", "severe", ["severe headache", "worst headache", "गंभीर सिरदर्द", "తీవ్రమైన తలనొప్పి"]),
    ("vomiting blood", "severe", ["vomiting blood", "blood in vomit", "खून की उल्टी", "రక్తం వాంతి"]),
    ("blood in stool", "severe", ["blood in stool", "bloody stool", "मल में खून", "మలంలో రక్తం"]),
    ("blood in urine", "severe", ["blood in urine", "urine blood", "मूत्र में खून", "మూత్రంలో రక్తం"]),
    ("severe abdominal pain", "severe", ["severe abdominal pain", "severe stomach pain",
                                          "पेट में तेज दर्द", "తీవ్రమైన కడుపు నొప్పి"]),
    ("fever", "moderate", ["fever", "temperature", "बुखार", "జ్వరం", "pyrexia"]),
    ("cough", "moderate", ["cough", "coughing", "खांसी", "దగ్గు"]),
    ("cold", "mild", ["cold", "runny nose", "sneezing", "जुकाम", "सर्दी", "జలుబు", "నాసిక స్రావం"]),
    ("headache", "moderate", ["headache", "head ache", "सिरदर्द", "తలనొప్పి"]),
    ("body pain", "moderate", ["body pain", "body ache", "muscle pain", "शरीर में दर्द", "శరీర నొప్పి"]),
    ("vomiting", "moderate", ["vomiting", "nausea", "feeling sick", "उल्टी", "వాంతి", "మతిలు"]),
    ("diarrhea", "moderate", ["diarrhea", "loose motions", "loose stool", "दस्त", "విరేచనాలు"]),
    ("stomach pain", "moderate", ["stomach pain", "abdominal pain", "stomach ache", "पेट दर्द", "కడుపు నొప్పి"]),
    ("acidity", "mild", ["acidity", "heartburn", "acid reflux", "एसिडिटी", "ఆమ్లత"]),
    ("sore throat", "mild", ["sore throat", "throat pain", "गले में दर्द", "గొంతు నొప్పి"]),
    ("skin rash", "moderate", ["rash", "itching", "skin rash", "दाने", "खुजली", "దద్దుర్లు", "దురద"]),
    ("joint pain", "moderate", ["joint pain", "जोड़ों में दर्द", "కీళ్ళ నొప్పి"]),
    ("back pain", "moderate", ["back pain", "पीठ दर्द", "వెన్నునొప్పి"]),
    ("dizziness", "moderate", ["dizziness", "dizzy", "vertigo", "चक्कर", "తలతిరగడం"]),
    ("weakness", "moderate", ["weakness", "fatigue", "tired", "कमज़ोरी", "బలహీనత"]),
    ("dehydration", "moderate", ["dehydration", "very thirsty", "dry mouth", "निर्जलीकरण", "నిర్జలీకరణం"]),
    ("burns", "severe", ["burn", "burns", "जलना", "కాలిన గాయాలు"]),
    ("wound", "moderate", ["wound", "cut", "injury", "घाव", "గాయం"]),
    ("eye pain", "moderate", ["eye pain", "eye infection", "आँख में दर्द", "కంటి నొప్పి"]),
    ("ear pain", "moderate", ["ear pain", "earache", "कान में दर्द", "చెవి నొప్పి"]),
    ("urinary pain", "moderate", ["urinary pain", "burning urination", "पेशाब में जलन", "మూత్ర నొప్పి"]),
    ("diabetes symptoms", "moderate", ["diabetes", "sugar", "excessive thirst", "मधुमेह", "మధుమేహం"]),
    ("hypertension", "moderate", ["high blood pressure", "hypertension", "उच्च रक्तचाप", "అధిక రక్తపోటు"]),
    ("anxiety", "mild", ["anxiety", "stress", "panic", "चिंता", "ఆందోళన"]),
    ("sleep issues", "mild", ["sleep problem", "insomnia", "नींद नहीं", "నిద్ర సమస్య"]),
    ("asthma", "severe", ["asthma", "wheezing", "अस्थमा", "ఆస్తమా", "दमा"]),
    ("dog bite", "severe", ["dog bite", "कुत्ते का काटना", "కుక్క కాటు"]),
    ("insect bite", "moderate", ["insect bite", "bee sting", "कीड़े का काटना", "కీటక కాటు"]),
    ("pregnancy symptoms", "moderate", ["pregnancy", "pregnant", "गर्भावस्था", "గర్భం"]),
    ("menstrual issues", "moderate", ["menstrual pain", "period pain", "irregular periods",
                                       "मासिक धर्म", "ఋతు సమస్య"]),
]


class SymptomExtractor:
    """Extracts a list of SymptomInfo from free-form patient text."""

    def __init__(self) -> None:
        self._symptoms = self._load_symptoms()

    def _load_symptoms(self) -> list[tuple[str, str, list[str]]]:
        """Load symptoms from symptoms_database.json and merge with built-ins."""
        symptoms = list(_BUILTIN_SYMPTOMS)  # start with built-ins
        path = _DATA_DIR / "symptoms_database.json"
        if path.exists():
            try:
                data: dict = json.loads(path.read_text(encoding="utf-8"))
                for canonical, info in data.items():
                    severity = info.get("severity", "moderate")
                    aliases = info.get("aliases", [])
                    symptoms.append((canonical, severity, [canonical] + aliases))
            except Exception as exc:
                logger.warning("Could not load symptoms_database.json: %s", exc)
        return symptoms

    def extract(self, text: str, language: str = "en") -> list[SymptomInfo]:
        """
        Return a deduplicated list of SymptomInfo found in *text*.
        All three language keyword sets are checked regardless of *language*.
        """
        lower = text.lower()
        found: list[SymptomInfo] = []
        seen: set[str] = set()

        for canonical, severity, keywords in self._symptoms:
            if canonical in seen:
                continue
            for kw in keywords:
                if kw.lower() in lower:
                    found.append(SymptomInfo(name=canonical, severity=severity))
                    seen.add(canonical)
                    break

        if not found:
            # Fallback: treat entire input as a single unnamed symptom
            found.append(SymptomInfo(name="unspecified symptom", severity="moderate"))

        return found
