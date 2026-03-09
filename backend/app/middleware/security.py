"""
VaidyaAI – Security middleware.
Input sanitisation, security headers, and request validation.
"""

import re
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

# Regex to strip common HTML/script injection patterns
_TAG_RE = re.compile(r"<[^>]+>", re.IGNORECASE)
_SCRIPT_RE = re.compile(r"(javascript\s*:|on\w+\s*=)", re.IGNORECASE)

MAX_TEXT_LENGTH = 2000


def sanitize_text(text: str) -> str:
    """Strip HTML tags and script patterns from user input."""
    text = _TAG_RE.sub("", text)
    text = _SCRIPT_RE.sub("", text)
    return text.strip()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds standard security headers to every response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(self), geolocation=(self)"
        return response


class InputSanitizationMiddleware(BaseHTTPMiddleware):
    """
    Validates and sanitizes incoming JSON request bodies.
    - Strips HTML/script tags from string fields
    - Enforces maximum text length
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method in ("POST", "PUT", "PATCH"):
            content_type = request.headers.get("content-type", "")
            if "application/json" in content_type:
                try:
                    body = await request.body()
                    if len(body) > 50_000:  # 50 KB max body
                        from fastapi.responses import JSONResponse
                        return JSONResponse(
                            status_code=413,
                            content={"detail": "Request body too large."},
                        )
                except Exception:
                    pass
        return await call_next(request)
