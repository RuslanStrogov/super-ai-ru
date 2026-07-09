"""
Super AI RU — Главный файл FastAPI приложения.

Запуск: uvicorn app.main:app --reload
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.database import close_db, init_db

# Настройка логирования
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Жизненный цикл приложения.

    startup:
        - Инициализация БД (создание таблиц, если ещё нет)
    shutdown:
        - Закрытие соединения с БД
    """
    logger.info("🚀 Запуск %s", settings.APP_NAME)
    try:
        await init_db()
        logger.info("✅ База данных инициализирована")
    except Exception as exc:
        logger.warning("⚠️  Не удалось инициализировать БД: %s", exc)
        logger.warning("   (Это нормально, если вы используете Alembic миграции)")

    yield

    logger.info("🛑 Остановка %s", settings.APP_NAME)
    await close_db()


# Создаём FastAPI приложение
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    Super AI RU — Backend API.

    Российский аналог Abacus.ai: универсальная AI-платформа
    с поддержкой российских и open-source LLM.
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роуты
app.include_router(api_router)


# ─── Корневой эндпоинт ──────────────────────────────────────────────────────

@app.get("/")
async def root() -> dict:
    """Корневой эндпоинт — информация о сервисе."""
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


@app.get("/health")
async def health() -> dict:
    """Health check."""
    return {"status": "healthy", "app": settings.APP_NAME}