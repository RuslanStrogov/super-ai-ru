/**
 * LoginForm — форма входа.
 * Используется на /login странице.
 */

'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { LoginCredentials } from '@/types/auth'

interface LoginFormProps {
  /** Редирект после успешного входа */
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth()
  const [form, setForm] = useState<LoginCredentials>({
    email: '',
    password: '',
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  /** Валидация формы */
  const validate = (): boolean => {
    if (!form.email.trim()) {
      setValidationError('Введите email')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setValidationError('Некорректный email')
      return false
    }
    if (!form.password) {
      setValidationError('Введите пароль')
      return false
    }
    if (form.password.length < 6) {
      setValidationError('Пароль должен быть не менее 6 символов')
      return false
    }
    return true
  }

  /** Отправка формы */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)
    clearError()

    if (!validate()) return

    try {
      await login(form)
      onSuccess?.()
    } catch {
      // Ошибка уже установлена в контексте
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => {
          setForm((prev) => ({ ...prev, email: e.target.value }))
          setValidationError(null)
        }}
        error={validationError || error?.message || undefined}
        leftIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        autoComplete="email"
        required
      />

      {/* Пароль */}
      <Input
        label="Пароль"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => {
          setForm((prev) => ({ ...prev, password: e.target.value }))
          setValidationError(null)
        }}
        leftIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
        autoComplete="current-password"
        required
      />

      {/* Кнопка входа */}
      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isLoading}
      >
        Войти
      </Button>
    </form>
  )
}