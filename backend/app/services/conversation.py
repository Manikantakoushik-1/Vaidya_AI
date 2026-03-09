"""
VaidyaAI – Conversation Session Manager.
Manages multi-turn conversation context for follow-up questions.
"""

import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)

SESSION_TTL = 1800  # 30 minutes
MAX_TURNS = 10


class ConversationManager:
    """In-memory conversation session store."""

    def __init__(self) -> None:
        self._sessions: dict[str, dict] = {}

    def get_history(self, session_id: str) -> list[dict]:
        """Get conversation history for a session."""
        self._cleanup()
        session = self._sessions.get(session_id)
        if not session:
            return []
        return session.get("turns", [])

    def add_turn(
        self,
        session_id: str,
        user_text: str,
        ai_response: str,
        symptoms: list[str],
        severity: str,
    ) -> None:
        """Add a conversation turn."""
        now = time.time()
        if session_id not in self._sessions:
            self._sessions[session_id] = {"turns": [], "created": now, "updated": now}

        session = self._sessions[session_id]
        session["updated"] = now
        session["turns"].append({
            "user": user_text,
            "assistant": ai_response,
            "symptoms": symptoms,
            "severity": severity,
            "timestamp": now,
        })

        # Keep only most recent turns
        if len(session["turns"]) > MAX_TURNS:
            session["turns"] = session["turns"][-MAX_TURNS:]

    def _cleanup(self) -> None:
        """Remove expired sessions."""
        now = time.time()
        expired = [
            sid for sid, s in self._sessions.items()
            if now - s.get("updated", 0) > SESSION_TTL
        ]
        for sid in expired:
            del self._sessions[sid]


# Module-level singleton
conversation_manager = ConversationManager()
