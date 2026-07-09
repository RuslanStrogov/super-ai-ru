/**
 * Хук авторизации — удобная обёртка над AuthContext.
 * Используется в компонентах для доступа к пользователю, login/logout.
 */

'use client'

import { useAuthContext } from '@/lib/auth'

export function useAuth() {
  const context = useAuthContext()

  return {
    /** Текущий пользователь (null если не авторизован) */
    user: context.user,
    /** JWT access token */
    accessToken: context.accessToken,
    /** Авторизован ли пользователь */
    isAuthenticated: context.isAuthenticated,
    /** Идёт ли загрузка */
    isLoading: context.isLoading,
    /** Ошибка авторизации */
    error: context.error,

    /** Вход в систему */
    login: context.login,
    /** Регистрация */
    register: context.register,
    /** Выход */
    logout: context.logout,
    /** Обновление данных пользователя */
    refreshAuth: context.refreshAuth,
    /** Очистка ошибки */
    clearError: context.clearError,
  }
}