"""
Super AI RU — Схемы агентов.

Pydantic модели для CRUD агентов и запуска.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class AgentCreate(BaseModel):
    """Создание определения агента."""

    name: str = Field(..., min_length=1, max_length=256, description="Название агента")
    system_prompt: str | None = Field(None, description="Системный промпт")
    tools: list[str] = Field(default_factory=list, description="Список инструментов")
    config: dict[str, Any] = Field(default_factory=dict, description="Конфигурация")


class AgentUpdate(BaseModel):
    """Обновление определения агента."""

    name: str | None = Field(None, max_length=256, description="Название")
    system_prompt: str | None = Field(None, description="Системный промпт")
    tools: list[str] | None = Field(None, description="Инструменты")
    config: dict[str, Any] | None = Field(None, description="Конфигурация")
    is_active: bool | None = Field(None, description="Активен")


class AgentOut(BaseModel):
    """Определение агента (ответ)."""

    id: str = Field(..., description="UUID")
    name: str = Field(..., description="Название")
    system_prompt: str | None = Field(None, description="Системный промпт")
    tools: list[str] = Field(default_factory=list, description="Инструменты")
    config: dict[str, Any] = Field(default_factory=dict, description="Конфигурация")
    is_active: bool = Field(True)
    created_at: datetime = Field(..., description="Дата создания")

    model_config = {"from_attributes": True}


class AgentRunRequest(BaseModel):
    """Запуск агента."""

    task: str = Field(..., description="Задача для агента")
    stream: bool = Field(True, description="SSE-стриминг")


class AgentRunResponse(BaseModel):
    """Результат запуска агента (не-стриминг)."""

    agent_id: str = Field(..., description="UUID агента")
    result: str = Field(..., description="Ответ агента")