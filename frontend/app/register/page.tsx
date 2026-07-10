/**
 * Страница регистрации — /register.
 * CSR — содержит интерактивную форму.
 */

'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Градиентный фон */}
      <div className="fixed inset-0 bg-gradient-to-br from-surface-900 via-surface-900 to-violet-950/30 pointer-events-none" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Шапка */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold text-surface-100">Super AI</span>
          </Link>
          <h1 className="text-2xl font-bold text-surface-100">Создать аккаунт</h1>
          <p className="text-surface-400 mt-1">Начните работу с AI-платформой</p>
        </div>

        {/* Форма */}
        <div className="bg-surface-800/60 backdrop-blur-xl border border-surface-700/50 rounded-2xl p-8">
          <RegisterForm onSuccess={() => router.push('/chat')} />

          {/* Ссылка на вход */}
          <p className="text-center text-sm text-surface-400 mt-6">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}