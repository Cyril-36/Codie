from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.auth.schemas import Token, UserLogin, UserRegister
from app.auth.utils import create_token_pair, hash_password, verify_password
from app.db import get_session
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, session: Annotated[AsyncSession, Depends(get_session)]) -> Token:
    # Check uniqueness
    exists_stmt = select(User).where((User.email == payload.email) | (User.username == payload.username))
    res = await session.execute(exists_stmt)
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email or username already registered")

    user = User(
        email=payload.email,
        username=payload.username,
        password_hash=hash_password(payload.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    access_token, refresh_token = create_token_pair(sub=user.username)
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=Token)
async def login(payload: UserLogin, session: Annotated[AsyncSession, Depends(get_session)]) -> Token:
    # Find by username or email for convenience
    stmt = select(User).where((User.username == payload.username) | (User.email == payload.username))
    res = await session.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token, refresh_token = create_token_pair(sub=user.username)
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str) -> Token:
    # Simple refresh: validate refresh token, emit new pair
    from app.auth.utils import decode_token  # local import to avoid cycle

    payload = decode_token(refresh_token, expected_type="refresh")
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid refresh token")

    access_token, new_refresh_token = create_token_pair(sub=sub)
    return Token(access_token=access_token, refresh_token=new_refresh_token)
