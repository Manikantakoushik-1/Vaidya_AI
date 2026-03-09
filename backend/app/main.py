"""
VaidyaAI – Main FastAPI application entry point.
Wires together all routers, middleware, and lifecycle events.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.routers import health, consultation, hospitals, emergency, analytics
from app.routers import report, image_analysis, chat, tts, push, stt
from app.middleware.rate_limiter import limiter, rate_limit_exceeded_handler
from app.middleware.security import SecurityHeadersMiddleware, InputSanitizationMiddleware

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler — runs startup tasks before yield, teardown after."""
    settings = get_settings()
    logger.info("🚀 VaidyaAI starting up (env=%s)", settings.ENVIRONMENT)
    if not settings.gemini_configured:
        logger.warning(
            "GEMINI_API_KEY is not set — LLM features will use fallback responses."
        )
    yield
    logger.info("🛑 VaidyaAI shutting down.")


app = FastAPI(
    title="VaidyaAI",
    description="AI Doctor App for Rural India — FastAPI Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# Rate Limiting (slowapi)
# ---------------------------------------------------------------------------
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# ---------------------------------------------------------------------------
# Security middleware
# ---------------------------------------------------------------------------
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(InputSanitizationMiddleware)

# ---------------------------------------------------------------------------
# CORS middleware
# In development allow all origins; tighten in production via ALLOWED_ORIGINS env var.
# ---------------------------------------------------------------------------
settings = get_settings()
allowed = settings.ALLOWED_ORIGINS
origins = allowed if allowed else (["*"] if settings.is_development else [settings.BACKEND_URL])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(health.router)
app.include_router(consultation.router)
app.include_router(hospitals.router)
app.include_router(emergency.router)
app.include_router(analytics.router)
app.include_router(report.router)
app.include_router(image_analysis.router)
app.include_router(chat.router)
app.include_router(tts.router)
app.include_router(push.router)
app.include_router(stt.router)


# ---------------------------------------------------------------------------
# Root endpoint
# ---------------------------------------------------------------------------
@app.get("/", tags=["root"], summary="API root")
async def root() -> dict:
    """Returns basic service info."""
    return {
        "service": "VaidyaAI",
        "description": "AI Doctor App for Rural India",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }
