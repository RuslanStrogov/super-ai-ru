/**
 * Дашборд — /dashboard.
 * Отображает метрики использования, статистику по сообщениям,
 * токенам и агентам.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api-client'
import { formatTokens, formatDate } from '@/lib/utils'

/** Типы метрик */
interface DashboardMetrics {
  totalConversations: number
  totalMessages: number
  totalTokensUsed: number
  totalAgents: number
  activeAgents: number
  messagesToday: number
  tokensToday: number
  topModels: { model: string; count: number }[]
  recentActivity: { type: string; description: string; timestamp: string }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.get<{ metrics: DashboardMetrics }>('/api/v1/dashboard/metrics')
        setMetrics(data.metrics)
      } catch {
        // Если бэкенд недоступен — показываем демо-данные
        setMetrics(DEMO_METRICS)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMetrics()
  }, [])

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/chat')} className="text-surface-400 hover:text-surface-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-surface-100">Дашборд</h1>
          </div>
        </div>
      </header>

      {/* Контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Карточки метрик */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Диалогов"
            value={metrics?.totalConversations || 0}
            icon="💬"
            change={`+${metrics?.messagesToday || 0} сегодня`}
          />
          <MetricCard
            title="Сообщений"
            value={metrics?.totalMessages || 0}
            icon="📝"
          />
          <MetricCard
            title="Токенов использовано"
            value={formatTokens(metrics?.totalTokensUsed || 0)}
            icon="🔤"
          />
          <MetricCard
            title="Агентов"
            value={metrics?.totalAgents || 0}
            icon="🤖"
            subtitle={`${metrics?.activeAgents || 0} активных`}
          />
        </div>

        {/* Детальные секции */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Популярные модели */}
          <Card>
            <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">
              Популярные модели
            </h2>
            <div className="space-y-3">
              {(metrics?.topModels || []).map((item) => (
                <div key={item.model} className="flex items-center justify-between">
                  <span className="text-sm text-surface-300">{item.model}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-surface-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-500"
                        style={{
                          width: `${Math.min(
                            ((item.count) / Math.max(...(metrics?.topModels || []).map((m) => m.count))) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-surface-500 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Недавняя активность */}
          <Card>
            <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wider mb-4">
              Недавняя активность
            </h2>
            <div className="space-y-3">
              {(metrics?.recentActivity || []).slice(0, 10).map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                    activity.type === 'chat' ? 'bg-primary-500' :
                    activity.type === 'agent' ? 'bg-violet-500' :
                    'bg-surface-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-300 truncate">{activity.description}</p>
                    <p className="text-xs text-surface-500">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

/** Карточка метрики */
function MetricCard({
  title,
  value,
  icon,
  change,
  subtitle,
}: {
  title: string
  value: string | number
  icon: string
  change?: string
  subtitle?: string
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-surface-100">{value}</p>
          {change && <p className="text-xs text-green-400 mt-1">{change}</p>}
          {subtitle && <p className="text-xs text-surface-500 mt-1">{subtitle}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </Card>
  )
}

/** Демо-данные для отображения без бэкенда */
const DEMO_METRICS: DashboardMetrics = {
  totalConversations: 0,
  totalMessages: 0,
  totalTokensUsed: 0,
  totalAgents: 0,
  activeAgents: 0,
  messagesToday: 0,
  tokensToday: 0,
  topModels: [
    { model: 'YandexGPT Pro', count: 0 },
    { model: 'GigaChat Pro', count: 0 },
    { model: 'DeepSeek V3', count: 0 },
    { model: 'Llama 3 70B', count: 0 },
  ],
  recentActivity: [],
}