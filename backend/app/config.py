"""
VaidyaAI Configuration
Reads settings from environment variables / .env file using Pydantic Settings.
"""

from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


def _is_real_key(key: str) -> bool:
    """Check if an API key is real (not empty or a placeholder)."""
    k = key.strip()
    if not k:
        return False
    if k.startswith("your_") or k.startswith("YOUR_"):
        return False
    placeholders = {"your_api_key", "your-api-key", "change_me", "xxx"}
    if k.lower() in placeholders:
        return False
    return True


class Settings(BaseSettings):
    """Application-wide settings, populated from environment variables or .env."""

    # Groq API key — primary LLM provider (fast Llama 3.3 70B inference)
    GROQ_API_KEY: str = ""

    # Gemini API key — kept for backward compatibility / vision features
    GEMINI_API_KEY: str = ""

    # Runtime environment: "development" | "production" | "test"
    ENVIRONMENT: str = "development"

    # Public-facing backend URL (used for self-referencing links, CORS, etc.)
    BACKEND_URL: str = "http://localhost:8000"

    # Configurable CORS allowed origins (comma-separated list or empty for defaults)
    ALLOWED_ORIGINS: List[str] = []

    # Sarvam AI API key for regional TTS/STT (optional)
    SARVAM_API_KEY: str = ""

    # VAPID keys for Web Push notifications (auto-generated if empty)
    VAPID_PUBLIC_KEY: str = ""
    VAPID_PRIVATE_KEY: str = ""
    VAPID_CLAIM_EMAIL: str = "mailto:admin@vaidyaai.com"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"

    @property
    def groq_configured(self) -> bool:
        return _is_real_key(self.GROQ_API_KEY)

    @property
    def gemini_configured(self) -> bool:
        return _is_real_key(self.GEMINI_API_KEY)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings singleton.  Import and call this wherever you need config."""
    return Settings()
