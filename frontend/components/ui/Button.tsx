/**
 * Кнопка — основной компонент для действий.
 * Поддерживает варианты: primary, secondary, ghost, danger.
 * Поддерживает размеры: sm, md, lg.
 * Поддерживает состояние загрузки.
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Визуальный стиль кнопки */
  variant?: ButtonVariant
  /** Размер */
  size?: ButtonSize
  /** Показать спиннер (состояние загрузки) */
  loading?: boolean
  /** Полная ширина */
  fullWidth?: boolean
  /** Иконка слева от текста */
  leftIcon?: React.ReactNode
  /** Иконка справа от текста */
  rightIcon?: React.ReactNode
}

/** Стили для каждого варианта */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-lg shadow-primary-600/20',
  secondary:
    'bg-surface-700 hover:bg-surface-600 active:bg-surface-500 text-surface-100 border border-surface-600',
  ghost:
    'bg-transparent hover:bg-surface-800 active:bg-surface-700 text-surface-300',
  danger:
    'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-lg shadow-red-600/20',
}

/** Стили для каждого размера */
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-surface-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className="text-inherit" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
}