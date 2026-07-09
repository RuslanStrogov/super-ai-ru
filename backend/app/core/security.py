"""
Super AI RU — Безопасность: JWT и хеширование паролей.

- Создание и верификация access/refresh JWT токенов (python-jose)
- Хеширование и проверка паролей (bcrypt)
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from bcrypt import checkpw, gensalt, hashpw
from jose import JWTError, jwt

from app.core.config import settings


# ─── Пароли (bcrypt) ─────────────────────────────────────────────────────────


def hash_password(password: str) -> str:
    """
    Хешировать пароль с помощью bcrypt.

    Args:
        password: Пароль в открытом виде.

    Returns:
        bcrypt-хеш в виде строки.
    """
    return hashpw(password.encode("utf-8"), gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Проверить пароль против bcrypt-хеша.

    Args:
        plain_password: Пароль в открытом виде.
        hashed_password: bcrypt-хеш из БД.

    Returns:
        True если пароль совпадает, иначе False.
    """
    return checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


# ─── JWT ─────────────────────────────────────────────────────────────────────


def create_access_token(
    subject: str,
    extra_claims: dict | None = None,
) -> str:
    """
    Создать access-токен JWT.

    Args:
        subject: Идентификатор пользователя (uuid).
        extra_claims: Дополнительные claims (org_id, role и т.д.).

    Returns:
        Закодированный JWT-токен (str).
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    claims = {
        "sub": subject,
        "iat": now,
        "exp": expire,
        "type": "access",
    }
    if extra_claims:
        claims.update(extra_claims)

    return jwt.encode(claims, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: str) -> str:
    """
    Создать refresh-токен JWT.

    Args:
        subject: Идентификатор пользователя (uuid).

    Returns:
        Закодированный refresh-токен (str).
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    claims = {
        "sub": subject,
        "iat": now,
        "exp": expire,
        "type": "refresh",
    }

    return jwt.encode(claims, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def verify_token(token: str) -> dict:
    """
    Проверить и декодировать JWT-токен.

    Args:
        token: JWT-токен для проверки.

    Returns:
        Словарь с claims из токена.

    Raises:
        JWTError: Если токен недействителен или просрочен.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError:
        raise


def get_token_from_bearer(authorization: str | None) -> str:
    """
    Извлечь JWT из заголовка Authorization: Bearer <token>.

    Args:
        authorization: Значение заголовка Authorization.

    Returns:
        Строка с JWT-токеном.

    Raises:
        ValueError: Если заголовок отсутствует или имеет неверный формат.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise ValueError("Неверный формат Authorization заголовка")
    return authorization.removeprefix("Bearer ")