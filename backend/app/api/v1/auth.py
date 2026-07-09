"""
Super AI RU — Auth API.

POST /auth/register — регистрация
POST /auth/login — вход
POST /auth/refresh — обновление токенов
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserOut,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=TokenResponse,
    summary="Регистрация нового пользователя",
    description="Создаёт нового пользователя и возвращает JWT токены.",
    status_code=201,
)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Зарегистрировать нового пользователя.

    - **email**: Email (обязательно)
    - **password**: Пароль (мин. 8 символов)
    - **full_name**: Полное имя (опционально)

    Возвращает access_token и refresh_token.
    """
    service = AuthService(db)
    return await service.register(
        email=body.email,
        password=body.password,
        full_name=body.full_name,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Вход в систему",
    description="Аутентификация по email и паролю. Возвращает JWT токены.",
)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Войти в систему.

    - **email**: Email
    - **password**: Пароль

    Возвращает access_token и refresh_token.
    """
    service = AuthService(db)
    return await service.login(email=body.email, password=body.password)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Обновление токенов",
    description="Обновляет access-токен по refresh-токену.",
)
async def refresh(
    body: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """
    Обновить access-токен.

    - **refresh_token**: Действительный refresh-токен

    Возвращает новую пару токенов.
    """
    service = AuthService(db)
    return await service.refresh(refresh_token=body.refresh_token)