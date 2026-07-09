"""
Super AI RU — Alembic env.py.

Асинхронная конфигурация миграций для SQLAlchemy + asyncpg.
"""

from __future__ import annotations

import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# Alembic Config object
config = context.config

# Настройка логгера
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Импортируем все модели, чтобы Alembic видел их метаданные
from app.core.database import Base  # noqa: E402

# Импорт моделей (чтобы они зарегистрировались в Base.metadata)
from app.models import (  # noqa: E402, F401
    agent,
    api_key,
    billing,
    chat,
    document,
    user,
)

# Метаданные для autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Запуск миграций в offline-режиме (без подключения к БД).

    Генерирует SQL скрипт, который можно применить позже.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Выполнить миграции через переданное соединение."""
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """
    Запуск миграций в async-режиме.

    Создаёт асинхронный движок и выполняет миграции.
    """
    configuration = config.get_section(config.config_ini_section, {})
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """
    Запуск миграций в online-режиме (с подключением к БД).

    Использует асинхронный движок SQLAlchemy.
    """
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()