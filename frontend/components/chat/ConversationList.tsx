/**
 * ConversationList — список бесед в сайдбаре.
 * Отображает conversations, позволяет создавать новые,
 * переключаться, удалять и переименовывать.
 */

'use client'

import React, { useState } from 'react'
import type { ConversationSummary } from '@/types/chat'
import { cn, formatDate } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'

interface ConversationListProps {
  conversations: ConversationSummary[]
  activeId: string | null
  isLoading: boolean
  onSelect: (id: string) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
}

export function ConversationList({
  conversations,
  activeId,
  isLoading,
  onSelect,
  onCreate,
  onDelete,
  onRename,
}: ConversationListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  /** Начало переименования */
  const startRename = (conv: ConversationSummary) => {
    setEditingId(conv.id)
    setEditTitle(conv.title)
  }

  /** Сохранение переименования */
  const saveRename = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Кнопка нового чата */}
      <div className="p-3">
        <button
          onClick={onCreate}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium
            transition-all duration-200 shadow-lg shadow-primary-600/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Новый чат
        </button>
      </div>

      {/* Список */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="sm" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-surface-500">История чатов пуста</p>
            <p className="text-xs text-surface-600 mt-1">Начните новый диалог</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group relative rounded-xl transition-all duration-200',
                  activeId === conv.id
                    ? 'bg-primary-500/10 border border-primary-500/20'
                    : 'hover:bg-surface-800 border border-transparent',
                )}
              >
                {editingId === conv.id ? (
                  /* Режим переименования */
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={saveRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename()
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="w-full bg-surface-700 text-surface-100 text-sm px-3 py-2.5 rounded-xl outline-none border border-primary-500"
                    autoFocus
                  />
                ) : (
                  /* Обычный вид */
                  <button
                    onClick={() => onSelect(conv.id)}
                    className="w-full text-left px-3 py-2.5"
                  >
                    <p className="text-sm text-surface-200 truncate">{conv.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-surface-500">
                        {formatDate(conv.updatedAt)}
                      </span>
                      <span className="text-xs text-surface-600">
                        {conv.messageCount} сообщ.
                      </span>
                    </div>
                  </button>
                )}

                {/* Действия (показываются при наведении) */}
                {editingId !== conv.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startRename(conv)
                      }}
                      className="p-1 rounded text-surface-500 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                      title="Переименовать"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(conv.id)
                      }}
                      className="p-1 rounded text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Удалить"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}