# Super AI RU — Frontend

Российская AI-платформа (аналог Abacus.ai).  
Фронтенд на **Next.js 14+** (App Router) + **TypeScript** + **Tailwind CSS**.

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка для production
npm run build

# Запуск production-сервера
npm run start
```

## Структура проекта

```
frontend/
├── app/                    # Next.js 14 App Router страницы
│   ├── layout.tsx          # Root layout с AuthProvider
│   ├── page.tsx            # Landing / Главная
│   ├── login/              # Страница входа
│   ├── register/           # Регистрация
│   ├── chat/               # Чат-интерфейс (SSE streaming)
│   │   ├── layout.tsx      # Layout с сайдбаром
│   │   ├── page.tsx        # Новый чат
│   │   └── [id]/           # Конкретный conversation
│   ├── agents/             # AI-агенты
│   │   ├── page.tsx        # Список агентов
│   │   └── [id]/           # Редактор / запуск агента
│   ├── dashboard/          # Дашборд с метриками
│   └── api/auth/           # NextAuth API routes
├── components/
│   ├── ui/                 # UI Kit (Button, Input, Card, Modal и т.д.)
│   ├── chat/               # Чат-компоненты (ChatWindow, MessageBubble и т.д.)
│   ├── agents/             # Компоненты агентов (AgentBuilder, AgentCard и т.д.)
│   └── auth/               # Формы входа/регистрации
├── lib/                    # Утилиты (api-client, auth, sse, utils)
├── hooks/                  # React хуки (useChat, useAuth, useConversations)
├── types/                  # TypeScript типы
└── public/                 # Статика (logo.svg)
```

## Конфигурация

Скопируйте `.env.example` в `.env.local` и настройте:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

## Технологии

- **Next.js 14** — App Router, SSR для публичных страниц, CSR для чата
- **TypeScript** — строгая типизация
- **Tailwind CSS** — тёмная тема, кастомные CSS переменные
- **SSE Streaming** — EventSource / ReadableStream для токенов LLM
- **JWT Auth** — авторизация через localStorage, авто-refresh токенов
- **Адаптив** — mobile-friendly, сайдбар скрывается на мобилках

## API

Бэкенд ожидается по адресу `/api/v1/`.  
Настройка прокси в `next.config.js`:

```js
async rewrites() {
  return [
    {
      source: '/api/v1/:path*',
      destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`,
    },
  ]
}
```

## Требования к окружению

- Node.js 18+
- npm 9+ или yarn 1.22+