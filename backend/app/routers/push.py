"""
VaidyaAI – Push Notification router.
POST /api/push/subscribe — store push subscription.
POST /api/push/send — send a push notification.
"""

import json
import logging
from pathlib import Path
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.middleware.rate_limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/push", tags=["push"])

_SUBS_FILE = Path(__file__).resolve().parent.parent / "data" / "push_subscriptions.json"


def _read_subs() -> list:
    try:
        with open(_SUBS_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def _write_subs(subs: list) -> None:
    _SUBS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(_SUBS_FILE, "w") as f:
        json.dump(subs, f, indent=2)


class PushSubscription(BaseModel):
    endpoint: str
    keys: dict


class PushMessage(BaseModel):
    title: str = Field(default="VaidyaAI")
    body: str = Field(default="You have a notification")
    url: Optional[str] = None


@router.post("/subscribe", summary="Subscribe to push notifications")
@limiter.limit("10/minute")
async def subscribe(request: Request, sub: PushSubscription):
    """Store a push notification subscription."""
    subs = _read_subs()
    # Avoid duplicates
    if not any(s.get("endpoint") == sub.endpoint for s in subs):
        subs.append(sub.model_dump())
        _write_subs(subs)
    return {"status": "subscribed"}


@router.post("/send", summary="Send push notification")
@limiter.limit("5/minute")
async def send_push(request: Request, msg: PushMessage):
    """Send push notification to all subscribers."""
    from app.config import get_settings
    settings = get_settings()

    if not settings.VAPID_PRIVATE_KEY:
        raise HTTPException(status_code=503, detail="VAPID keys not configured")

    subs = _read_subs()
    sent = 0

    try:
        from pywebpush import webpush
        payload = json.dumps({
            "title": msg.title,
            "body": msg.body,
            "url": msg.url or "/",
        })
        for sub in subs:
            try:
                webpush(
                    subscription_info=sub,
                    data=payload,
                    vapid_private_key=settings.VAPID_PRIVATE_KEY,
                    vapid_claims={"sub": settings.VAPID_CLAIM_EMAIL},
                )
                sent += 1
            except Exception as exc:
                logger.warning("Push failed for subscription: %s", exc)
    except ImportError:
        raise HTTPException(status_code=503, detail="pywebpush not installed")

    return {"sent": sent, "total": len(subs)}
