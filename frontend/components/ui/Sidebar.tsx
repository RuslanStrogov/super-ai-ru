/**
 * Сайдбар — боковая панель навигации.
 * Используется в layout чата для списка conversations.
 * На мобилках скрывается (overlay).
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  children: React.ReactNode
  /** Открыт ли сайдбар на мобилках */
  isOpen: boolean
  /** Закрыть сайдбар (на мобилках) */
  onClose: () => void
  /** Ширина */
  width?: 'sm' | 'md' | 'lg'
  /** Заголовок сайдбара */
  title?: string
  /** Действия в шапке */
  headerActions?: React.ReactNode
}

const widthStyles = {
  sm: 'w-64',
  md: 'w-72',
  lg: 'w-80',
}

export function Sidebar({
  children,
  isOpen,
  onClose,
  width = 'md',
  title,
  headerActions,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-40',
          'flex flex-col bg-surface-900 border-r border-surface-700',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          widthStyles[width],
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Заголовок */}
        {(title || headerActions) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700">
            {title && (
              <h2 className="text-sm font-semibold text-surface-200 uppercase tracking-wider">
                {title}
              </h2>
            )}
            <div className="flex items-center gap-2">{headerActions}</div>
          </div>
        )}

        {/* Контент */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">{children}</div>
      </aside>
    </>
  )
}