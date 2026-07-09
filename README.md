# 🧠 Super AI RU

> **Российский аналог Abacus.ai** — единая AI-платформа для профессионалов и Enterprise

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📋 О проекте

Super AI RU — это open-source AI-платформа, объединяющая:

- 🤖 **Super Assistant** — единый чат-интерфейс ко всем LLM (YandexGPT, GigaChat, DeepSeek, open-source)
- 🧩 **AI Agent Platform** — конструктор AI-агентов с визуальным построением пайплайнов
- 📚 **RAG Engine** — Retrieval-Augmented Generation с поиском по документам
- ⚙️ **MLOps** — AutoML, Fine-tuning, Model Registry, мониторинг моделей
- 🎨 **GenAI Studio** — генерация изображений, видео, кода

**Сделано в России 🇷🇺**, для российского рынка, с учётом требований ФЗ-152.

---

## 🚀 Быстрый старт

```bash
# Клонировать
git clone https://github.com/RuslanStrogov/super-ai-ru.git
cd super-ai-ru

# Запустить инфраструктуру (PostgreSQL + Redis + Qdrant)
cd backend
docker compose up -d

# Установить зависимости backend
python -m venv venv
source venv/bin/activate  # или venv\Scripts\activate на Windows
pip install -r requirements.txt

# Настроить переменные
cp .env.example .env
# Отредактировать .env (API ключи YandexGPT, GigaChat...)

# Применить миграции
alembic upgrade head

# Запустить backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Установить зависимости frontend
cd ../frontend
npm install

# Запустить frontend
npm run dev
```

После запуска:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API docs (Swagger)**: http://localhost:8000/docs
- **Qdrant UI**: http://localhost:6333

---

## 📁 Структура репозитория

```
super-ai-ru/
├── README.md                         # Этот файл
├── LICENSE                           # MIT
│
├── backend/                          # 🧱 Backend (FastAPI + Python)
│   ├── app/
│   │   ├── main.py                   # FastAPI entry point
│   │   ├── core/                     # config, database, security, deps
│   │   ├── models/                   # SQLAlchemy модели (User, Chat, Agent...)
│   │   ├── schemas/                  # Pydantic схемы запросов/ответов
│   │   ├── api/v1/                   # REST эндпоинты (auth, chat, agents, rag, billing)
│   │   └── services/                 # Бизнес-логика (LLM Router, RAG, Auth)
│   ├── alembic/                      # Миграции БД
│   ├── docker-compose.yml            # PostgreSQL + Redis + Qdrant
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                         # 🎨 Frontend (Next.js 14 + TypeScript + Tailwind)
│   ├── app/                          # Next.js App Router
│   │   ├── chat/                     # Чат-интерфейс с SSE Streaming
│   │   ├── agents/                   # Agent Builder + запуск агентов
│   │   ├── dashboard/                # Метрики и статистика
│   │   ├── login/ & register/        # Страницы авторизации
│   │   └── layout.tsx                # Root layout (тёмная тема)
│   ├── components/                   # UI Kit + Chat + Auth + Agents
│   │   ├── ui/                       # Button, Input, Card, Modal, Sidebar...
│   │   ├── chat/                     # ChatWindow, MessageBubble, ChatInput...
│   │   ├── agents/                   # AgentBuilder, AgentCard, AgentRunView
│   │   └── auth/                     # LoginForm, RegisterForm
│   ├── lib/                          # api-client, sse, auth, utils
│   ├── hooks/                        # useChat, useAuth, useConversations
│   ├── types/                        # TypeScript интерфейсы
│   └── package.json
│
└── docs/                             # 📘 Документация
    ├── abacus_analysis_ru.md + PDF   # Полное исследование рынка
    ├── competitive_analysis.md       # Конкурентный анализ (15 платформ)
    ├── techstack_comparison.md       # Сравнение техстека
    ├── research_russian_market.md    # Рынок РФ (411 строк)
    ├── research_russian_platforms.md # Российские аналоги
    ├── design/
    │   ├── VISION.md                 # Product Vision + Roadmap
    │   └── PRD.md                    # Product Requirements (6 эпиков)
    └── tech/
        ├── ARCHITECTURE.md           # Архитектура (1285 строк, C4 диаграммы)
        ├── api.md                    # API спецификация
        └── datamodel.md              # Модель данных
```

---

## 🎯 Текущее состояние

| Компонент | Статус | Подробности |
|-----------|--------|-------------|
| 📊 **Исследования** | ✅ Готово | Аналитика Abacus.ai, рынок РФ, конкуренты, техстек |
| 🏛️ **Архитектура** | ✅ Готово | C4 диаграммы, схема БД, API, деплой (1285 строк) |
| 📋 **Product Design** | ✅ Готово | VISION (5 фаз), PRD (6 эпиков, 20 acceptance criteria) |
| 🧱 **Backend (API)** | ✅ **Готово** | FastAPI, SQLAlchemy, JWT auth, SSE chat, RAG, Docker Compose |
| 🎨 **Frontend (UI)** | ✅ **Готово** | Next.js 14, Chat UI с SSE, Agent Builder, тёмная тема |
| 🔗 **Интеграция** | ⏳ В процессе | Связка frontend ↔ backend |
| 🧪 **Docker Compose** | ⏳ В процессе | Запуск всех сервисов локально |

---

## 🔧 Технологический стек

| Компонент | Технология |
|-----------|-----------|
| **Язык backend** | Python 3.11+ (asyncio) |
| **Фреймворк** | FastAPI + Uvicorn |
| **ORM** | SQLAlchemy 2.0 (async) |
| **База данных** | PostgreSQL 16 |
| **Векторная БД** | Qdrant |
| **Кэш / Очереди** | Redis 7 |
| **Аналитика** | ClickHouse |
| **Язык frontend** | TypeScript (strict) |
| **Фреймворк** | Next.js 14 (App Router) |
| **Стилизация** | Tailwind CSS (dark mode) |
| **LLM шлюз** | LiteLLM + самописный роутер |
| **RAG** | LangChain + Qdrant + ruBERT |
| **Агенты** | CrewAI + самописный оркестратор |
| **Облако** | Yandex Cloud (деплой production) |

---

## 🧪 Как запустить локально (PC1)

```bash
# 1. Запустить сервисы
cd backend
docker compose up -d

# 2. Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Добавить API ключи в .env
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. Frontend (в новом окне)
cd frontend
npm install
npm run dev
```

Открой http://localhost:3000 — готово! 🎉

---

## 🤝 Вклад в проект

Проект в стадии активной разработки. Если хочешь помочь — открывай issue или PR.

---

## 📄 Лицензия

MIT — свободно для использования, изучения и модификации.

---

## 👤 Автор

**Ruslan Strogov** — BROM AI
Telegram: @itvpi