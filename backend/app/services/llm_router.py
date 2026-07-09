"""
Super AI RU — LLM Router.

Абстракция над LLM-провайдерами: YandexGPT, GigaChat, Ollama, OpenAI-compat.
Функция stream_chat возвращает асинхронный генератор токенов (SSE).
"""

from __future__ import annotations

import json
from typing import Any, AsyncGenerator

import httpx
from openai import AsyncOpenAI

from app.core.config import settings


# ─── Типы ────────────────────────────────────────────────────────────────────

ChatMessage = dict[str, Any]  # {"role": "...", "content": "..."}


# ─── Провайдеры ──────────────────────────────────────────────────────────────


async def _stream_yandexgpt(
    messages: list[ChatMessage],
    temperature: float | None,
    max_tokens: int | None,
) -> AsyncGenerator[str, None]:
    """
    Стриминг через YandexGPT API.

    Документация: https://yandex.cloud/ru/docs/foundation-models/
    """
    url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
    headers = {
        "Authorization": f"Api-Key {settings.YANDEXGPT_API_KEY}",
        "Content-Type": "application/json",
    }

    # YandexGPT использует свой формат сообщений
    body = {
        "modelUri": f"gpt://{settings.YANDEXGPT_FOLDER_ID}/{settings.YANDEXGPT_MODEL}",
        "completionOptions": {
            "stream": True,
            "temperature": temperature or 0.7,
            "maxTokens": max_tokens or 4096,
        },
        "messages": [
            {"role": m["role"], "text": m.get("content", "")}
            for m in messages
        ],
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", url, headers=headers, json=body) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    data = json.loads(line[6:])
                    token = data.get("result", {}).get("alternatives", [{}])[0].get("message", {}).get("text", "")
                    if token:
                        yield token


async def _stream_gigachat(
    messages: list[ChatMessage],
    temperature: float | None,
    max_tokens: int | None,
) -> AsyncGenerator[str, None]:
    """
    Стриминг через GigaChat API (SberCloud).

    Документация: https://developers.sber.ru/docs/ru/gigachat/api/reference
    """
    # GigaChat требует получения токена доступа
    auth_url = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
    auth_headers = {
        "Authorization": f"Bearer {settings.GIGACHAT_API_KEY}",
        "RqUID": "00000000-0000-0000-0000-000000000001",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
        auth_resp = await client.post(
            auth_url,
            headers=auth_headers,
            data={"scope": settings.GIGACHAT_SCOPE},
        )
        auth_resp.raise_for_status()
        access_token = auth_resp.json().get("access_token", "")

        # Стриминг
        chat_url = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"
        chat_headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }
        body = {
            "model": settings.GIGACHAT_MODEL,
            "messages": messages,
            "stream": True,
            "temperature": temperature or 0.7,
            "max_tokens": max_tokens or 4096,
        }

        async with client.stream("POST", chat_url, headers=chat_headers, json=body) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data: ") and line != "data: [DONE]":
                    chunk = json.loads(line[6:])
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    token = delta.get("content", "")
                    if token:
                        yield token


async def _stream_ollama(
    messages: list[ChatMessage],
    temperature: float | None,
    max_tokens: int | None,
) -> AsyncGenerator[str, None]:
    """
    Стриминг через локальный Ollama.

    Документация: https://github.com/ollama/ollama/blob/main/docs/api.md
    """
    url = f"{settings.OLLAMA_BASE_URL}/api/chat"
    body = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "stream": True,
        "options": {
            "temperature": temperature or 0.7,
            "num_predict": max_tokens or 4096,
        },
    }

    async with httpx.AsyncClient(timeout=300.0) as client:
        async with client.stream("POST", url, json=body) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.strip():
                    data = json.loads(line)
                    token = data.get("message", {}).get("content", "")
                    if token:
                        yield token


async def _stream_openai(
    messages: list[ChatMessage],
    temperature: float | None,
    max_tokens: int | None,
    model: str | None = None,
) -> AsyncGenerator[str, None]:
    """
    Стриминг через OpenAI-compatible API (OpenAI, OpenRouter, Any).

    Документация: https://platform.openai.com/docs/api-reference/chat
    """
    client = AsyncOpenAI(
        api_key=settings.OPENAI_API_KEY or "sk-no-key-required",
        base_url=settings.OPENAI_BASE_URL or "https://api.openai.com/v1",
    )

    actual_model = model or settings.OPENAI_MODEL
    stream = await client.chat.completions.create(
        model=actual_model,
        messages=messages,  # type: ignore[arg-type]
        temperature=temperature or 0.7,
        max_tokens=max_tokens or 4096,
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta if chunk.choices else None
        if delta and delta.content:
            yield delta.content


# ─── Маршрутизация ────────────────────────────────────────────────────────────

# Карта: префикс модели → функция стриминга
PROVIDER_MAP: dict[str, str] = {
    "yandexgpt": "yandexgpt",
    "yandex": "yandexgpt",
    "gigachat": "gigachat",
    "giga": "gigachat",
    "ollama": "ollama",
}


def _detect_provider(model: str) -> str:
    """Определить провайдера по имени модели."""
    for prefix, provider in PROVIDER_MAP.items():
        if model.lower().startswith(prefix):
            return provider
    # По умолчанию — OpenAI-совместимый
    return "openai"


async def stream_chat(
    model: str,
    messages: list[ChatMessage],
    temperature: float | None = None,
    max_tokens: int | None = None,
) -> AsyncGenerator[str, None]:
    """
    Потоковая генерация ответа LLM.

    Автоматически выбирает провайдера на основе имени модели.

    Args:
        model: Имя модели (yandexgpt/pro, gigachat/latest, ollama/llama3, gpt-4o…).
        messages: Список сообщений [{"role": "...", "content": "..."}].
        temperature: Температура генерации (0.0–2.0).
        max_tokens: Максимальное количество токенов в ответе.

    Yields:
        Токены текста по мере генерации.

    Raises:
        ValueError: Если неизвестный провайдер.
        httpx.HTTPError: Если ошибка HTTP при запросе к LLM.
    """
    provider = _detect_provider(model)

    if provider == "yandexgpt":
        async for token in _stream_yandexgpt(messages, temperature, max_tokens):
            yield token
    elif provider == "gigachat":
        async for token in _stream_gigachat(messages, temperature, max_tokens):
            yield token
    elif provider == "ollama":
        async for token in _stream_ollama(messages, temperature, max_tokens):
            yield token
    else:  # openai-compat
        async for token in _stream_openai(messages, temperature, max_tokens, model):
            yield token