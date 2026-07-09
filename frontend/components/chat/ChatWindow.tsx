/**
 * ChatWindow — основной компонент чата.
 * Отображает историю сообщений, поддерживает автоскролл
 * и отображение стриминга.
 */

'use client'

import React, { useRef, useEffect } from 'react'
import type { ChatMessage, ChatStreamState } from '@/types/chat'
import { cn } from '@/lib/utils'
import { MessageBubble } from './MessageBubble'
import { Spinner } from '@/components/ui/Spinner'

interface ChatWindowProps {
  messages: ChatMessage[]
  streamState: ChatStreamState
  isStreaming: boolean
  className?: string
}

export function ChatWindow({ messages, streamState, isStreaming, className }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamState.content])

  // Если нет сообщений — показываем приветствие
  if (messages.length === 0) {
    return (
      <div className={cn('flex-1 flex items-center justify-center p-8', className)}>
        <div className="text-center max-w-md">
          {/* Логотип / иконка */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold gradient-text mb-2">Super AI</h1>
          <p className="text-surface-400 mb-8">
            Российская AI-платформа для чата, агентов и анализа данных.
            Выберите модель и начните диалог.
          </p>

          {/* Быстрые действия */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: '✍️', text: 'Написать пост' },
              { icon: '💻', text: 'Написать код' },
              { icon: '📊', text: 'Проанализировать' },
              { icon: '🧠', text: 'Объяснить концепцию' },
            ].map((action) => (
              <button
                key={action.text}
                className="p-3 rounded-xl bg-surface-800/50 border border-surface-700/50
                  hover:bg-surface-700/50 hover:border-surface-600 transition-all duration-200
                  text-sm text-surface-300 hover:text-surface-100 text-left"
              >
                <span className="mr-2">{action.icon}</span>
                {action.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('flex-1 overflow-y-auto custom-scrollbar px-4 py-6', className)}>
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Индикатор стриминга */}
        {isStreaming && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex items-center gap-1.5 py-2">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}