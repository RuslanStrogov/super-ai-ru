"""
Super AI RU — Схемы чата.

Pydantic модели для chat/completions, SSE-стриминга, списка бесед.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


# ─── Chat Completion ──────────────────────────────────────────────────────────


class ChatMessage(BaseModel):
    """Сообщение в запросе к LLM."""

    role: str = Field(..., description="Роль: system | user | assistant | tool")
    content: str | None = Field(None, description="Текст сообщения")
    tool_calls: list[dict] | None = Field(None, description="Вызовы инструментов")


class RAGConfig(BaseModel):
    """Конфигурация RAG для обогащения промпта."""

    project_id: str = Field(..., description="ID проекта")
    top_k: int = Field(5, ge=1, le=50, description="Количество чанков")
    similarity_threshold: float = Field(0.75, ge=0.0, le=1.0, description="Порог схожести")


class ChatCompletionRequest(BaseModel):
    """Запрос к chat/completions."""

    model: str = Field("yandexgpt/pro", description="Модель LLM")
    messages: list[ChatMessage] = Field(..., min_length=1, description="Сообщения")
    stream: bool = Field(True, description="SSE streaming")
    temperature: float | None = Field(0.7, ge=0.0, le=2.0, description="Температура")
    max_tokens: int | None = Field(4096, ge=1, le=32768, description="Макс. токенов")
    rag: RAGConfig | None = Field(None, description="RAG-конфигурация")
    conversation_id: str | None = Field(None, description="ID беседы для сохранения")


class DeltaContent(BaseModel):
    """Дельта контента для SSE."""

    content: str | None = Field(None, description="Токен")


class Choice(BaseModel):
    """Выбор с дельтой."""

    index: int = Field(0, description="Индекс")
    delta: DeltaContent = Field(default_factory=DeltaContent)


class ChatCompletionChunk(BaseModel):
    """Чанк SSE-стрима (в формате OpenAI-compat)."""

    id: str = Field(..., description="ID генерации")
    object: str = Field("chat.completion.chunk")
    choices: list[Choice] = Field(default_factory=list)
    finish_reason: str | None = Field(None)


# ─── Conversation ────────────────────────────────────────────────────────────


class ConversationOut(BaseModel):
    """Беседа (ответ API)."""

    id: str = Field(..., description="UUID беседы")
    title: str | None = Field(None, description="Название")
    model: str | None = Field(None, description="Модель")
    message_count: int = Field(0, description="Количество сообщений")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: datetime = Field(..., description="Дата обновления")

    model_config = {"from_attributes": True}


class MessageOut(BaseModel):
    """Сообщение (ответ API)."""

    id: str = Field(..., description="UUID сообщения")
    role: str = Field(..., description="Роль")
    content: str | None = Field(None, description="Текст")
    tokens_in: int | None = Field(None, description="Токенов на вход")
    tokens_out: int | None = Field(None, description="Токенов на выход")
    created_at: datetime = Field(..., description="Дата")

    model_config = {"from_attributes": True}


class ConversationListResponse(BaseModel):
    """Список бесед."""

    conversations: list[ConversationOut] = Field(default_factory=list)
    total: int = Field(0, description="Всего бесед")