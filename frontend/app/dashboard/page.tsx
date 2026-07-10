/**
 * Дашборд — /dashboard.
 * Отображает метрики использования: сообщения, токены, агенты.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api-client'
import { formatTokens, formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface DashboardMetrics {
  totalConversations: number
  totalMessages: number
  totalTokens: number
  totalCost: number
  activeModels: string[]
  recentActivity: { date: string; requests: number }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.get('/api/v1/admin/metrics')
      .then(res => res.json())
      .then(data => { setMetrics(data); setIsLoading(false) })
      .catch(() => {
        setMetrics({
          totalConversations: 0, totalMessages: 0, totalTokens: 0,
          totalCost: 0, activeModels: [], recentActivity: []
        })
        setIsLoading(false)
      })
  }, [])

  if (isLoading) return <div className="flex-1 flex items-center justify-center"><Spinner /></div>

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Дашборд</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><div className="text-sm text-gray-500">Диалоги</div><div className="text-2xl font-bold">{metrics?.totalConversations || 0}</div></Card>
        <Card className="p-4"><div className="text-sm text-gray-500">Сообщения</div><div className="text-2xl font-bold">{metrics?.totalMessages || 0}</div></Card>
        <Card className="p-4"><div className="text-sm text-gray-500">Токенов</div><div className="text-2xl font-bold">{formatTokens(metrics?.totalTokens || 0)}</div></Card>
        <Card className="p-4"><div className="text-sm text-gray-500">Затраты</div><div className="text-2xl font-bold">{metrics?.totalCost || 0} ₽</div></Card>
      </div>
      {metrics?.activeModels && metrics.activeModels.length > 0 && (
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Активные модели</h2>
          <div className="flex flex-wrap gap-2">
            {metrics.activeModels.map(m => (
              <span key={m} className="px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full text-sm">{m}</span>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}