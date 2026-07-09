/**
 * Главная страница — Landing.
 * SSR для быстрой загрузки. Показывает герой-секцию,
 * преимущества платформы и CTA.
 */

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Навигация */}
      <header className="border-b border-surface-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Логотип */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">S</span>
            </div>
            <span className="font-bold text-surface-100 text-lg">Super AI</span>
          </Link>

          {/* Навигация */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-surface-300 hover:text-surface-100 transition-colors"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors"
            >
              Начать бесплатно
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero секция */}
      <main className="flex-1">
        {/* Герой */}
        <section className="relative overflow-hidden">
          {/* Градиентный фон */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-transparent to-surface-900 pointer-events-none" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="text-center max-w-3xl mx-auto">
              {/* Бейдж */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-sm text-primary-300 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                Российская AI-платформа
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="gradient-text">Super AI</span>
                <br />
                <span className="text-surface-100">Единая платформа искусственного интеллекта</span>
              </h1>

              <p className="text-lg text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Чат с ведущими LLM, визуальный конструктор AI-агентов,
                RAG-движок и MLOps — всё в одном месте. Российская разработка,
                работающая с YandexGPT, GigaChat, DeepSeek и open-source моделями.
              </p>

              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base transition-all shadow-lg shadow-primary-600/30"
                >
                  Начать бесплатно
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 font-semibold text-base border border-surface-700 transition-all"
                >
                  Войти
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Возможности */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-surface-100 mb-4">
              Всё, что нужно для работы с AI
            </h2>
            <p className="text-surface-400 text-center mb-12 max-w-xl mx-auto">
              Единый интерфейс для всех AI-возможностей вашей команды
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-surface-800/50 border border-surface-700/50 hover:border-surface-600 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-violet-600/20 border border-primary-500/20 flex items-center justify-center mb-4">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-surface-100 mb-2">{feature.title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Поддерживаемые модели */}
        <section className="py-16 bg-surface-900/50 border-y border-surface-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-semibold text-surface-300 mb-8">Поддерживаемые модели</h2>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {models.map((model) => (
                <div key={model.name} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${model.color}`} />
                  <span className="text-surface-400 font-medium">{model.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Футер */}
      <footer className="border-t border-surface-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">S</span>
            </div>
            <span className="text-sm text-surface-500">Super AI RU © 2024</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-surface-500 hover:text-surface-300 transition-colors">
              Документация
            </a>
            <a href="#" className="text-sm text-surface-500 hover:text-surface-300 transition-colors">
              API
            </a>
            <a href="#" className="text-sm text-surface-500 hover:text-surface-300 transition-colors">
              Поддержка
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

/** Данные для секции возможностей */
const features = [
  {
    icon: '💬',
    title: 'Super Assistant',
    description:
      'Единый чат-интерфейс ко всем поддерживаемым LLM. Streaming вывода, выбор модели, загрузка файлов, RAG.',
  },
  {
    icon: '🤖',
    title: 'AI-агенты',
    description:
      'Визуальный конструктор агентов на базе CrewAI. Системные промпты, выбор инструментов, выполнение в песочнице.',
  },
  {
    icon: '📚',
    title: 'RAG Engine',
    description:
      'Загружайте документы и получайте ответы на основе вашей базы знаний. Поддержка PDF, DOCX, TXT и других форматов.',
  },
  {
    icon: '🔧',
    title: 'MLOps',
    description:
      'AutoML, Fine-tuning, Model Registry. Управляйте жизненным циклом моделей от обучения до деплоя.',
  },
  {
    icon: '🎨',
    title: 'GenAI Studio',
    description:
      'Генерация изображений, кода и контента. Интеграция с YandexART, Stable Diffusion и другими моделями.',
  },
  {
    icon: '🔒',
    title: 'Безопасность',
    description:
      'Соответствие 152-ФЗ. SSO, RBAC, аудит доступа. Данные хранятся в Yandex Cloud на территории РФ.',
  },
]

/** Модели для секции "Поддерживаемые модели" */
const models = [
  { name: 'YandexGPT', color: 'bg-red-500' },
  { name: 'GigaChat', color: 'bg-emerald-500' },
  { name: 'DeepSeek', color: 'bg-blue-500' },
  { name: 'Llama 3', color: 'bg-violet-500' },
  { name: 'Qwen 2.5', color: 'bg-amber-500' },
  { name: 'Mistral', color: 'bg-cyan-500' },
]