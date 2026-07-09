# 🌐 API Спецификация — Super AI RU

> Файл: `docs/tech/api.md`
> Статус: Черновик v1

---

## 1. API Дизайн — принципы

| Параметр | Значение |
|----------|---------|
| **Протокол** | HTTP/2 REST + WebSocket (Streaming) |
| **Базовый URL** | `https://api.super-ai.ru/v1` |
| **Формат** | JSON (request/response) |
| **Авторизация** | Bearer JWT (User) + API Key (Service) |
| **Пагинация** | cursor-based (`?cursor=...&limit=50`) |
| **Rate limit** | 100 req/min (Pro), 1000 req/min (Enterprise) |
| **Idempotency** | `Idempotency-Key` header |

---

## 2. Аутентификация

### POST /v1/auth/register
```json
// Request
{ "email": "user@example.com", "password": "...", "full_name": "Иван" }
// Response 201
{ "user_id": "uuid", "email": "...", "token": "jwt..." }
```

### POST /v1/auth/login
```json
// Request
{ "email": "...", "password": "..." }
// Response 200
{ "token": "jwt...", "refresh_token": "...", "expires_in": 86400 }
```

### POST /v1/auth/refresh
```json
// Request
{ "refresh_token": "..." }
// Response 200
{ "token": "jwt...", "expires_in": 86400 }
```

### GET /v1/auth/me
```json
// Response 200
{ "user_id": "uuid", "email": "...", "full_name": "...", "plan": "pro", "api_calls_used": 150, "api_calls_limit": 5000 }
```

---

## 3. Chat (LLM)

### POST /v1/chat/completions — потоковый чат

**Request:**
```json
{
    "model": "yandexgpt-lite",
    "messages": [
        {"role": "system", "content": "Ты AI ассистент."},
        {"role": "user", "content": "Расскажи про ИИ в России"}
    ],
    "stream": true,
    "temperature": 0.7,
    "max_tokens": 4096,
    "conversation_id": "uuid"  // опционально, новая если null
}
```

**Response (stream — SSE):**
```json
// event: chunk
// data: {"type": "text", "content": "В России...", "tokens": 5}

// event: done  
// data: {"type": "done", "usage": {"tokens_in": 25, "tokens_out": 150}, "conversation_id": "uuid"}

// event: error
// data: {"type": "error", "code": "model_overloaded", "message": "Модель перегружена"}
```

**Response (non-stream — JSON):**
```json
{
    "id": "msg_uuid",
    "model": "yandexgpt-lite",
    "role": "assistant",
    "content": "В России ИИ развивается...",
    "usage": {"tokens_in": 25, "tokens_out": 150},
    "latency_ms": 2340,
    "conversation_id": "uuid",
    "created_at": "2026-07-09T12:00:00Z"
}
```

### GET /v1/models — список доступных моделей

```json
// Response
{
    "models": [
        {"id": "yandexgpt-lite",         "provider": "yandex",    "type": "chat",    "context": 8000,  "pricing": "0.5₽/1K"},
        {"id": "yandexgpt-pro",          "provider": "yandex",    "type": "chat",    "context": 32000, "pricing": "2₽/1K"},
        {"id": "gigachat-pro",           "provider": "sber",      "type": "chat",    "context": 32000, "pricing": "1.5₽/1K"},
        {"id": "deepseek-v3",            "provider": "deepseek",  "type": "chat",    "context": 64000, "pricing": "0.8₽/1K"},
        {"id": "qwen-72b",              "provider": "alibaba",   "type": "chat",    "context": 32000, "pricing": "1₽/1K"},
        {"id": "llama-3-70b",           "provider": "vllm",      "type": "chat",    "context": 32000, "pricing": "0.3₽/1K"},
        {"id": "mistral-large",         "provider": "vllm",      "type": "chat",    "context": 32000, "pricing": "0.3₽/1K"},
        {"id": "gpt-4o-mini",           "provider": "openrouter", "type": "chat",   "context": 128000, "pricing": "1.5₽/1K"}
    ]
}
```

---

## 4. RAG — работа с документами

### POST /v1/documents/upload — загрузить документ

```json
// Request: multipart/form-data
// file: document.pdf (или .docx, .txt, .csv, .xlsx)
// Response 201
{
    "document_id": "uuid",
    "filename": "document.pdf",
    "size_bytes": 123456,
    "status": "processing",
    "chunks_estimated": 15
}
```

### GET /v1/documents — список документов

```json
// Response
{
    "documents": [
        {"id": "uuid", "filename": "...", "status": "indexed", "chunk_count": 15, "created_at": "...", "size_bytes": 123456}
    ],
    "cursor": "..."
}
```

### POST /v1/rag/query — поиск по документам

