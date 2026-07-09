/**
 * RegisterForm — форма регистрации.
 * Используется на /register странице.
 */

'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { RegisterData } from '@/types/auth'

interface RegisterFormProps {
  /** Редирект после успешной регистрации */
  onSuccess?: () => void
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuth()
  const [form, setForm] = useState<RegisterData>({
    email: '',
    password: '',
    fullName: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  /** Валидация формы */
  const validate = (): boolean => {
    if (!form.fullName.trim()) {
      setValidationError('Введите имя')
      return false
    }
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
    if (form.password.length < 8) {
      setValidationError('Пароль должен быть не менее 8 символов')
      return false
    }
    if (form.password !== confirmPassword) {
      setValidationError('Пароли не совпадают')
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
      await register(form)
      onSuccess?.()
    } catch {
      // Ошибка уже установлена в контексте
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Имя */}
      <Input
        label="Полное имя"
        type="text"
        placeholder="Иван Иванов"
        value={form.fullName}
        onChange={(e) => {
          setForm((prev) => ({ ...prev, fullName: e.target.value }))
          setValidationError(null)
        }}
        leftIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        autoComplete="name"
        required
      />

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
        placeholder="Минимум 8 символов"
        value={form.password}
        onChange={(e) => {
          setForm((prev) => ({ ...prev, password: e.target.value }))
          setValidationError(null)
        }}
        hint="Минимум 8 символов"
        leftIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
        autoComplete="new-password"
        required
      />

      {/* Подтверждение пароля */}
      <Input
        label="Подтвердите пароль"
        type="password"
        placeholder="Повторите пароль"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value)
          setValidationError(null)
        }}
        error={validationError || error?.message || undefined}
        leftIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        autoComplete="new-password"
        required
      />

      {/* Кнопка регистрации */}
      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isLoading}
      >
        Создать аккаунт
      </Button>

      {/* Условия */}
      <p className="text-xs text-surface-500 text-center">
        Регистрируясь, вы принимаете{' '}
        <a href="#" className="text-primary-400 hover:text-primary-300 underline">
          условия использования
        </a>{' '}
        и{' '}
        <a href="#" className="text-primary-400 hover:text-primary-300 underline">
          политику конфиденциальности
        </a>
      </p>
    </form>
  )
}