/**
 * AgentCard — карточка агента для списка /agents.
 * Показывает название, описание, модель, количество инструментов.
 */

'use client'

import React from 'react'
import type { AgentSummary } from '@/types/agent'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agent: AgentSummary
  onClick?: () => void
  className?: string
}

export function AgentCard({ agent, onClick, className }: AgentCardProps) {
  return (
    <Card
      hoverable
      onClick={onClick}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Статус-индикатор */}
      <div className="absolute top-3 right-3">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            agent.isActive ? 'bg-green-500 shadow-lg shadow-green-500/30' : 'bg-surface-600',
          )}
        />
      </div>

      {/* Иконка */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Название и модель */}
      <h3 className="font-semibold text-surface-100 mb-1 truncate">{agent.name}</h3>
      <p className="text-sm text-surface-400 line-clamp-2 mb-3 min-h-[2.5rem]">
        {agent.description || 'Нет описания'}
      </p>

      {/* Метки */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
          {agent.model}
        </span>
        <span className="text-xs text-surface-500">
          {agent.toolCount} инструментов
        </span>
        {agent.lastRun && (
          <span className="text-xs text-surface-500">· запущен</span>
        )}
      </div>
    </Card>
  )
}