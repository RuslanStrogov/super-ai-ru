"""
Super AI RU — Схемы пользователей.

Pydantic модели для CRUD пользователей (админка).
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserUpdate(BaseModel):
    """Обновление данных пользователя (админ)."""

    full_name: str | None = Field(None, max_length=256)
    role: str | None = Field(None, pattern=r"^(admin|developer|viewer|billing_admin)$")
    is_active: bool | None = Field(None)


class OrganizationCreate(BaseModel):
    """Создание организации."""

    name: str = Field(..., min_length=1, max_length=256)
    slug: str = Field(..., min_length=1, max_length=128, pattern=r"^[a-z0-9-]+$")


class OrganizationOut(BaseModel):
    """Организация (ответ)."""

    id: str
    name: str
    slug: str
    tier: str
    created_at: datetime

    model_config = {"from_attributes": True}


class OrganizationMemberOut(BaseModel):
    """Участник организации (ответ)."""

    id: str
    user_id: str
    role: str
    joined_at: datetime

    model_config = {"from_attributes": True}