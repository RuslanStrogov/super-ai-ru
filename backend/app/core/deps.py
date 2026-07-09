"""
Super AI RU — Dependency Injection.

Функции для внедрения зависимостей в FastAPI:
- get_db — асинхронная сессия SQLAlchemy
- get_current_user — проверка JWT и получение пользователя
"""

from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.security import verify_token
from app.models.user import User

# Bearer token схема для Swagger UI
bearer_scheme = HTTPBearer(auto_error=False)


async def get_db() -> AsyncSession:
    """
    Асинхронная сессия SQLAlchemy.

    Yields:
        AsyncSession — сессия с авто-commit/rollback.
    """
    async for session in get_async_session():
        yield session


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Получить текущего авторизованного пользователя из JWT.

    Args:
        credentials: Bearer-токен из заголовка Authorization.
        db: Сессия БД.

    Returns:
        Модель User.

    Raises:
        HTTPException 401: Если токен отсутствует, недействителен
                           или пользователь не найден.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Не предоставлен токен авторизации",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = verify_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный или просроченный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Проверяем, что это access-токен
    token_type = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется access-токен",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный payload токена: отсутствует sub",
        )

    # Получаем пользователя из БД
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Учётная запись деактивирована",
        )

    return user