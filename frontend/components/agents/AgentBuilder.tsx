/**
 * AgentBuilder — визуальный конструктор агентов.
 * Позволяет настроить системный промпт, выбрать инструменты,
 * модель и параметры агента.
 *
 * Для редактирования кода использует обычный <textarea>.
 * При необходимости можно подключить Monaco Editor.
 */

'use client'

import React, { useState, useCallback } from 'react'
import type { AgentDefinition, AgentTool, AgentConfig } from '@/types/agent'
import { DEFAULT_TOOLS, TOOL_CATEGORIES } from '@/types/agent'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { cn, generateId } from '@/lib/utils'

interface AgentBuilderProps {
  /** Существующий агент для редактирования */
  initialAgent?: AgentDefinition
  /** Сохранение агента */
  onSave: (agent: Omit<AgentDefinition, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  /** Запуск агента */
  onRun?: (agentId: string) => void
  /** Отмена */
  onCancel?: () => void
}

/** Доступные модели для агентов */
const AGENT_MODELS = [
  { id: 'yandexgpt-pro', name: 'YandexGPT Pro', provider: 'Яндекс' },
  { id: 'gigachat-pro', name: 'GigaChat Pro', provider: 'Сбер' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek' },
  { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'vLLM' },
  { id: 'qwen-2.5-72b', name: 'Qwen 2.5 72B', provider: 'vLLM' },
]

export function AgentBuilder({ initialAgent, onSave, onRun, onCancel }: AgentBuilderProps) {
  const [name, setName] = useState(initialAgent?.name || '')
  const [description, setDescription] = useState(initialAgent?.description || '')
  const [systemPrompt, setSystemPrompt] = useState(initialAgent?.systemPrompt || DEFAULT_SYSTEM_PROMPT)
  const [selectedTools, setSelectedTools] = useState<string[]>(
    initialAgent?.tools.map((t) => t.id) || ['web_search'],
  )
  const [config, setConfig] = useState<AgentConfig>(
    initialAgent?.config || {
      model: 'yandexgpt-pro',
      temperature: 0.7,
      maxTokens: 4096,
      maxIterations: 10,
      tools: selectedTools,
      memory: true,
      allowCodeExecution: false,
      sandbox: true,
    },
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /** Переключение инструмента */
  const toggleTool = useCallback((toolId: string) => {
    setSelectedTools((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId],
    )
  }, [])

  /** Сохранение агента */
  const handleSave = async () => {
    if (!name.trim()) {
      setError('Введите название агента')
      return
    }

    setError(null)
    setIsSaving(true)

    try {
      const selectedToolObjects = DEFAULT_TOOLS.filter((t) => selectedTools.includes(t.id))

      await onSave({
        projectId: initialAgent?.projectId || 'default',
        name: name.trim(),
        description: description.trim(),
        systemPrompt,
        tools: selectedToolObjects,
        config: {
          ...config,
          tools: selectedTools,
        },
        isActive: true,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setIsSaving(false)
    }
  }

  // Группировка инструментов по категориям
  const groupedTools = DEFAULT_TOOLS.reduce(
    (acc, tool) => {
      const category = tool.category
      if (!acc[category]) acc[category] = []
      acc[category].push(tool)
      return acc
    },
    {} as Record<string, AgentTool[]>,
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Основная информация */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-100 mb-4">Основная информация</h2>
        <div className="space-y-4">
          <Input
            label="Название агента"
            placeholder="Мой ассистент"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Описание"
            placeholder="Краткое описание возможностей агента"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Card>

      {/* Системный промпт */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-100 mb-4">
          Системный промпт
          <span className="text-xs text-surface-500 font-normal ml-2">
            Определяет поведение агента
          </span>
        </h2>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={10}
          className="w-full bg-surface-900 text-surface-100 border border-surface-700 rounded-xl p-4
            font-mono text-sm leading-relaxed resize-y
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
            placeholder:text-surface-600"
          placeholder="Опишите роль и задачи агента..."
        />
      </Card>

      {/* Инструменты */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-100 mb-4">
          Инструменты
          <span className="text-xs text-surface-500 font-normal ml-2">
            Что умеет агент
          </span>
        </h2>
        <div className="space-y-4">
          {Object.entries(groupedTools).map(([category, tools]) => (
            <div key={category}>
              <h3 className="text-sm font-medium text-surface-400 mb-2">
                {TOOL_CATEGORIES[category] || category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm border transition-all duration-200',
                      selectedTools.includes(tool.id)
                        ? 'bg-primary-500/15 border-primary-500/40 text-primary-300'
                        : 'bg-surface-800 border-surface-700 text-surface-400 hover:text-surface-200 hover:border-surface-600',
                    )}
                    title={tool.description}
                  >
                    {tool.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Конфигурация модели */}
      <Card>
        <h2 className="text-lg font-semibold text-surface-100 mb-4">Конфигурация модели</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Выбор модели */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Модель</label>
            <select
              value={config.model}
              onChange={(e) => setConfig((prev) => ({ ...prev, model: e.target.value }))}
              className="w-full bg-surface-800 text-surface-100 border border-surface-700 rounded-xl px-4 py-2.5
                focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
            >
              {AGENT_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Температура: {config.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) => setConfig((prev) => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-surface-500 mt-1">
              <span>Точный</span>
              <span>Креативный</span>
            </div>
          </div>

          {/* Max tokens */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Макс. токенов: {config.maxTokens}
            </label>
            <input
              type="range"
              min="512"
              max="32768"
              step="512"
              value={config.maxTokens}
              onChange={(e) => setConfig((prev) => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
              className="w-full accent-primary-500"
            />
          </div>

          {/* Max iterations */}
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">
              Макс. итераций: {config.maxIterations}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={config.maxIterations}
              onChange={(e) => setConfig((prev) => ({ ...prev, maxIterations: parseInt(e.target.value) }))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>

        {/* Чекбоксы */}
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.memory}
              onChange={(e) => setConfig((prev) => ({ ...prev, memory: e.target.checked }))}
              className="rounded border-surface-600 bg-surface-800 accent-primary-500"
            />
            Память (история диалога)
          </label>
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.allowCodeExecution}
              onChange={(e) => setConfig((prev) => ({ ...prev, allowCodeExecution: e.target.checked }))}
              className="rounded border-surface-600 bg-surface-800 accent-primary-500"
            />
            Выполнение кода
          </label>
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={config.sandbox}
              onChange={(e) => setConfig((prev) => ({ ...prev, sandbox: e.target.checked }))}
              className="rounded border-surface-600 bg-surface-800 accent-primary-500"
            />
            Песочница (изоляция)
          </label>
        </div>
      </Card>

      {/* Ошибка */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Кнопки действий */}
      <div className="flex items-center gap-3">
        <Button variant="primary" size="lg" loading={isSaving} onClick={handleSave}>
          {initialAgent ? 'Сохранить изменения' : 'Создать агента'}
        </Button>

        {initialAgent && onRun && (
          <Button variant="secondary" size="lg" onClick={() => onRun(initialAgent.id)}>
            Запустить
          </Button>
        )}

        {onCancel && (
          <Button variant="ghost" size="lg" onClick={onCancel}>
            Отмена
          </Button>
        )}
      </div>
    </div>
  )
}

/** Стандартный системный промпт для нового агента */
const DEFAULT_SYSTEM_PROMPT = `Ты — AI-агент, созданный на платформе Super AI RU.

Твои возможности:
- Отвечать на вопросы пользователя
- Использовать доступные инструменты для поиска информации
- Анализировать данные и создавать отчёты
- Генерировать код и изображения

Правила работы:
1. Всегда отвечай на русском языке
2. Будь полезным, точным и безопасным
3. Если не знаешь ответа — скажи об этом
4. Используй инструменты, когда это необходимо
5. Следуй инструкциям пользователя

Текущая дата: {current_date}`