/**
 * Root layout — корневой лейаут приложения.
 * Подключает глобальные стили, провайдеры (AuthProvider),
 * устанавливает тёмную тему по умолчанию.
 */

import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Super AI RU — Российская AI-платформа',
  description:
    'Super AI RU — единая платформа для чата с LLM, создания AI-агентов, RAG и MLOps. Российский аналог Abacus.ai.',
  keywords: ['AI', 'LLM', 'чат', 'агенты', 'RAG', 'MLOps', 'YandexGPT', 'GigaChat', 'DeepSeek'],
  openGraph: {
    title: 'Super AI RU — Российская AI-платформа',
    description: 'Чат, агенты, RAG и MLOps на одной платформе',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="dark">
      <head>
        {/* Google Fonts: Inter + JetBrains Mono */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}