/**
 * Хук для CRUD операций с conversations (история чатов).
 * Используется в сайдбаре чата для списка бесед.
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import type { ConversationSummary } from '@/types/chat'
import { api } from '@/lib/api-client'
import { generateId } from '@/lib/utils'

interface UseConversationsReturn {
  conversations: ConversationSummary[]
  isLoading: boolean
  error: string | null
  activeId: string | null
  setActiveId: (id: string | null) => void
  fetchConversations: () => Promise<void>
  createConversation: (title?: string, model?: string) => Promise<string>
  deleteConversation: (id: string) => Promise<void>
  renameConversation: (id: string, title: string) => Promise<void>
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  /** Загрузка списка conversations */
  const fetchConversations = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.get<{ conversations: ConversationSummary[] }>('/api/v1/chat/conversations')
      setConversations(data.conversations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить историю чатов')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /** Загружаем при монтировании */
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  /** Создание нового conversation */
  const createConversation = useCallback(
    async (title?: string, model?: string): Promise<string> => {
      try {
        const data = await api.post<{ id: string }>('/api/v1/chat/conversations', {
          title: title || 'Новый чат',
          model: model || 'default',
        })

        // Добавляем в локальный список
        const newConv: ConversationSummary = {
          id: data.id,
          title: title || 'Новый чат',
          model: model || 'default',
          messageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        setConversations((prev) => [newConv, ...prev])
        setActiveId(data.id)

        return data.id
      } catch (err) {
        // Если бэкенд недоступен — создаём локально (offline-first)
        const localId = generateId()
        const newConv: ConversationSummary = {
          id: localId,
          title: title || 'Новый чат',
          model: model || 'default',
          messageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setConversations((prev) => [newConv, ...prev])
        setActiveId(localId)
        return localId
      }
    },
    [],
  )

  /** Удаление conversation */
  const deleteConversation = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/v1/chat/conversations/${id}`)
    } catch {
      // Игнорируем ошибку удаления на бэкенде
    }

    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeId === id) {
      setActiveId(null)
    }
  }, [activeId])

  /** Переименование conversation */
  const renameConversation = useCallback(async (id: string, title: string) => {
    try {
      await api.patch(`/api/v1/chat/conversations/${id}`, { title })
    } catch {
      // Игнорируем
    }

    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c)),
    )
  }, [])

  return {
    conversations,
    isLoading,
    error,
    activeId,
    setActiveId,
    fetchConversations,
    createConversation,
    deleteConversation,
    renameConversation,
  }
}