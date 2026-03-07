"""
VaidyaAI Configuration
Reads settings from environment variables / .env file using Pydantic Settings.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings, populated from environment variables or .env."""

    # Gemini API key — required in production
    GEMINI_API_KEY: str = ""

    # Runtime environment: "development" | "production" | "test"
    ENVIRONMENT: str = "development"

    # Public-facing backend URL (used for self-referencing links, CORS, etc.)
    BACKEND_URL: str = "http://localhost:8000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"

    @property
    def gemini_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY)


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings singleton.  Import and call this wherever you need config."""
    return Settings()
