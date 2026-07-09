/**
 * Chat layout — лейаут для /chat и /chat/[id].
 * Включает сайдбар со списком conversations.
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { ConversationList } from '@/components/chat/ConversationList'
import { useConversations } from '@/hooks/useConversations'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const {
    conversations,
    isLoading,
    activeId,
    setActiveId,
    createConversation,
    deleteConversation,
    renameConversation,
  } = useConversations()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  /** Создание нового чата */
  const handleCreate = async () => {
    const id = await createConversation()
    setSidebarOpen(false)
    router.push(`/chat/${id}`)
  }

  /** Выбор чата */
  const handleSelect = (id: string) => {
    setActiveId(id)
    setSidebarOpen(false)
    router.push(`/chat/${id}`)
  }

  return (
    <div className="h-screen flex overflow-hidden bg-surface-900">
      {/* Сайдбар */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title="История"
        headerActions={
          <button
            onClick={handleCreate}
            className="p-1.5 rounded-lg hover:bg-surface-700 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      >
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          isLoading={isLoading}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onDelete={deleteConversation}
          onRename={renameConversation}
        />
      </Sidebar>

      {/* Основная область */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Шапка */}
        <header className="h-14 border-b border-surface-800 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Кнопка бургер (мобилки) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-800 text-surface-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Логотип (десктоп) */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">S</span>
              </div>
              <span className="text-sm font-bold text-surface-100">Super AI</span>
            </div>
          </div>

          {/* Правый блок */}
          <div className="flex items-center gap-3">
            {/* Пока навигация по агентам/дашборду */}
            <a
              href="/agents"
              className="text-xs text-surface-400 hover:text-surface-200 transition-colors"
            >
              Агенты
            </a>
            <a
              href="/dashboard"
              className="text-xs text-surface-400 hover:text-surface-200 transition-colors"
            >
              Дашборд
            </a>
          </div>
        </header>

        {/* Контент */}
        {children}
      </div>
    </div>
  )
}