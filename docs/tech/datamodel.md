# 🗄️ Модель данных — Super AI RU

> Файл: `docs/tech/datamodel.md`
> Статус: Черновик v1

---

## 1. PostgreSQL — основная БД

### 1.1 Users

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255),
    full_name       VARCHAR(255),
    avatar_url      TEXT,
    role            VARCHAR(20) NOT NULL DEFAULT 'user', -- user | admin | enterprise_admin
    is_active       BOOLEAN DEFAULT true,
    is_verified     BOOLEAN DEFAULT false,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 1.2 Subscriptions

```sql
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    plan            VARCHAR(20) NOT NULL, -- free | pro | team | enterprise
    status          VARCHAR(20) NOT NULL DEFAULT 'active', -- active | canceled | past_due | trialing
    api_calls_limit BIGINT DEFAULT 1000,
    api_calls_used  BIGINT DEFAULT 0,
    period_start    TIMESTAMPTZ,
    period_end      TIMESTAMPTZ,
    auto_renew      BOOLEAN DEFAULT true,
    stripe_customer_id VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### 1.3 Conversations (History)

```sql
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    title           VARCHAR(500),
    model           VARCHAR(100),          -- последняя используемая модель
    message_count   INTEGER DEFAULT 0,
    total_tokens    BIGINT DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    is_archived     BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conv_user ON conversations(user_id, created_at DESC);
CREATE INDEX idx_conv_archived ON conversations(user_id, is_archived);
```

### 1.4 Messages

```sql
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL, -- user | assistant | system | tool
    content         TEXT NOT NULL,
    model           VARCHAR(100),          -- какая модель ответила
    tokens_in       INTEGER DEFAULT 0,
    tokens_out      INTEGER DEFAULT 0,
    latency_ms      INTEGER,              -- время ответа
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_msg_conv ON messages(conversation_id, created_at);
CREATE INDEX idx_msg_model ON messages(model);
-- Полнотекстовый поиск по сообщениям
CREATE INDEX idx_msg_content_fts ON messages USING gin(to_tsvector('russian', content));
```

### 1.5 Documents (RAG)

```sql
CREATE TABLE documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    filename        VARCHAR(500) NOT NULL,
    original_name   VARCHAR(500) NOT NULL,
    mime_type       VARCHAR(100),
    size_bytes      BIGINT,
    storage_path    TEXT NOT NULL,          -- S3 key
    chunk_count     INTEGER DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'processing', -- processing | indexed | failed
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_docs_user ON documents(user_id);
CREATE INDEX idx_docs_status ON documents(status);
```

### 1.6 API Keys

```sql
CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    name            VARCHAR(100),
    key_prefix      VARCHAR(10),           -- первые 10 символов ключа
    key_hash        VARCHAR(255) NOT NULL, -- bcrypt хеш ключа
    permissions     JSONB DEFAULT '["chat"]',
    is_active       BOOLEAN DEFAULT true,
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_apikeys_user ON api_keys(user_id);
CREATE INDEX idx_apikeys_prefix ON api_keys(key_prefix);
```

### 1.7 Agents

```sql
CREATE TABLE agents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    system_prompt   TEXT,
    model           VARCHAR(100),
    tools           JSONB DEFAULT '[]',    -- какие инструменты доступны
    config          JSONB DEFAULT '{}',    -- temperature, max_tokens, etc.
    is_public       BOOLEAN DEFAULT false,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agents_user ON agents(user_id);
