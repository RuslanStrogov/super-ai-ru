/**
 * Клиент для SSE (Server-Sent Events) стриминга.
 * Поддерживает как EventSource, так и fetch + ReadableStream.
 */

import type { SSEChatEvent } from '@/types/chat'
import { tokenStore } from './api-client'

/** Тип колбэка для SSE событий */
type SSEEventHandler = (event: SSEChatEvent) => void
type SSEErrorHandler = (error: Error) => void
type SSEDoneHandler = () => void

/** Парсинг SSE строки */
function parseSSELine(line: string): SSEChatEvent | null {
  if (!line.startsWith('data: ')) return null

  const data = line.slice(6).trim()

  // Проверяем сигнал окончания
  if (data === '[DONE]') {
    return { type: 'done', data: '' }
  }

  // Пробуем распарсить JSON
  try {
    const parsed = JSON.parse(data)

    // Определяем тип события по структуре
    if (parsed.type === 'token' || parsed.token) {
      return {
        type: 'token',
        data: parsed.token || parsed.content || '',
      }
    }
    if (parsed.type === 'error' || parsed.error) {
      return {
        type: 'error',
        data: parsed.error || parsed.message || 'Unknown error',
      }
    }
    if (parsed.type === 'tool_call') {
      return {
        type: 'tool_call',
        data: JSON.stringify(parsed),
      }
    }
    if (parsed.type === 'artifact') {
      return {
        type: 'artifact',
        data: JSON.stringify(parsed),
      }
    }

    // По умолчанию — токен
    return {
      type: 'token',
      data: parsed.content || parsed.text || data,
    }
  } catch {
    // Если не JSON — это просто токен
    return {
      type: 'token',
      data,
    }
  }
}

/** Парсинг полного SSE сообщения */
function parseSSEMessage(text: string): SSEChatEvent[] {
  const events: SSEChatEvent[] = []
  const lines = text.split('\n')

  for (const line of lines) {
    const event = parseSSELine(line)
    if (event) {
      events.push(event)
    }
  }

  return events
}

/**
 * Подключение к SSE стриму через ReadableStream.
 * Использует fetch() — поддерживает авторизацию (JWT).
 */
export function connectSSE(options: {
  url: string
  method?: string
  body?: unknown
  onToken?: (token: string) => void
  onDone?: SSEDoneHandler
  onError?: SSEErrorHandler
  onToolCall?: (data: string) => void
  onArtifact?: (data: string) => void
  signal?: AbortSignal
}): Promise<void> {
  const {
    url,
    method = 'POST',
    body,
    onToken,
    onDone,
    onError,
    onToolCall,
    onArtifact,
    signal,
  } = options

  return new Promise<void>(async (resolve, reject) => {
    try {
      const token = tokenStore.getAccessToken()
      const headers: Record<string, string> = {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      if (body) {
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal,
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        reject(new Error(`SSE connection failed: ${response.status} ${errorText}`))
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        reject(new Error('Response body is not readable'))
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      /** Обработка чанка данных */
      function processChunk(chunk: string) {
        buffer += chunk
        const lines = buffer.split('\n')
        // Оставляем последнюю неполную строку в буфере
        buffer = lines.pop() || ''

        for (const line of lines) {
          const event = parseSSELine(line)
          if (!event) continue

          switch (event.type) {
            case 'token':
              onToken?.(event.data)
              break
            case 'done':
              onDone?.()
              break
            case 'error':
              onError?.(new Error(event.data))
              break
            case 'tool_call':
              onToolCall?.(event.data)
              break
            case 'artifact':
              onArtifact?.(event.data)
              break
          }
        }
      }

      // Читаем поток
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        processChunk(chunk)
      }

      // Обрабатываем остаток буфера
      if (buffer.trim()) {
        processChunk('\n')
      }

      onDone?.()
      resolve()
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        onDone?.()
        resolve()
        return
      }
      onError?.(error instanceof Error ? error : new Error(String(error)))
      reject(error)
    }
  })
}

/**
 * Альтернативный SSE клиент через EventSource (для простых кейсов).
 * Минус: не поддерживает авторизацию через заголовки (только cookies/query params).
 */
export function connectEventSource(
  url: string,
  handlers: {
    onMessage?: SSEEventHandler
    onError?: SSEErrorHandler
    onOpen?: () => void
  },
): EventSource {
  const token = tokenStore.getAccessToken()
  // Добавляем токен как query-параметр (временное решение для EventSource)
  const fullUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url

  const eventSource = new EventSource(fullUrl)

  eventSource.onopen = () => {
    handlers.onOpen?.()
  }

  eventSource.onmessage = (event) => {
    const parsed = parseSSELine(event.data)
    if (parsed) {
      handlers.onMessage?.(parsed)
    }
  }

  eventSource.onerror = () => {
    handlers.onError?.(new Error('EventSource connection error'))
  }

  return eventSource
}