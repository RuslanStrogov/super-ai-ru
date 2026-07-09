/**
 * Страница списка агентов — /agents.
 * SSR. Показывает карточки агентов и кнопку создания нового.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AgentCard } from '@/components/agents/AgentCard'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api-client'
import type { AgentSummary } from '@/types/agent'

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<AgentSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /** Загрузка списка агентов */
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await api.get<{ agents: AgentSummary[] }>('/api/v1/agents')
        setAgents(data.agents)
      } catch (err) {
        // Если бэкенд недоступен — показываем заглушку
        setAgents([])
        setError('Бэкенд недоступен. Создайте первого агента!')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAgents()
  }, [])

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Шапка */}
      <header className="border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/chat')} className="text-surface-400 hover:text-surface-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-surface-100">Агенты</h1>
          </div>
          <Button onClick={() => router.push('/agents/new')} leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }>
            Создать агента
          </Button>
        </div>
      </header>

      {/* Контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center">
              <svg className="w-10 h-10 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-surface-200 mb-2">Ещё нет агентов</h2>
            <p className="text-surface-400 mb-6 max-w-md mx-auto">
              Создайте своего первого AI-агента — настройте системный промпт,
              выберите инструменты и запустите.
            </p>
            <Button onClick={() => router.push('/agents/new')}>
              Создать первого агента
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={() => router.push(`/agents/${agent.id}`)}
              />
            ))}
            {/* Карточка создания нового */}
            <button
              onClick={() => router.push('/agents/new')}
              className="p-6 rounded-2xl border-2 border-dashed border-surface-700 hover:border-primary-500/50
                hover:bg-primary-500/5 transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-surface-400">Создать нового агента</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}