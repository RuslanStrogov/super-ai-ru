/**
 * ModelSelector — выпадающий список для выбора модели LLM.
 * Показывает доступные модели, провайдера и статус.
 */

'use client'

import React, { useState } from 'react'
import type { LLMModel } from '@/types/chat'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/ui/Modal'

interface ModelSelectorProps {
  /** Текущая выбранная модель */
  selectedModel: string
  /** Выбор модели */
  onSelect: (modelId: string) => void
  /** Список доступных моделей */
  models: LLMModel[]
  /** Открыт ли селектор */
  isOpen: boolean
  /** Закрыть */
  onClose: () => void
}

/** Провайдеры и их цвета */
const providerConfig: Record<string, { label: string; color: string }> = {
  yandexgpt: { label: 'YandexGPT', color: 'bg-red-600/20 text-red-400 border-red-600/30' },
  gigachat: { label: 'GigaChat', color: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' },
  deepseek: { label: 'DeepSeek', color: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
  vllm: { label: 'vLLM', color: 'bg-violet-600/20 text-violet-400 border-violet-600/30' },
  openai: { label: 'OpenAI', color: 'bg-amber-600/20 text-amber-400 border-amber-600/30' },
}

export function ModelSelector({
  selectedModel,
  onSelect,
  models,
  isOpen,
  onClose,
}: ModelSelectorProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Выберите модель"
      size="sm"
    >
      <div className="space-y-2">
        {models.map((model) => {
          const provider = providerConfig[model.provider] || {
            label: model.provider,
            color: 'bg-surface-700/50 text-surface-400 border-surface-600',
          }
          const isSelected = model.id === selectedModel

          return (
            <button
              key={model.id}
              onClick={() => {
                onSelect(model.id)
                onClose()
              }}
              disabled={!model.isAvailable}
              className={cn(
                'w-full text-left p-3 rounded-xl border transition-all duration-200',
                isSelected
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-surface-700 hover:border-surface-600 bg-surface-800/50',
                !model.isAvailable && 'opacity-50 cursor-not-allowed',
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-surface-100">{model.name}</span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full border', provider.color)}>
                  {provider.label}
                </span>
              </div>
              <p className="text-xs text-surface-400 line-clamp-1">{model.description}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-surface-500">
                  {model.maxTokens.toLocaleString()} токенов
                </span>
                {!model.isAvailable && (
                  <span className="text-xs text-amber-500">Скоро</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}