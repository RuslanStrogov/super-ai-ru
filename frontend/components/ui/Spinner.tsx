/**
 * Спиннер — индикатор загрузки.
 * Анимированное вращающееся кольцо.
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
  /** Размер */
  size?: 'sm' | 'md' | 'lg'
  /** Дополнительные классы */
  className?: string
  /** Цвет (Tailwind класс) */
  color?: string
}

const sizeStyles = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
}

export function Spinner({ size = 'md', className, color = 'border-primary-500' }: SpinnerProps) {
  return (
    <div
      className={cn(
        'inline-block rounded-full border-surface-700 animate-spin',
        sizeStyles[size],
        color,
        'border-t-transparent',
        className,
      )}
      role="status"
      aria-label="Загрузка"
    />
  )
}