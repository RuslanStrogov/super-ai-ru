/**
 * ChatInput — поле ввода сообщения с кнопками.
 * Поддерживает: отправку по Enter, Shift+Enter для новой строки,
 * загрузку файлов, выбор модели.
 */

'use client'

import React, { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface ChatInputProps {
  /** Отправка сообщения */
  onSend: (content: string, files?: File[]) => void
  /** Идёт ли стриминг */
  isStreaming: boolean
  /** Остановка стриминга */
  onStop: () => void
  /** Выбор модели */
  selectedModel: string
  /** Открыть выбор модели */
  onOpenModelSelector: () => void
  /** Заблокирован ли ввод */
  disabled?: boolean
  className?: string
}

export function ChatInput({
  onSend,
  isStreaming,
  onStop,
  selectedModel,
  onOpenModelSelector,
  disabled = false,
  className,
}: ChatInputProps) {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /** Авто-высота textarea */
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [])

  /** Отправка сообщения */
  const handleSend = useCallback(() => {
    const trimmed = content.trim()
    if (!trimmed && files.length === 0) return
    onSend(trimmed, files.length > 0 ? files : undefined)
    setContent('')
    setFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [content, files, onSend])

  /** Обработка клавиш */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /** Выбор файлов */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selectedFiles])
    // Сброс input для возможности повторного выбора того же файла
    e.target.value = ''
  }

  /** Удалить файл из списка */
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('border-t border-surface-700/50 bg-surface-900/80 backdrop-blur-xl', className)}>
      {/* Выбранные файлы */}
      {files.length > 0 && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 overflow-x-auto">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800 border border-surface-700 text-sm shrink-0"
            >
              {/* Иконка файла */}
              <svg className="w-4 h-4 text-surface-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span className="text-surface-300 truncate max-w-[120px]">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-surface-500 hover:text-surface-200 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Поле ввода */}
      <div className="flex items-end gap-2 p-4">
        {/* Кнопка прикрепить файл */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-colors shrink-0"
          disabled={disabled}
          title="Прикрепить файл"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            adjustTextareaHeight()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
          disabled={disabled || isStreaming}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent text-surface-100 placeholder:text-surface-500',
            'outline-none text-sm leading-relaxed py-2',
            'max-h-[200px]',
          )}
        />

        {/* Кнопка отправки / остановки */}
        {isStreaming ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={onStop}
            className="shrink-0"
            title="Остановить генерацию"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={disabled || (!content.trim() && files.length === 0)}
            className="shrink-0"
            title="Отправить"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        )}
      </div>

      {/* Нижняя панель: модель + информация */}
      <div className="flex items-center justify-between px-4 pb-3">
        <button
          onClick={onOpenModelSelector}
          className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-300 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
          {selectedModel}
        </button>

        <span className="text-xs text-surface-600">
          Super AI может допускать ошибки. Проверяйте важную информацию.
        </span>
      </div>
    </div>
  )
}