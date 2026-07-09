/**
 * MessageBubble — пузырёк сообщения в чате.
 * Разный стиль для user / assistant / system / tool.
 * Поддерживает markdown-like форматирование для ассистента.
 */

'use client'

import React, { useState } from 'react'
import type { ChatMessage } from '@/types/chat'
import { cn, copyToClipboard, formatDate } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'

interface MessageBubbleProps {
  message: ChatMessage
  className?: string
}

/** Простой рендер markdown (без внешних зависимостей) */
function SimpleMarkdown({ content }: { content: string }) {
  // Разбиваем на блоки по двойным переносам строк
  const blocks = content.split('\n\n')

  return (
    <div className="prose-invert">
      {blocks.map((block, i) => {
        // Код-блок
        if (block.startsWith('```') && block.endsWith('```')) {
          const code = block.slice(3, -3).trim()
          const lang = code.split('\n')[0]
          const codeContent = code.includes('\n') ? code.slice(code.indexOf('\n') + 1) : code
          return (
            <CodeBlock key={i} code={codeContent} language={lang} />
          )
        }

        // Обычный текст с inline-разметкой
        return (
          <p key={i} className="mb-2 last:mb-0 leading-relaxed whitespace-pre-wrap">
            {renderInline(block)}
          </p>
        )
      })}
    </div>
  )
}

/** Рендер inline-элементов */
function renderInline(text: string): React.ReactNode {
  // Жирный
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-surface-100">{part.slice(2, -2)}</strong>
    }
    // Курсив
    const italicParts = part.split(/(\*[^*]+\*)/g)
    return italicParts.map((italicPart, j) => {
      if (italicPart.startsWith('*') && italicPart.endsWith('*')) {
        return <em key={`${i}-${j}`} className="italic">{italicPart.slice(1, -1)}</em>
      }
      // Код
      const codeParts = italicPart.split(/(`[^`]+`)/g)
      return codeParts.map((codePart, k) => {
        if (codePart.startsWith('`') && codePart.endsWith('`')) {
          return (
            <code key={`${i}-${j}-${k}`} className="bg-surface-800 px-1.5 py-0.5 rounded text-sm text-primary-300">
              {codePart.slice(1, -1)}
            </code>
          )
        }
        return codePart
      })
    })
  })
}

/** Блок кода с кнопкой копирования */
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-surface-700">
      {/* Шапка */}
      {language && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-surface-800 border-b border-surface-700">
          <span className="text-xs text-surface-400">{language}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-surface-400 hover:text-surface-200 transition-colors"
          >
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
        </div>
      )}
      <pre className="p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function MessageBubble({ message, className }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const isSystem = message.role === 'system'
  const isTool = message.role === 'tool'

  return (
    <div
      className={cn(
        'flex items-start gap-3 message-enter',
        isUser && 'flex-row-reverse',
        className,
      )}
    >
      {/* Аватар */}
      <Avatar
        name={isUser ? 'Вы' : isAssistant ? 'AI' : 'S'}
        size="sm"
        className={cn(
          'shrink-0 mt-1',
          isUser && 'bg-primary-600',
          isAssistant && 'bg-gradient-to-br from-primary-500 to-violet-600',
          isSystem && 'bg-amber-600',
          isTool && 'bg-surface-600',
        )}
      />

      {/* Контент */}
      <div className={cn('max-w-[80%] lg:max-w-[65%]', isUser && 'order-1')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser &&
              'bg-primary-600 text-white rounded-tr-md',
            isAssistant &&
              'bg-surface-800 border border-surface-700 rounded-tl-md',
            isSystem &&
              'bg-amber-900/30 border border-amber-700/30 text-amber-200 text-sm rounded-tl-md',
            isTool &&
              'bg-surface-800/50 border border-surface-700/50 text-surface-400 text-sm rounded-tl-md font-mono',
          )}
        >
          {/* Системные сообщения с префиксом */}
          {isSystem && <span className="text-amber-400 font-medium text-xs uppercase block mb-1">Система</span>}
          {isTool && <span className="text-surface-500 font-medium text-xs uppercase block mb-1">Инструмент</span>}

          {/* Рендер контента */}
          {isAssistant ? (
            <SimpleMarkdown content={message.content} />
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          )}

          {/* Артефакты (изображения, графики) */}
          {message.artifacts && message.artifacts.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.artifacts.map((artifact) => (
                <div key={artifact.id} className="rounded-lg overflow-hidden border border-surface-700">
                  {artifact.type === 'image' && (
                    <img src={artifact.url} alt={artifact.name} className="w-full" />
                  )}
                  {artifact.type === 'chart' && (
                    <img src={artifact.url} alt={artifact.name} className="w-full" />
                  )}
                  {artifact.type === 'code' && (
                    <pre className="p-3 text-sm bg-surface-900 overflow-x-auto">
                      <code>{artifact.content}</code>
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Время */}
        <p className={cn('text-xs text-surface-500 mt-1 px-1', isUser && 'text-right')}>
          {formatDate(message.createdAt, 'short')}
          {message.tokensOut && ` · ${message.tokensOut} токенов`}
        </p>
      </div>
    </div>
  )
}