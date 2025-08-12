from __future__ import annotations

import os
import time
from datetime import timedelta
from typing import Optional

import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_secret_key() -> str:
    key = os.getenv("SECRET_KEY")
    if not key:
        # In dev, allow a default; production should supply via Vault/env.
        key = "dev-secret-not-for-prod"
    return key


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    now = int(time.time())
    exp = now + int(expires_delta.total_seconds()) if expires_delta else now + 3600
    payload = {"sub": subject, "iat": now, "exp": exp}
    token = jwt.encode(payload, get_secret_key(), algorithm="HS256")
    # pyjwt may return str in py3; normalize to str
    return token if isinstance(token, str) else token.decode("utf-8")


def decode_token(token: str) -> dict:
    return jwt.decode(token, get_secret_key(), algorithms=["HS256"])
