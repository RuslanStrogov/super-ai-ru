"""
Super AI RU — Схемы аутентификации.

Pydantic модели для регистрации, логина, обновления токенов.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    """Запрос на регистрацию пользователя."""

    email: EmailStr = Field(..., description="Email пользователя")
    password: str = Field(..., min_length=8, max_length=128, description="Пароль")
    full_name: str | None = Field(None, max_length=256, description="Полное имя")


class LoginRequest(BaseModel):
    """Запрос на вход в систему."""

    email: EmailStr = Field(..., description="Email пользователя")
    password: str = Field(..., description="Пароль")


class RefreshTokenRequest(BaseModel):
    """Запрос на обновление access-токена."""

    refresh_token: str = Field(..., description="Refresh токен")


class TokenResponse(BaseModel):
    """Ответ с токенами."""

    access_token: str = Field(..., description="Access токен (JWT)")
    refresh_token: str = Field(..., description="Refresh токен (JWT)")
    token_type: str = Field("bearer", description="Тип токена")


class UserOut(BaseModel):
    """Публичные данные пользователя."""

    id: str = Field(..., description="UUID пользователя")
    email: str = Field(..., description="Email")
    full_name: str | None = Field(None, description="Полное имя")
    role: str = Field(..., description="Роль")
    is_active: bool = Field(..., description="Активен ли пользователь")
    created_at: datetime = Field(..., description="Дата регистрации")

    model_config = {"from_attributes": True}


class ErrorResponse(BaseModel):
    """Стандартный ответ с ошибкой."""

    detail: str = Field(..., description="Описание ошибки")