CREATE INDEX idx_agents_public ON agents(is_public) WHERE is_public = true;
```

---

## 2. ClickHouse — аналитика и логи

### 2.1 LLM Request Logs

```sql
CREATE TABLE llm_requests (
    timestamp       DateTime64(3) DEFAULT now64(),
    user_id         UUID,
    model           String,
    provider        String,               -- yandexgpt, gigachat, deepseek, vllm
    tokens_in       UInt32,
    tokens_out      UInt32,
    latency_ms      UInt32,
    status          String,               -- success | error | timeout
    error_message   String DEFAULT '',
    cost_rub        Float32 DEFAULT 0,
    conversation_id UUID,
    agent_id        UUID DEFAULT '00000000-0000-0000-0000-000000000000'
) ENGINE = MergeTree()
ORDER BY (timestamp, model)
TTL timestamp + INTERVAL 90 DAY;
```

### 2.2 User Activity

```sql
CREATE TABLE user_activity (
    date            Date,
    user_id         UUID,
    plan            String,
    requests_count  UInt32,
    tokens_total    UInt64,
    sessions_count  UInt32,
    documents_count UInt32
) ENGINE = SummingMergeTree()
ORDER BY (date, plan, user_id);
```

### 2.3 Error Logs

```sql
CREATE TABLE error_logs (
    timestamp       DateTime64(3) DEFAULT now64(),
    service         String,               -- api-gateway | llm-router | rag-engine | agent-runtime
    level           String,               -- error | warning | critical
    error_code      String,
    message         String,
    traceback       String,
    user_id         UUID,
    request_id      String,
    metadata        String DEFAULT '{}'
) ENGINE = MergeTree()
ORDER BY (timestamp, service)
TTL timestamp + INTERVAL 30 DAY;
```

---

## 3. Qdrant — векторные эмбеддинги

### Коллекции:

| Коллекция | Назначение | Размерность | Расстояние | Шарды |
|-----------|-----------|-------------|-----------|-------|
| `documents` | Эмбеддинги документов (RAG) | 1024 (bge-m3) | Cosine | 4 |
| `users` | Эмбеддинги пользователей (personalization) | 768 | Cosine | 2 |
| `agents` | Эмбеддинги агентов (поиск) | 768 | Cosine | 2 |

### Payload schema (documents):

```json
{
    "document_id": "uuid",
    "user_id": "uuid",
    "chunk_index": 0,
    "text": "содержимое чанка",
    "metadata": {
        "filename": "doc.pdf",
        "page": 5,
        "heading": "Введение",
        "mime_type": "application/pdf"
    }
}
```

---

## 4. Redis — кэш

| Ключ | Значение | TTL | Назначение |
|------|----------|-----|-----------|
| `session:{session_id}` | JSON сессии | 24h | Сессии пользователей |
| `cache:llm:{model}:{prompt_hash}` | JSON ответа | 1h | Кэш повторяющихся запросов |
| `rate:{user_id}:{endpoint}` | Счётчик | 1s/1m/1h | Rate limiting |
| `lock:fine_tune:{model_id}` | bool | 30m | Блокировка одновременного fine-tuning |
| `queue:llm:{provider}` | JSON | — | Очередь запросов к LLM |

---

## 5. ER-диаграмма (текстовая)

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    users     │──1:N──│  conversations   │──1:N──│     messages     │
└─────────────┘       └──────────────────┘       └──────────────────┘
       │ 1:N                                                │
       │                                                    │
       │ 1:N                                                │
       ├──────────────────┐                                 │
       │                  │                                 │
┌──────────────┐  ┌──────────────┐                   ┌───────────┐
│  documents   │  │  api_keys    │                   │   agents  │
└──────────────┘  └──────────────┘                   └───────────┘
       │
       │ 1:1 (Qdrant)
       ▼
┌──────────────┐
│  embeddings  │  (Qdrant collection)
└──────────────┘

┌──────────────────┐
│  llm_requests    │  (ClickHouse — только insert)
└──────────────────┘

┌──────────────────┐
│  subscriptions   │  ───1:1─── users
└──────────────────┘
```

---

## 6. Миграции

| Инструмент | Назначение |
|-----------|-----------|
| Alembic | PostgreSQL миграции |
| ClickHouse Migration Tool | ClickHouse схемы |
| Qdrant REST API | Создание коллекций при старте |