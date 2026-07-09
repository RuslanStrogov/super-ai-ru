/**
 * AgentRunView — компонент для просмотра выполнения агента.
 * Отображает шаги, артефакты и результат работы.
 */

'use client'

import React from 'react'
import type { AgentRunResult, AgentStep } from '@/types/agent'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { cn, formatDate } from '@/lib/utils'

interface AgentRunViewProps {
  /** Результат выполнения */
  result: AgentRunResult | null
  /** Идёт ли выполнение */
  isRunning: boolean
  /** Запуск агента */
  onRun: () => void
  /** Отмена */
  onCancel?: () => void
}

/** Иконка для типа шага */
const stepIcons: Record<string, string> = {
  thought: '🧠',
  action: '⚡',
  observation: '👀',
  result: '✅',
}

/** Цвет для типа шага */
const stepColors: Record<string, string> = {
  thought: 'border-primary-500/30 bg-primary-500/5',
  action: 'border-amber-500/30 bg-amber-500/5',
  observation: 'border-blue-500/30 bg-blue-500/5',
  result: 'border-green-500/30 bg-green-500/5',
}

export function AgentRunView({ result, isRunning, onRun, onCancel }: AgentRunViewProps) {
  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Spinner size="lg" />
        <p className="text-surface-400">Агент выполняет задачу...</p>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Отменить
          </Button>
        )}
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center">
          <svg className="w-8 h-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-surface-400">Агент ещё не запущен</p>
        <Button onClick={onRun}>Запустить агента</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Статус */}
      <Card className={cn(
        'border-l-4',
        result.status === 'completed' ? 'border-l-green-500' :
        result.status === 'failed' ? 'border-l-red-500' :
        result.status === 'cancelled' ? 'border-l-amber-500' :
        'border-l-primary-500',
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-surface-100">
              {result.status === 'completed' && '✅ Выполнено'}
              {result.status === 'failed' && '❌ Ошибка'}
              {result.status === 'cancelled' && '⚠️ Отменено'}
              {result.status === 'running' && '🔄 Выполняется...'}
            </h3>
            <p className="text-sm text-surface-400 mt-1">
              {result.durationMs > 0 && `${(result.durationMs / 1000).toFixed(1)}с · `}
              {result.tokensUsed} токенов
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={onRun}>
            Запустить снова
          </Button>
        </div>
      </Card>

      {/* Шаги */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">Шаги выполнения</h3>
        {result.steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'p-4 rounded-xl border',
              stepColors[step.type] || 'border-surface-700 bg-surface-800/50',
            )}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{stepIcons[step.type] || '📋'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-surface-400 uppercase">
                    {step.type}
                  </span>
                  {step.agentName && (
                    <span className="text-xs text-surface-500">{step.agentName}</span>
                  )}
                  {step.durationMs && (
                    <span className="text-xs text-surface-600">{(step.durationMs / 1000).toFixed(1)}с</span>
                  )}
                </div>
                <p className="text-sm text-surface-200 whitespace-pre-wrap">{step.content}</p>
                {step.toolUsed && (
                  <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-surface-700 text-surface-400">
                    Инструмент: {step.toolUsed}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Результат */}
      {result.output && (
        <Card>
          <h3 className="text-sm font-semibold text-surface-300 mb-2">Результат</h3>
          <p className="text-sm text-surface-200 whitespace-pre-wrap">{result.output}</p>
        </Card>
      )}

      {/* Артефакты */}
      {result.artifacts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-surface-300 uppercase tracking-wider">Артефакты</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.artifacts.map((artifact) => (
              <Card key={artifact.id} className="overflow-hidden">
                {artifact.type === 'image' || artifact.type === 'chart' ? (
                  <img src={artifact.url} alt={artifact.name} className="w-full rounded-lg" />
                ) : artifact.type === 'code' ? (
                  <pre className="text-sm bg-surface-900 p-3 rounded-lg overflow-x-auto">
                    <code>{artifact.content}</code>
                  </pre>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-surface-300">
                    <svg className="w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {artifact.name}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}