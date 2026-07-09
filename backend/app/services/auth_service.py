"""
Super AI RU — Auth Service.

Бизнес-логика регистрации и входа пользователей.
"""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    verify_token,
)
from app.models.user import User
from app.schemas.auth import TokenResponse, UserOut


class AuthService:
    """Сервис аутентификации: регистрация, логин, обновление токенов."""

    def __init__(self, db: AsyncSession) -> None:
        """
        Инициализация сервиса.

        Args:
            db: Асинхронная сессия SQLAlchemy.
        """
        self.db = db

    async def register(
        self,
        email: str,
        password: str,
        full_name: str | None = None,
    ) -> TokenResponse:
        """
        Зарегистрировать нового пользователя.

        Args:
            email: Email пользователя.
            password: Пароль.
            full_name: Полное имя (опционально).

        Returns:
            TokenResponse с access и refresh токенами.

        Raises:
            HTTPException 409: Если email уже занят.
        """
        # Проверяем, не занят ли email
        result = await self.db.execute(select(User).where(User.email == email))
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Пользователь с таким email уже зарегистрирован",
            )

        # Создаём пользователя
        user = User(
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
        )
        self.db.add(user)
        await self.db.flush()

        # Выдаём токены
        extra_claims = {"role": user.role}
        access_token = create_access_token(subject=user.id, extra_claims=extra_claims)
        refresh_token = create_refresh_token(subject=user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def login(self, email: str, password: str) -> TokenResponse:
        """
        Аутентификация пользователя.

        Args:
            email: Email.
            password: Пароль.

        Returns:
            TokenResponse с access и refresh токенами.

        Raises:
            HTTPException 401: Если email или пароль неверны.
        """
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Учётная запись деактивирована",
            )

        extra_claims = {"role": user.role}
        access_token = create_access_token(subject=user.id, extra_claims=extra_claims)
        refresh_token = create_refresh_token(subject=user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        """
        Обновить access-токен по refresh-токену.

        Args:
            refresh_token: Refresh JWT.

        Returns:
            TokenResponse с новой парой токенов.

        Raises:
            HTTPException 401: Если refresh-токен недействителен.
        """
        try:
            payload = verify_token(refresh_token)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Недействительный refresh-токен",
            )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Требуется refresh-токен",
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный payload токена",
            )

        # Проверяем, что пользователь существует
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Пользователь не найден или деактивирован",
            )

        extra_claims = {"role": user.role}
        new_access = create_access_token(subject=user.id, extra_claims=extra_claims)
        new_refresh = create_refresh_token(subject=user.id)

        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
        )

    @staticmethod
    def user_to_out(user: User) -> UserOut:
        """
        Преобразовать модель User в Pydantic-схему UserOut.

        Args:
            user: Модель User.

        Returns:
            UserOut.
        """
        return UserOut(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        )