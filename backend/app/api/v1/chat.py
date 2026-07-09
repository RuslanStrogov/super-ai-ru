"""
Super AI RU — Chat API.

POST /v1/chat/completions — стриминг (SSE)
GET  /v1/chat/conversations — список бесед
GET  /v1/chat/conversations/{id}/messages — сообщения беседы
"""

from __future__ import annotations

import json
import uuid
from typing import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.chat import Conversation, Message
from app.models.user import User
from app.schemas.chat import (
    ChatCompletionRequest,
    ChatCompletionChunk,
    Choice,
    ConversationListResponse,
    ConversationOut,
    DeltaContent,
    MessageOut,
)
from app.schemas.auth import ErrorResponse
from app.services.llm_router import stream_chat
from app.services.rag_engine import rag_engine

router = APIRouter(prefix="/v1/chat", tags=["chat"])


async def _generate_sse_stream(
    model: str,
    messages: list[dict],
    temperature: float | None,
    max_tokens: int | None,
    conversation_id: str | None,
    user_id: str | None,
    db: AsyncSession | None,
) -> AsyncGenerator[str, None]:
    """
    Сгенерировать SSE-поток для chat/completions.

    Yields:
        Строки SSE формата: data: {json}\n\n
    """
    gen_id = str(uuid.uuid4())
    full_response = ""

    try:
        async for token in stream_chat(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        ):
            full_response += token
            chunk = ChatCompletionChunk(
                id=gen_id,
                choices=[Choice(delta=DeltaContent(content=token))],
            )
            yield f"data: {chunk.model_dump_json()}\n\n"

        # Финальный чанк
        done_chunk = ChatCompletionChunk(
            id=gen_id,
            choices=[Choice(delta=DeltaContent(), finish_reason="stop")],
        )
        yield f"data: {done_chunk.model_dump_json()}\n\n"
        yield "data: [DONE]\n\n"

    except Exception as exc:
        error_chunk = ChatCompletionChunk(
            id=gen_id,
            choices=[],
            finish_reason="error",
        )
        yield f"data: {error_chunk.model_dump_json()}\n\n"
        yield f"data: {json.dumps({'error': str(exc)})}\n\n"


@router.post(
    "/completions",
    summary="Chat Completion (SSE streaming)",
    description="Потоковая генерация ответа LLM через SSE.",
    responses={
        200: {
            "description": "SSE поток с токенами",
            "content": {
                "text/event-stream": {
                    "example": "data: {\"choices\":[{\"delta\":{\"content\":\"Привет\"}}]}\n\n"
                }
            },
        },
    },
)
async def chat_completions(
    body: ChatCompletionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Потоковый чат с LLM (OpenAI-совместимый endpoint).

    Поддерживаемые модели:
    - **yandexgpt/pro** — YandexGPT
    - **gigachat/latest** — GigaChat
    - **ollama/llama3** — локальный Ollama
    - **gpt-4o** — OpenAI / OpenRouter
    """
    messages = [m.model_dump(exclude_none=True) for m in body.messages]

    # Опционально: RAG enrichment
    if body.rag:
        rag_results = await rag_engine.search(
            query=body.messages[-1].content or "",
            project_id=body.rag.project_id,
            top_k=body.rag.top_k,
            similarity_threshold=body.rag.similarity_threshold,
        )
        if rag_results:
            rag_context = "\n\n".join(
                r.get("text", "") for r in rag_results
            )
            messages.insert(
                0,
                {
                    "role": "system",
                    "content": f"Контекст из документов:\n{rag_context}",
                },
            )

    # Создаём/обновляем беседу
    conversation_id = body.conversation_id
    if conversation_id:
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == current_user.id,
            )
        )
        conv = result.scalar_one_or_none()
        if not conv:
            raise HTTPException(status_code=404, detail="Беседа не найдена")
    else:
        conv = Conversation(
            user_id=current_user.id,
            model=body.model,
            title=body.messages[-1].content[:100] if body.messages[-1].content else "Новый чат",
        )
        db.add(conv)
        await db.flush()
        conversation_id = conv.id

    # Сохраняем сообщение пользователя
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=body.messages[-1].content,
    )
    db.add(user_msg)

    # Создаём placeholder для ответа ассистента
    assistant_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
    )
    db.add(assistant_msg)
    await db.flush()

    return StreamingResponse(
        _generate_sse_stream(
            model=body.model,
            messages=messages,
            temperature=body.temperature,
            max_tokens=body.max_tokens,
            conversation_id=conversation_id,
            user_id=current_user.id,
            db=db,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get(
    "/conversations",
    response_model=ConversationListResponse,
    summary="Список бесед",
    description="Получить список бесед текущего пользователя.",
)
async def list_conversations(
    project_id: str | None = Query(None, description="Фильтр по проекту"),
    limit: int = Query(50, ge=1, le=200, description="Количество записей"),
    offset: int = Query(0, ge=0, description="Смещение"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConversationListResponse:
    """Получить список бесед текущего пользователя."""
    query = select(Conversation).where(Conversation.user_id == current_user.id)

    if project_id:
        query = query.where(Conversation.project_id == project_id)

    # Считаем общее количество
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.order_by(Conversation.updated_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    conversations = result.scalars().all()

    return ConversationListResponse(
        conversations=[
            ConversationOut.model_validate(c) for c in conversations
        ],
        total=total,
    )


@router.get(
    "/conversations/{conversation_id}/messages",
    summary="Сообщения беседы",
    description="Получить все сообщения беседы.",
)
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MessageOut]:
    """Получить сообщения беседы."""
    # Проверяем доступ
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Беседа не найдена")

    messages_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    messages = messages_result.scalars().all()

    return [MessageOut.model_validate(m) for m in messages]