"""
VaidyaAI – Hospital Finder Service.
Finds the nearest public health facilities from the hospitals_india.json dataset
using the Haversine great-circle distance formula.
"""

import json
import math
import logging
from pathlib import Path
from app.models.hospital import Hospital

logger = logging.getLogger(__name__)

_DATA_DIR = Path(__file__).parent.parent / "data"
_EARTH_RADIUS_KM = 6371.0


def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return the great-circle distance (km) between two GPS coordinates."""
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    return _EARTH_RADIUS_KM * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class HospitalFinder:
    """Loads the hospital dataset once and answers nearest-hospital queries."""

    def __init__(self) -> None:
        self._hospitals: list[dict] = self._load_hospitals()

    def _load_hospitals(self) -> list[dict]:
        path = _DATA_DIR / "hospitals_india.json"
        if not path.exists():
            logger.warning("hospitals_india.json not found — hospital lookup will return empty results.")
            return []
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            logger.error("Failed to load hospitals_india.json: %s", exc)
            return []

    def find_nearest(self, lat: float, lng: float, limit: int = 10) -> list[Hospital]:
        """
        Return up to *limit* hospitals sorted by ascending distance from (lat, lng).
        Each returned Hospital has the distance_km field populated.
        """
        scored: list[tuple[float, dict]] = []
        for h in self._hospitals:
            try:
                dist = _haversine(lat, lng, float(h["lat"]), float(h["lng"]))
                scored.append((dist, h))
            except (KeyError, ValueError, TypeError):
                continue

        scored.sort(key=lambda x: x[0])

        results: list[Hospital] = []
        for dist, h in scored[:limit]:
            results.append(
                Hospital(
                    id=h.get("id", ""),
                    name=h.get("name", ""),
                    type=h.get("type", ""),
                    address=h.get("address", ""),
                    district=h.get("district", ""),
                    state=h.get("state", ""),
                    lat=float(h.get("lat", 0)),
                    lng=float(h.get("lng", 0)),
                    phone=h.get("phone"),
                    beds=h.get("beds"),
                    distance_km=round(dist, 2),
                )
            )
        return results
