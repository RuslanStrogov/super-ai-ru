"""
Super AI RU — Конфигурация приложения.

Загрузка настроек из переменных окружения / .env через Pydantic Settings.
"""

from __future__ import annotations

from pathlib import Path
from typing import ClassVar

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Настройки приложения Super AI RU.

    Загружаются из .env файла (в порядке приоритета: .env -> переменные окружения).
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App ---
    APP_NAME: str = "Super AI RU Backend"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/super_ai_ru"

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"

    # --- Qdrant ---
    QDRANT_URL: str = "http://localhost:6333"

    # --- JWT ---
    SECRET_KEY: str = "change-me-to-a-long-random-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- YandexGPT ---
    YANDEXGPT_API_KEY: str = ""
    YANDEXGPT_FOLDER_ID: str = ""
    YANDEXGPT_MODEL: str = "yandexgpt/pro"

    # --- GigaChat ---
    GIGACHAT_API_KEY: str = ""
    GIGACHAT_SCOPE: str = "GIGACHAT_API_PERS"
    GIGACHAT_MODEL: str = "GigaChat:latest"

    # --- Ollama ---
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    # --- OpenAI-compatible ---
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = ""
    OPENAI_MODEL: str = "gpt-4o"

    # --- CORS ---
    CORS_ORIGINS: str = "*"

    # --- S3 ---
    S3_ENDPOINT: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_BUCKET: str = "super-ai-ru-documents"

    # --- Вычисляемые свойства ---
    @property
    def cors_origins_list(self) -> list[str]:
        """Разрешённые CORS-источники в виде списка."""
        origins = self.CORS_ORIGINS
        if origins == "*":
            return ["*"]
        return [o.strip() for o in origins.split(",")]

    @property
    def refresh_token_expire_seconds(self) -> int:
        """Срок жизни refresh-токена в секундах."""
        return self.REFRESH_TOKEN_EXPIRE_DAYS * 86400


# Единственный экземпляр настроек для всего приложения
settings = Settings()

# Корень проекта (там же, где лежит .env)
BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent