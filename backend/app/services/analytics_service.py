"""
VaidyaAI – Analytics Service.
Thread-safe JSON-file-backed analytics tracking for consultations and emergencies.
"""

import json
import logging
import threading
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)

_DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "analytics_store.json"
_lock = threading.Lock()


def _read_store() -> dict:
    """Read the analytics JSON store (thread-safe)."""
    try:
        with open(_DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"events": []}


def _write_store(data: dict) -> None:
    """Write the analytics JSON store (thread-safe)."""
    _DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


class AnalyticsService:
    """Provides analytics logging and summary computation."""

    # ------------------------------------------------------------------ #
    #  Logging helpers                                                    #
    # ------------------------------------------------------------------ #

    @staticmethod
    def log_consultation(
        symptoms: list[str],
        severity: str,
        language: str,
        is_emergency: bool,
    ) -> None:
        """Append a consultation event to the analytics store."""
        event = {
            "type": "consultation",
            "timestamp": datetime.utcnow().isoformat(),
            "symptoms": symptoms,
            "severity": severity,
            "language": language,
            "is_emergency": is_emergency,
        }
        with _lock:
            store = _read_store()
            store["events"].append(event)
            _write_store(store)

    @staticmethod
    def log_emergency(emergency_type: str | None, language: str) -> None:
        """Append an emergency-check event to the analytics store."""
        event = {
            "type": "emergency_check",
            "timestamp": datetime.utcnow().isoformat(),
            "emergency_type": emergency_type,
            "language": language,
        }
        with _lock:
            store = _read_store()
            store["events"].append(event)
            _write_store(store)

    # ------------------------------------------------------------------ #
    #  Summary computation                                                #
    # ------------------------------------------------------------------ #

    @staticmethod
    def get_summary() -> dict[str, Any]:
        """Compute aggregated analytics metrics from the event log."""
        store = _read_store()
        events = store.get("events", [])

        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())
        month_start = today_start.replace(day=1)

        consultations = [e for e in events if e.get("type") == "consultation"]
        emergency_checks = [e for e in events if e.get("type") == "emergency_check"]

        # Time-filtered counts
        def _count_since(items: list[dict], since: datetime) -> int:
            return sum(
                1 for e in items
                if datetime.fromisoformat(e["timestamp"]) >= since
            )

        consultations_today = _count_since(consultations, today_start)
        consultations_week = _count_since(consultations, week_start)
        consultations_month = _count_since(consultations, month_start)

        # Top 10 symptoms
        all_symptoms: list[str] = []
        for c in consultations:
            all_symptoms.extend(c.get("symptoms", []))
        symptom_counts = Counter(all_symptoms).most_common(10)
        top_symptoms = [{"name": name, "count": count} for name, count in symptom_counts]

        # Severity distribution
        severity_counter = Counter(c.get("severity", "unknown") for c in consultations)
        severity_distribution = {
            "mild": severity_counter.get("mild", 0),
            "moderate": severity_counter.get("moderate", 0),
            "severe": severity_counter.get("severe", 0),
            "emergency": severity_counter.get("emergency", 0),
        }

        # Language usage
        lang_counter = Counter(c.get("language", "en") for c in consultations)
        language_distribution = {
            "en": lang_counter.get("en", 0),
            "hi": lang_counter.get("hi", 0),
            "te": lang_counter.get("te", 0),
        }

        # Emergency alerts count
        emergency_alerts = sum(1 for c in consultations if c.get("is_emergency"))

        # Average symptoms per consultation
        total_symptoms = sum(len(c.get("symptoms", [])) for c in consultations)
        avg_symptoms = round(total_symptoms / max(len(consultations), 1), 1)

        # Peak usage hours (0-23)
        hour_counter: Counter = Counter()
        for c in consultations:
            try:
                hour = datetime.fromisoformat(c["timestamp"]).hour
                hour_counter[hour] += 1
            except (KeyError, ValueError):
                pass
        peak_hours = [
            {"hour": h, "count": cnt}
            for h, cnt in sorted(hour_counter.items())
        ]

        # Daily consultation counts for the last 30 days
        daily_counts: dict[str, int] = {}
        for c in consultations:
            try:
                day = datetime.fromisoformat(c["timestamp"]).strftime("%Y-%m-%d")
                daily_counts[day] = daily_counts.get(day, 0) + 1
            except (KeyError, ValueError):
                pass
        consultations_over_time = [
            {"date": d, "count": cnt}
            for d, cnt in sorted(daily_counts.items())
        ][-30:]

        return {
            "total_consultations": len(consultations),
            "consultations_today": consultations_today,
            "consultations_week": consultations_week,
            "consultations_month": consultations_month,
            "top_symptoms": top_symptoms,
            "severity_distribution": severity_distribution,
            "language_distribution": language_distribution,
            "emergency_alerts": emergency_alerts,
            "avg_symptoms_per_consultation": avg_symptoms,
            "peak_hours": peak_hours,
            "consultations_over_time": consultations_over_time,
            "total_emergency_checks": len(emergency_checks),
        }
