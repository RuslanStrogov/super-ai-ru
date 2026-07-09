/**
 * Карточка — контейнер с тёмным стеклянным фоном.
 * Используется для группировки контента.
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  /** Дополнительные классы */
  className?: string
  /** Обработчик клика (делает карточку кликабельной) */
  onClick?: () => void
  /** Hover-эффект */
  hoverable?: boolean
  /** Внутренний отступ */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

export function Card({
  children,
  className,
  onClick,
  hoverable = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={cn(
        'glass-card',
        paddingStyles[padding],
        hoverable && 'cursor-pointer hover:bg-surface-700/80 transition-all duration-200',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  )
}