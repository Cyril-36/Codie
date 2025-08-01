from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Tuple

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def create_token_pair(sub: str) -> Tuple[str, str]:
    """
    Returns (access_token, refresh_token)
    """
    s = get_settings()
    secret = getattr(s, "jwt", None).secret if hasattr(s, "jwt") else getattr(s, "jwt_secret", None)
    algorithm = getattr(getattr(s, "jwt", None), "algorithm", "HS256") if hasattr(s, "jwt") else getattr(s, "jwt_algorithm", "HS256")
    access_minutes = getattr(getattr(s, "jwt", None), "access_token_expire_minutes", 15) if hasattr(s, "jwt") else int(getattr(s, "jwt_access_token_expire_minutes", 15))
    refresh_days = getattr(getattr(s, "jwt", None), "refresh_token_expire_days", 7) if hasattr(s, "jwt") else int(getattr(s, "jwt_refresh_token_expire_days", 7))

    now = _now_utc()
    access_payload = {
        "sub": sub,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=access_minutes)).timestamp()),
        "type": "access",
    }
    refresh_payload = {
        "sub": sub,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=refresh_days)).timestamp()),
        "type": "refresh",
    }

    access_token = jwt.encode(access_payload, secret, algorithm=algorithm)  # type: ignore[arg-type]
    refresh_token = jwt.encode(refresh_payload, secret, algorithm=algorithm)  # type: ignore[arg-type]
    return access_token, refresh_token


def decode_token(token: str, expected_type: Optional[str] = None) -> dict[str, Any]:
    s = get_settings()
    secret = getattr(s, "jwt", None).secret if hasattr(s, "jwt") else getattr(s, "jwt_secret", None)
    algorithm = getattr(getattr(s, "jwt", None), "algorithm", "HS256") if hasattr(s, "jwt") else getattr(s, "jwt_algorithm", "HS256")
    try:
        payload = jwt.decode(token, secret, algorithms=[algorithm])  # type: ignore[arg-type]
        if expected_type and payload.get("type") != expected_type:
            raise JWTError("Invalid token type")
        return payload
    except JWTError as e:
        raise e
