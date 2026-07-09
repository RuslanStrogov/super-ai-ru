"""
Super AI RU — Главный роутер API.

Собирает все v1 роуты под общим префиксом /api.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import agents, auth, billing, chat, documents

# Главный API-роутер
api_router = APIRouter(prefix="/api")

# Подключаем v1 роуты
api_router.include_router(auth.router)          # /api/auth/*
api_router.include_router(chat.router)           # /api/v1/chat/*
api_router.include_router(agents.router)         # /api/v1/agents/*
api_router.include_router(documents.router)      # /api/v1/documents/*, /api/v1/rag/*
api_router.include_router(billing.router)        # /api/v1/billing/*