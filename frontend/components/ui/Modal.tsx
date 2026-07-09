/**
 * Модальное окно — overlay с центрированным содержимым.
 * Закрывается по клику на фон, Escape, или по кнопке X.
 */

'use client'

import React, { useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  /** Открыто ли модальное окно */
  isOpen: boolean
  /** Закрыть окно */
  onClose: () => void
  /** Заголовок */
  title?: string
  /** Дочерние элементы */
  children: React.ReactNode
  /** Размер */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Показывать кнопку закрытия */
  showCloseButton?: boolean
  /** Не закрывать по клику на фон */
  disableBackdrop?: boolean
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[95vw] max-h-[95vh]',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  disableBackdrop = false,
}: ModalProps) {
  // Закрытие по Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={disableBackdrop ? undefined : onClose}
      />

      {/* Контент */}
      <div
        className={cn(
          'relative z-10 w-full animate-slide-up',
          'bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl',
          sizeStyles[size],
          'max-h-[90vh] flex flex-col',
        )}
      >
        {/* Заголовок */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-700">
            {title && <h2 className="text-lg font-semibold text-surface-100">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                aria-label="Закрыть"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Тело */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">{children}</div>
      </div>
    </div>
  )
}