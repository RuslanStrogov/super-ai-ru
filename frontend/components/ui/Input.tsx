/**
 * Поле ввода — текстовый input с поддержкой
 * метки, ошибки, иконок и различных состояний.
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Метка над полем */
  label?: string
  /** Текст ошибки */
  error?: string
  /** Подсказка под полем */
  hint?: string
  /** Иконка слева */
  leftIcon?: React.ReactNode
  /** Иконка справа */
  rightIcon?: React.ReactNode
  /** Полная ширина */
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, fullWidth = true, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Метка */}
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-surface-300">
            {label}
          </label>
        )}

        {/* Контейнер input */}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 bg-surface-800 border rounded-xl text-surface-100',
              'placeholder:text-surface-500 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                : 'border-surface-700 hover:border-surface-600',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className,
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Ошибка */}
        {error && <p className="text-xs text-red-400">{error}</p>}

        {/* Подсказка */}
        {hint && !error && <p className="text-xs text-surface-500">{hint}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'