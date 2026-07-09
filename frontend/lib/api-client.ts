/**
 * API-клиент — fetch-обёртка с автоподстановкой JWT из localStorage
 * и автоматическим refresh токена при 401.
 *
 * Бэкенд ожидается по адресу /api/v1/ (через next.config.js rewrites).
 */

import type { AuthResponse } from '@/types/auth'

/** Базовая ошибка API */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Параметры запроса */
interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Параметры URL (добавляются как query string) */
  params?: Record<string, string | number | boolean | undefined>
  /** Не пытаться автоматически обновить токен */
  skipAuth?: boolean
  /** Таймаут в мс */
  timeout?: number
}

/** Хранилище для access/refresh токенов */
const tokenStore = {
  getAccessToken: (): string | null => localStorage.getItem('accessToken'),
  getRefreshToken: (): string | null => localStorage.getItem('refreshToken'),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}

/** Флаг, чтобы не было бесконечного цикла refresh */
let isRefreshing = false
let refreshPromise: Promise<void> | null = null

/** Обновление токена */
async function refreshTokens(): Promise<void> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    const refreshToken = tokenStore.getRefreshToken()
    if (!refreshToken) {
      throw new ApiError(401, 'TOKEN_EXPIRED', 'Требуется повторный вход')
    }

    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      tokenStore.clearTokens()
      throw new ApiError(401, 'TOKEN_EXPIRED', 'Сессия истекла, войдите снова')
    }

    const data: AuthResponse = await response.json()
    tokenStore.setTokens(data.accessToken, data.refreshToken)
  })()

  try {
    await refreshPromise
  } finally {
    isRefreshing = false
    refreshPromise = null
  }
}

/** Основная функция запроса */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, params, skipAuth, timeout = 30000, ...fetchOptions } = options

  // Собираем URL
  let url = endpoint
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value))
      }
    })
    const qs = searchParams.toString()
    if (qs) url += `?${qs}`
  }

  // Заголовки
  const headers = new Headers(fetchOptions.headers as Record<string, string> | undefined)

  if (!headers.has('Content-Type') && typeof body === 'object') {
    headers.set('Content-Type', 'application/json')
  }

  // JWT токен
  if (!skipAuth) {
    const token = tokenStore.getAccessToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  // Собираем опции
  const requestInit: RequestInit = {
    ...fetchOptions,
    headers,
    ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
  }

  // Таймаут через AbortController
  if (timeout > 0) {
    const controller = new AbortController()
    requestInit.signal = controller.signal
    setTimeout(() => controller.abort(), timeout)
  }

  try {
    let response = await fetch(url, requestInit)

    // Авто-refresh при 401
    if (response.status === 401 && !skipAuth) {
      await refreshTokens()
      // Повторяем запрос с новым токеном
      headers.set('Authorization', `Bearer ${tokenStore.getAccessToken()}`)
      response = await fetch(url, { ...requestInit, headers })
    }

    // Парсим ответ
    if (!response.ok) {
      let errorData: { code?: string; message?: string } = {}
      try {
        errorData = await response.json()
      } catch {
        // Если не JSON — игнорируем
      }
      throw new ApiError(
        response.status,
        errorData.code || 'UNKNOWN',
        errorData.message || `Ошибка ${response.status}`,
        errorData,
      )
    }

    // Для 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'TIMEOUT', 'Превышено время ожидания запроса')
    }
    throw new ApiError(0, 'NETWORK', 'Ошибка сети. Проверьте подключение к интернету.')
  }
}

/** Удобные методы */
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  /** Загрузка файла с FormData */
  upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers: {}, // Content-Type не ставим — браузер сам выставит multipart
    }),
}

export { tokenStore }