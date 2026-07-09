/**
 * Аватар — кружок с инициалами пользователя или изображением.
 * Автоматически генерирует цвет фона на основе имени.
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  /** URL аватара */
  src?: string
  /** Имя пользователя (для инициалов) */
  name?: string
  /** Размер */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Дополнительные классы */
  className?: string
  /** Alt текст */
  alt?: string
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
}

/** Генерация цвета на основе строки (имени/email) */
function getColorFromString(str: string): string {
  const colors = [
    'bg-primary-600',
    'bg-emerald-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-cyan-600',
    'bg-fuchsia-600',
    'bg-lime-600',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

/** Получение инициалов */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export function Avatar({ src, name, size = 'md', className, alt }: AvatarProps) {
  const initials = name ? getInitials(name) : '?'
  const bgColor = name ? getColorFromString(name) : 'bg-surface-600'

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Аватар'}
        className={cn('rounded-full object-cover', sizeStyles[size], className)}
        onError={(e) => {
          // При ошибке загрузки — показать инициалы
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            const fallback = document.createElement('span')
            fallback.textContent = initials
            fallback.className = `${sizeStyles[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-medium`
            parent.appendChild(fallback)
          }
        }}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white font-medium',
        sizeStyles[size],
        bgColor,
        className,
      )}
      title={name || alt}
      aria-label={alt || name || 'Аватар'}
    >
      {initials}
    </div>
  )
}