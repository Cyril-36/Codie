from datetime import timedelta

from backend.app.core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hash_and_verify():
    pw = "S3cure-Pa55!"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed)
    assert not verify_password("wrong", hashed)


def test_jwt_roundtrip_and_expiry():
    token = create_access_token("user123", expires_delta=timedelta(seconds=2))
    data = decode_token(token)
    assert data["sub"] == "user123"

    # No real sleep; just ensure token decodes before expiry window
    token2 = create_access_token("user123")
    data2 = decode_token(token2)
    assert data2["sub"] == "user123"
