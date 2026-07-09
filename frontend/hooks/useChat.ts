/**
 * Хук для чата с SSE-стримингом.
 * Управляет отправкой сообщений, получением токенов через EventSource/ReadableStream,
 * историей сообщений и состоянием стриминга.
 */

'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import type { ChatMessage, ChatStreamState, LLMModel, SendMessageParams } from '@/types/chat'
import { connectSSE } from '@/lib/sse'
import { api } from '@/lib/api-client'
import { generateId } from '@/lib/utils'

/** Состояние хука */
interface UseChatState {
  messages: ChatMessage[]
  streamState: ChatStreamState
  isStreaming: boolean
  error: string | null
}

/** Возвращаемое значение хука */
interface UseChatReturn {
  messages: ChatMessage[]
  streamState: ChatStreamState
  isStreaming: boolean
  error: string | null
  sendMessage: (params: SendMessageParams) => Promise<void>
  stopStreaming: () => void
  clearMessages: () => void
  loadHistory: (conversationId: string) => Promise<void>
}

/**
 * Хук для управления чатом с SSE streaming.
 * @param conversationId — ID существующего conversation (опционально)
 */
export function useChat(conversationId?: string): UseChatReturn {
  const [state, setState] = useState<UseChatState>({
    messages: [],
    streamState: { status: 'idle', content: '' },
    isStreaming: false,
    error: null,
  })

  // Ссылка на AbortController для остановки стриминга
  const abortRef = useRef<AbortController | null>(null)
  const currentConvId = useRef<string | undefined>(conversationId)

  /** Обновляем ref при изменении conversationId */
  useMemo(() => {
    currentConvId.current = conversationId
  }, [conversationId])

  /** Загрузка истории сообщений */
  const loadHistory = useCallback(async (convId: string) => {
    setState((prev) => ({ ...prev, isStreaming: true }))

    try {
      const data = await api.get<{ messages: ChatMessage[] }>(`/api/v1/chat/${convId}/messages`)
      setState({
        messages: data.messages,
        streamState: { status: 'idle', content: '' },
        isStreaming: false,
        error: null,
      })
    } catch (err) {
      setState({
        messages: [],
        streamState: { status: 'error', content: '' },
        isStreaming: false,
        error: err instanceof Error ? err.message : 'Не удалось загрузить историю',
      })
    }
  }, [])

  /** Отправка сообщения с SSE стримингом */
  const sendMessage = useCallback(async (params: SendMessageParams) => {
    // Создаём пользовательское сообщение
    const userMessage: ChatMessage = {
      id: generateId(),
      conversationId: currentConvId.current || 'new',
      role: 'user',
      content: params.content,
      createdAt: new Date().toISOString(),
    }

    // Создаём пустое сообщение ассистента (будет заполняться через SSE)
    const assistantMessage: ChatMessage = {
      id: generateId(),
      conversationId: currentConvId.current || 'new',
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    }

    // Добавляем оба сообщения
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage, assistantMessage],
      streamState: { status: 'connecting', content: '' },
      isStreaming: true,
      error: null,
    }))

    // Создаём новый AbortController
    abortRef.current = new AbortController()

    // Если файлы есть — загружаем их через FormData
    let filesData: { id: string; name: string; url: string }[] | undefined
    if (params.files && params.files.length > 0) {
      try {
        const formData = new FormData()
        params.files.forEach((file) => formData.append('files', file))
        const uploadResult = await api.upload<{ files: { id: string; name: string; url: string }[] }>(
          '/api/v1/files/upload',
          formData,
        )
        filesData = uploadResult.files
      } catch {
        // Если загрузка не удалась — продолжаем без файлов
      }
    }

    // Запускаем SSE подключение
    try {
      await connectSSE({
        url: '/api/v1/chat/completions',
        method: 'POST',
        body: {
          conversationId: currentConvId.current,
          message: params.content,
          model: params.model,
          systemPrompt: params.systemPrompt,
          temperature: params.temperature ?? 0.7,
          maxTokens: params.maxTokens ?? 4096,
          files: filesData,
        },
        signal: abortRef.current.signal,

        // Обработка нового токена
        onToken: (token: string) => {
          setState((prev) => {
            const updatedMessages = [...prev.messages]
            const lastMsg = updatedMessages[updatedMessages.length - 1]
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content += token
            }
            return {
              ...prev,
              messages: updatedMessages,
              streamState: { status: 'streaming', content: lastMsg?.content || '' },
            }
          })
        },

        // Обработка вызова инструмента
        onToolCall: (toolCallData: string) => {
          setState((prev) => {
            const updatedMessages = [...prev.messages]
            const lastMsg = updatedMessages[updatedMessages.length - 1]
            if (lastMsg && lastMsg.role === 'assistant') {
              const toolCall = JSON.parse(toolCallData)
              lastMsg.toolCalls = [...(lastMsg.toolCalls || []), toolCall]
            }
            return { ...prev, messages: updatedMessages }
          })
        },

        // Обработка артефакта
        onArtifact: (artifactData: string) => {
          setState((prev) => {
            const updatedMessages = [...prev.messages]
            const lastMsg = updatedMessages[updatedMessages.length - 1]
            if (lastMsg && lastMsg.role === 'assistant') {
              const artifact = JSON.parse(artifactData)
              lastMsg.artifacts = [...(lastMsg.artifacts || []), artifact]
            }
            return { ...prev, messages: updatedMessages }
          })
        },

        // Стриминг завершён
        onDone: () => {
          setState((prev) => ({
            ...prev,
            streamState: { status: 'done', content: prev.streamState.content },
            isStreaming: false,
          }))
        },

        // Ошибка
        onError: (error: Error) => {
          setState((prev) => ({
            ...prev,
            streamState: { status: 'error', content: prev.streamState.content },
            isStreaming: false,
            error: error.message,
          }))
        },
      })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        streamState: { status: 'error', content: prev.streamState.content },
        isStreaming: false,
        error: err instanceof Error ? err.message : 'Ошибка соединения',
      }))
    }
  }, [])

  /** Остановка стриминга */
  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setState((prev) => ({
      ...prev,
      isStreaming: false,
      streamState: { status: 'done', content: prev.streamState.content },
    }))
  }, [])

  /** Очистка сообщений */
  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      streamState: { status: 'idle', content: '' },
      isStreaming: false,
      error: null,
    })
  }, [])

  return {
    messages: state.messages,
    streamState: state.streamState,
    isStreaming: state.isStreaming,
    error: state.error,
    sendMessage,
    stopStreaming,
    clearMessages,
    loadHistory,
  }
}