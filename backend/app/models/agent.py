"""
Super AI RU — Модель AgentDefinition.

Определение AI-агента: системный промпт, инструменты, конфигурация.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _utcnow() -> datetime:
    """Текущее время в UTC."""
    return datetime.now(timezone.utc)


def _uuid() -> str:
    """Сгенерировать UUID4 как строку."""
    return str(uuid.uuid4())


class AgentDefinition(Base):
    """Определение AI-агента: промпт, инструменты, настройки."""

    __tablename__ = "agent_definitions"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=_uuid,
    )
    project_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    system_prompt: Mapped[str | None] = mapped_column(Text, nullable=True)
    tools: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)
    config: Mapped[dict | None] = mapped_column(JSONB, nullable=True, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, nullable=False
    )

    # Связи
    project = relationship("Project", back_populates="agent_definitions")

    def __repr__(self) -> str:
        return f"<AgentDefinition {self.name}>"