```json
// Request
{
    "query": "Какие тренды AI в России?",
    "document_ids": ["uuid1", "uuid2"],  // если пусто — по всем
    "top_k": 5,
    "min_score": 0.4
}
// Response
{
    "results": [
        {
            "chunk_id": "uuid",
            "document_id": "uuid",
            "document_name": "report.pdf",
            "score": 0.89,
            "text": "Рынок AI в РФ составил 1.15 трлн...",
            "metadata": {"page": 5, "heading": "Размер рынка"}
        }
    ],
    "total_tokens": 500
}
```

### DELETE /v1/documents/{document_id} — удалить документ

```json
// Response 204 — No Content
```

---

## 5. Conversations (история)

### GET /v1/conversations — список диалогов

```json
// Response
{
    "conversations": [
        {"id": "uuid", "title": "Обсуждение AI в РФ", "model": "yandexgpt-pro", "message_count": 12, "created_at": "..."}
    ],
    "cursor": "next_page_token"
}
```

### GET /v1/conversations/{id} — получить диалог

```json
// Response
{
    "id": "uuid",
    "title": "...",
    "messages": [
        {"role": "user", "content": "...", "created_at": "..."},
        {"role": "assistant", "content": "...", "model": "yandexgpt-pro", "tokens_out": 100}
    ]
}
```

### DELETE /v1/conversations/{id} — удалить диалог
```json
// Response 204
```

---

## 6. Agents

### POST /v1/agents — создать агента

```json
// Request
{
    "name": "Аналитик рынка",
    "description": "Помогает анализировать рыночные данные",
    "system_prompt": "Ты аналитик...",
    "model": "deepseek-v3",
    "tools": ["web_search", "rag_search", "code_executor"],
    "config": {"temperature": 0.3, "max_tokens": 4096}
}
// Response 201
{ "agent_id": "uuid", "status": "active", "api_endpoint": "https://api.super-ai.ru/v1/agents/{uuid}/chat" }
```

### POST /v1/agents/{id}/chat — чат с агентом

```json
// Request
{
    "messages": [{"role": "user", "content": "Проанализируй рынок AI в РФ"}],
    "stream": true
}
// Response: SSE stream (как /v1/chat/completions)
```

### GET /v1/agents — список агентов
```json
// Response
{ "agents": [{"id": "uuid", "name": "...", "model": "...", "is_active": true, "created_at": "..."}] }
```

---

## 7. Admin

### GET /v1/admin/users — список пользователей (только admin)

```json
// Query: ?plan=pro&page=1&limit=50
// Response
{
    "users": [
        {"id": "uuid", "email": "...", "plan": "pro", "api_calls_used": 500, "is_active": true, "created_at": "..."}
    ],
    "total": 150,
    "page": 1
}
```

### GET /v1/admin/metrics — метрики системы

```json
// Response
{
    "requests_1h": {"total": 1234, "success": 1200, "error": 34},
    "active_users_24h": 456,
    "total_users": 12345,
    "gpu_utilization": 72.5,
    "models_usage": [
        {"model": "yandexgpt-pro", "requests_1h": 450},
        {"model": "deepseek-v3", "requests_1h": 320}
    ]
}
```

---

## 8. WebSocket (Streaming)

### Подключение
```
wss://api.super-ai.ru/v1/ws?token=jwt_token
```

### Сообщение от клиента:
```json
{
    "type": "chat",
    "model": "yandexgpt-pro",
    "messages": [{"role": "user", "content": "Привет"}],
    "stream": true
}
```

### Сообщение от сервера:
```json
{"type": "token", "content": "Здравс", "index": 0}
{"type": "token", "content": "твуйте", "index": 1}
{"type": "done", "usage": {"tokens_in": 5, "tokens_out": 20}, "conversation_id": "uuid"}
{"type": "error", "code": "...", "message": "..."}
```

---

## 9. Rate Limiting

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1625817600
```

### Лимиты по тарифам:

| Endpoint | Free | Pro | Team | Enterprise |
|----------|:----:|:---:|:----:|:----------:|
| `/chat/completions` | 10/min | 100/min | 300/min | 1000/min |
| `/documents/upload` | 5/day | 50/day | 200/day | 1000/day |
| `/rag/query` | 10/min | 100/min | 300/min | 1000/min |
| `/agents/*` | — | 10/min | 50/min | 200/min |

---

## 10. Коды ошибок

| HTTP | Code | Описание |
|:----:|------|----------|
| 400 | `invalid_request` | Неверный формат запроса |
| 401 | `unauthorized` | Требуется авторизация |
| 403 | `forbidden` | Недостаточно прав |
| 404 | `not_found` | Ресурс не найден |
| 422 | `validation_error` | Ошибка валидации |
| 429 | `rate_limited` | Превышен лимит запросов |
| 500 | `internal_error` | Внутренняя ошибка |
| 502 | `model_error` | Ошибка LLM провайдера |
| 503 | `maintenance` | Сервис на обслуживании |