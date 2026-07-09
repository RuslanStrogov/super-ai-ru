/**
 * Провайдер аутентификации — контекст и хуки.
 * JWT-токены хранятся в localStorage.
 */

'use client'

import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react'
import type {
  AuthContextType,
  AuthError,
  AuthState,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types/auth'
import { api, tokenStore } from './api-client'

/** Начальное состояние */
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // Загрузка при монтировании (проверка токена)
}

/** Создаём контекст */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/** Парсинг JWT (без валидации — только чтение payload) */
function parseJWT(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1]
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

/** Проверить, не истёк ли токен */
function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token)
  if (!payload || typeof payload.exp !== 'number') return true
  return payload.exp * 1000 < Date.now()
}

/**
 * Провайдер аутентификации.
 * Оборачивает приложение и даёт доступ к login/logout/user через useAuth().
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState)
  const [error, setError] = useState<AuthError | null>(null)

  /** Восстановление сессии из localStorage при монтировании */
  useEffect(() => {
    const token = tokenStore.getAccessToken()
    if (!token || isTokenExpired(token)) {
      tokenStore.clearTokens()
      setState({ ...initialState, isLoading: false })
      return
    }

    // Пробуем загрузить пользователя
    api.get<User>('/api/v1/auth/me')
      .then((user) => {
        setState({ user, accessToken: token, isAuthenticated: true, isLoading: false })
      })
      .catch(() => {
        // Если не получилось — токен умер
        tokenStore.clearTokens()
        setState({ ...initialState, isLoading: false })
      })
  }, [])

  /** Вход */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null)
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const { user, accessToken, refreshToken } = await api.post<{
        user: User
        accessToken: string
        refreshToken: string
      }>('/api/v1/auth/login', credentials)

      tokenStore.setTokens(accessToken, refreshToken)
      setState({ user, accessToken, isAuthenticated: true, isLoading: false })
    } catch (err) {
      const authError: AuthError = {
        code: 'INVALID_CREDENTIALS',
        message: err instanceof Error ? err.message : 'Ошибка входа',
      }
      setError(authError)
      setState((prev) => ({ ...prev, isLoading: false }))
      throw authError
    }
  }, [])

  /** Регистрация */
  const register = useCallback(async (data: RegisterData) => {
    setError(null)
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const { user, accessToken, refreshToken } = await api.post<{
        user: User
        accessToken: string
        refreshToken: string
      }>('/api/v1/auth/register', data)

      tokenStore.setTokens(accessToken, refreshToken)
      setState({ user, accessToken, isAuthenticated: true, isLoading: false })
    } catch (err) {
      const authError: AuthError = {
        code: 'EMAIL_EXISTS',
        message: err instanceof Error ? err.message : 'Ошибка регистрации',
      }
      setError(authError)
      setState((prev) => ({ ...prev, isLoading: false }))
      throw authError
    }
  }, [])

  /** Выход */
  const logout = useCallback(async () => {
    try {
      await api.post('/api/v1/auth/logout', {}, { skipAuth: true })
    } catch {
      // Игнорируем ошибки при выходе
    }
    tokenStore.clearTokens()
    setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false })
    setError(null)
  }, [])

  /** Принудительный refresh (можно вызывать вручную) */
  const refreshAuth = useCallback(async () => {
    try {
      const token = tokenStore.getAccessToken()
      if (!token) return
      const user = await api.get<User>('/api/v1/auth/me')
      setState({ user, accessToken: token, isAuthenticated: true, isLoading: false })
    } catch {
      await logout()
    }
  }, [logout])

  const clearError = useCallback(() => setError(null), [])

  /** Мемоизированное значение контекста */
  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshAuth,
      clearError,
      error,
    }),
    [state, login, register, logout, refreshAuth, clearError, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Хук для доступа к контексту аутентификации */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}