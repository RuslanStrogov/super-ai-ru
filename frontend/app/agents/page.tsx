/**
 * Страница списка агентов — /agents.
 * Показывает карточки агентов и кнопку создания нового.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AgentCard } from '@/components/agents/AgentCard'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api-client'
import type { AgentSummary } from '@/types/agent'

export const dynamic = 'force-dynamic'

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<AgentSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get('/api/v1/agents')
      .then(res => res.json())
      .then(data => { setAgents(data.agents || []); setIsLoading(false) })
      .catch(err => { setError(err.message); setIsLoading(false) })
  }, [])

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Spinner /></div>
  if (error) return <div className="flex-1 flex items-center justify-center text-red-500">Ошибка: {error}</div>

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI-агенты</h1>
        <Button onClick={() => router.push('/agents/new')}>Создать агента</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onClick={() => router.push(`/agents/${agent.id}`)}
          />
        ))}
        {agents.length === 0 && (
          <p className="col-span-full text-center text-gray-500 py-12">
            У вас пока нет агентов. Создайте первого!
          </p>
        )}
      </div>
    </div>
  )
}