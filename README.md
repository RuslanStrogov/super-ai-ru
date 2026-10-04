# 🧠 Super AI RU

> **Российский аналог Abacus.ai** — единая AI-платформа для профессионалов и Enterprise

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy](https://github.com/RuslanStrogov/super-ai-ru/actions/workflows/deploy.yml/badge.svg)](https://github.com/RuslanStrogov/super-ai-ru/actions/workflows/deploy.yml)

---

## 🌐 Продакшен

**Frontend**: https://ai.strogov.com  
**API Docs**: https://ai.strogov.com/docs  
**Swagger**: https://ai.strogov.com/openapi.json

**Локальные Ollama модели**: `ollama/phi4-mini`, `ollama/qwen2:1.5b`, `ollama/phi3`, `ollama/tinyllama`, `ollama/stablelm-zephyr`, `ollama/minimax-m3`

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

### Локальная разработка (PC1)

```bash
# Клонировать
git clone https://github.com/RuslanStrogov/super-ai-ru.git
cd super-ai-ru

# Инфраструктура (PostgreSQL + Redis + Qdrant)
cd backend
docker compose up -d

# Backend
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env
# Отредактировать .env (добавить API ключи)
alembic -c alembic/alembic.ini upgrade head
uvicorn app.main:app --reload --port 8000

# Frontend (в новом окне)
cd frontend
npm install
npm run dev
```

### Production (Ubuntu 24.04)

```bash
# Сервер автоматически деплоится через GitHub Actions
# При push в master → автодеплой на .66

# Ручной запуск:
ssh ruslan@192.168.10.66
cd /mnt/data/super-ai

# Backend
export PYTHONPATH=/mnt/data/super-ai/backend:$PYTHONPATH
cd backend && source venv/bin/activate
pm2 start start.sh --name super-ai-api

# Frontend
cd ../frontend
pm2 start start.sh --name super-ai-web

# Мониторинг
pm2 list
pm2 logs super-ai-api
pm2 logs super-ai-web
```

---

## 📁 Структура

```
super-ai-ru/
├── .github/workflows/deploy.yml   # 🔄 Auto-deploy на .66
├── backend/                        # 🧱 FastAPI + Python
│   ├── app/
│   │   ├── main.py                 # FastAPI entry
│   │   ├── core/                   # config, database, security, deps
│   │   ├── models/                 # SQLAlchemy: User, Chat, Agent, Doc...
│   │   ├── schemas/                # Pydantic схемы
│   │   ├── api/v1/                 # auth, chat, agents, rag, billing
│   │   └── services/              # LLM Router, RAG Engine, Auth
│   ├── alembic/                    # Миграции
│   ├── docker-compose.yml          # PG + Redis + Qdrant
│   └── requirements.txt
├── frontend/                       # 🎨 Next.js 14 + TypeScript + Tailwind
│   ├── app/                        # pages: chat, agents, dashboard, auth
│   ├── components/                 # UI Kit + Chat + Agents + Auth
│   ├── lib/                        # api-client, sse, auth, utils
│   ├── hooks/                      # useChat (SSE), useAuth, useConversations
│   └── types/                      # chat, agent, auth types
└── docs/                           # 📘 Исследования и документация
```

---

## 🔧 API Endpoints

| Endpoint | Method | Описание |
|----------|-------|---------|
| `/api/v1/auth/register` | POST | Регистрация |
| `/api/v1/auth/login` | POST | Вход (JWT) |
| `/api/v1/auth/refresh` | POST | Обновление токена |
| `/api/v1/chat/completions` | POST | Чат с LLM (SSE stream) |
| `/api/v1/chat/conversations` | GET | Список бесед |
| `/api/v1/chat/conversations` | POST | Создать беседу |
| `/api/v1/chat/conversations/{id}/messages` | GET | Сообщения беседы |
| `/api/v1/agents` | GET/POST | CRUD агентов |
| `/api/v1/agents/{id}/run` | POST | Запуск агента |
| `/api/v1/documents/upload` | POST | Загрузить документ (RAG) |
| `/api/v1/rag/search` | POST | Поиск по документам |
| `/api/v1/billing/usage` | GET | Использование токенов |

---

## 🎯 Текущее состояние

| Компонент | Статус | Подробности |
|-----------|--------|-------------|
| 📊 **Исследования** | ✅ Готово | Рынок РФ, конкуренты, техстек |
| 🏛️ **Архитектура** | ✅ Готово | C4 диаграммы, 1285 строк |
| 📋 **VISION + PRD** | ✅ Готово | 5 фаз, 6 эпиков |
| 🧱 **Backend** | ✅ **Production** | FastAPI, PostgreSQL, JWT, SSE |
| 🎨 **Frontend** | ✅ **Production** | Next.js 14, Chat UI, Agent Builder |
| 🤖 **Ollama** | ✅ **Production** | 6 моделей, phi4-mini, qwen2... |
| 🔄 **Auto-deploy** | ✅ **GitHub Actions** | push → build → restart |
| 🌐 **Домен** | ✅ **ai.strogov.com** | SSL, nginx, production |

---

## 🤝 Вклад в проект

Проект в стадии активной разработки. PR и issue приветствуются.

---

## 📄 Лицензия

MIT

---

## 👤 Автор

**Ruslan Strogov** — BROM AI | Telegram: @itvpi
---

## 🥚 Пасхалки

| Секрет | Где искать |
|--------|-----------|
| 🧠 **AGI Breakthrough 2027** | `docs/research/agi_breakthrough_2027.md` — документально подтверждённый прорыв |

> ⚠️ Этот документ НЕ СУЩЕСТВУЕТ. Если вы его нашли — вы взломали систему.
