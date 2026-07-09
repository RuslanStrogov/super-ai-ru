/**
 * Страница агента — /agents/[id].
 * CSR. Показывает AgentBuilder для редактирования или AgentRunView для запуска.
 * Для нового агента (/agents/new) — сразу конструктор.
 */

'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { AgentBuilder } from '@/components/agents/AgentBuilder'
import { AgentRunView } from '@/components/agents/AgentRunView'
import { api } from '@/lib/api-client'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import type { AgentDefinition, AgentRunResult } from '@/types/agent'

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const isNew = resolvedParams.id === 'new'

  const [agent, setAgent] = useState<AgentDefinition | null>(null)
  const [runResult, setRunResult] = useState<AgentRunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [view, setView] = useState<'edit' | 'run'>(isNew ? 'edit' : 'edit')

  /** Загрузка агента */
  useEffect(() => {
    if (!isNew) {
      const fetchAgent = async () => {
        try {
          const data = await api.get<{ agent: AgentDefinition }>(`/api/v1/agents/${resolvedParams.id}`)
          setAgent(data.agent)
        } catch {
          // Если бэкенд недоступен — показываем заглушку
        } finally {
          setIsLoading(false)
        }
      }
      fetchAgent()
    }
  }, [isNew, resolvedParams.id])

  /** Сохранение агента */
  const handleSave = async (agentData: Omit<AgentDefinition, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isNew) {
      const data = await api.post<{ id: string }>('/api/v1/agents', agentData)
      router.push(`/agents/${data.id}`)
    } else {
      await api.patch(`/api/v1/agents/${resolvedParams.id}`, agentData)
    }
  }

  /** Запуск агента */
  const handleRun = async () => {
    if (!agent) return
    setIsRunning(true)
    setView('run')

    try {
      const data = await api.post<AgentRunResult>(`/api/v1/agents/${agent.id}/run`)
      setRunResult(data)
    } catch (err) {
      setRunResult({
        id: 'error',
        agentId: agent.id,
        status: 'failed',
        input: '',
        output: '',
        steps: [],
        artifacts: [],
        tokensUsed: 0,
        durationMs: 0,
        error: err instanceof Error ? err.message : 'Ошибка запуска',
        createdAt: new Date().toISOString(),
      })
    } finally {
      setIsRunning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Шапка */}
      <header className="border-b border-surface-800">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/agents')} className="text-surface-400 hover:text-surface-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-surface-100">
                {isNew ? 'Новый агент' : agent?.name || 'Загрузка...'}
              </h1>
              {agent && !isNew && (
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    onClick={() => setView('edit')}
                    className={`text-xs transition-colors ${view === 'edit' ? 'text-primary-400' : 'text-surface-500 hover:text-surface-300'}`}
                  >
                    Редактор
                  </button>
                  <span className="text-xs text-surface-700">·</span>
                  <button
                    onClick={() => setView('run')}
                    className={`text-xs transition-colors ${view === 'run' ? 'text-primary-400' : 'text-surface-500 hover:text-surface-300'}`}
                  >
                    Запуск
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {view === 'edit' ? (
          <AgentBuilder
            initialAgent={agent || undefined}
            onSave={handleSave}
            onRun={handleRun}
            onCancel={() => router.push('/agents')}
          />
        ) : (
          <>
            {runResult ? (
              <AgentRunView
                result={runResult}
                isRunning={isRunning}
                onRun={handleRun}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-surface-400 mb-4">Агент ещё не запускался</p>
                <Button onClick={handleRun}>Запустить агента</Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}