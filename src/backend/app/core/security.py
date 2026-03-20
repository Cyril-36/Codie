from __future__ import annotations

import logging
import os
import time
from datetime import timedelta
from typing import Optional

_security_logger = logging.getLogger(__name__)

import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .db import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_bearer_scheme = HTTPBearer(auto_error=False)

# Token durations
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))


_INSECURE_DEV_KEY = "dev-secret-not-for-prod"


def get_secret_key() -> str:
    key = os.getenv("SECRET_KEY")
    if not key:
        _security_logger.critical(
            "SECRET_KEY environment variable is not set! "
            "Using an insecure hard-coded fallback key. "
            "This is NOT safe for production. "
            "Set the SECRET_KEY environment variable before deploying."
        )
        key = _INSECURE_DEV_KEY
    return key


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    now = int(time.time())
    exp = now + int(expires_delta.total_seconds()) if expires_delta else now + ACCESS_TOKEN_EXPIRE_MINUTES * 60
    payload = {"sub": subject, "iat": now, "exp": exp, "type": "access"}
    token = jwt.encode(payload, get_secret_key(), algorithm="HS256")
    return token if isinstance(token, str) else token.decode("utf-8")


def create_refresh_token(subject: str) -> str:
    now = int(time.time())
    exp = now + REFRESH_TOKEN_EXPIRE_DAYS * 86400
    payload = {"sub": subject, "iat": now, "exp": exp, "type": "refresh"}
    token = jwt.encode(payload, get_secret_key(), algorithm="HS256")
    return token if isinstance(token, str) else token.decode("utf-8")


def create_token_pair(subject: str) -> tuple[str, str]:
    """Create both access and refresh tokens."""
    return create_access_token(subject), create_refresh_token(subject)


def decode_token(token: str) -> dict:
    return jwt.decode(token, get_secret_key(), algorithms=["HS256"])


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    """FastAPI dependency: requires a valid JWT and returns the User row."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = int(payload["sub"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")

    from ..models.user import User
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    """FastAPI dependency: returns User if authenticated, None otherwise."""
    if credentials is None:
        return None
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
