"""
VaidyaAI – Medical RAG (Retrieval-Augmented Generation) Service.
Loads the medical knowledge base from medical_knowledge.json and retrieves
relevant context to augment LLM prompts, improving accuracy and grounding.
"""

import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_DATA_DIR = Path(__file__).parent.parent / "data"

# Fields we include in the context dict returned to the LLM
_GUIDANCE_FIELD_MAP = {
    "en": "guidance_en",
    "hi": "guidance_hi",
    "te": "guidance_te",
}


class MedicalRAG:
    """
    Simple keyword-matching RAG over the medical_knowledge.json knowledge base.
    In production this could be replaced with a vector-store embedding search.
    """

    def __init__(self) -> None:
        self._knowledge: list[dict] = self._load_knowledge()
        # Build an inverted index: symptom keyword → list of knowledge entries
        self._index: dict[str, list[dict]] = self._build_index()

    def _load_knowledge(self) -> list[dict]:
        path = _DATA_DIR / "medical_knowledge.json"
        if not path.exists():
            logger.warning("medical_knowledge.json not found — RAG context will be empty.")
            return []
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            logger.error("Failed to load medical_knowledge.json: %s", exc)
            return []

    def _build_index(self) -> dict[str, list[dict]]:
        index: dict[str, list[dict]] = {}
        for entry in self._knowledge:
            # Use .get() with fallback so missing 'id' doesn't raise KeyError
            if not entry.get("id"):
                entry.setdefault("id", entry.get("name_en", "unknown"))
            for symptom in entry.get("symptoms", []):
                key = symptom.lower().strip()
                index.setdefault(key, []).append(entry)
        return index

    def get_context(self, symptoms: list[str], language: str = "en") -> dict:
        """
        Retrieve the most relevant knowledge-base entry for the given symptom list.

        Returns a dict with keys:
          - condition_name: str
          - guidance: str  (in the requested language)
          - home_remedies: list[str] | None
          - when_to_see_doctor: str | None
          - emergency_signs: list[str]
          - severity: str
        """
        if not symptoms:
            return {}

        # Score entries by how many queried symptoms they match
        scores: dict[str, tuple[int, dict]] = {}
        for symptom in symptoms:
            lower = symptom.lower().strip()
            # Direct index lookup
            for entry in self._index.get(lower, []):
                entry_id = entry["id"]
                count, _ = scores.get(entry_id, (0, entry))
                scores[entry_id] = (count + 1, entry)
            # Partial-match fallback
            for kw, entries in self._index.items():
                if lower in kw or kw in lower:
                    for entry in entries:
                        entry_id = entry["id"]
                        count, _ = scores.get(entry_id, (0, entry))
                        scores[entry_id] = (count + 1, entry)

        if not scores:
            return {}

        # Pick the highest-scoring entry
        best_entry = max(scores.values(), key=lambda x: x[0])[1]

        guidance_field = _GUIDANCE_FIELD_MAP.get(language, "guidance_en")
        name_field = f"name_{language}" if f"name_{language}" in best_entry else "name_en"

        return {
            "condition_name": best_entry.get(name_field, best_entry.get("name_en", "")),
            "guidance": best_entry.get(guidance_field, best_entry.get("guidance_en", "")),
            "home_remedies": best_entry.get("home_remedies"),
            "when_to_see_doctor": best_entry.get("when_to_see_doctor"),
            "emergency_signs": best_entry.get("emergency_signs", []),
            "severity": best_entry.get("severity", "moderate"),
        }
