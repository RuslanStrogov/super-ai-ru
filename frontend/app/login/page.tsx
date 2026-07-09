/**
 * Страница входа — /login.
 * SSR для SEO. Использует LoginForm компонент.
 */

import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Градиентный фон */}
      <div className="fixed inset-0 bg-gradient-to-br from-surface-900 via-surface-900 to-primary-950/30 pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Шапка */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold text-surface-100">Super AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-surface-100">Добро пожаловать</h1>
          <p className="text-surface-400 mt-1">Войдите в свой аккаунт</p>
        </div>

        {/* Форма */}
        <div className="bg-surface-800/60 backdrop-blur-xl border border-surface-700/50 rounded-2xl p-8">
          <LoginForm onSuccess={() => window.location.href = '/chat'} />

          {/* Ссылка на регистрацию */}
          <p className="text-center text-sm text-surface-400 mt-6">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}