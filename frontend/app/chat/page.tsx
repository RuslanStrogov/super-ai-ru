/**
 * Страница чата — /chat.
 * Основной интерфейс чата с SSE streaming.
 * CSR — только клиентский рендеринг.
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ChatInput } from '@/components/chat/ChatInput'
import { ModelSelector } from '@/components/chat/ModelSelector'
import { useChat } from '@/hooks/useChat'
import { useConversations } from '@/hooks/useConversations'
import type { LLMModel } from '@/types/chat'

export default function ChatPage() {
  const router = useRouter()
  const { messages, streamState, isStreaming, sendMessage, stopStreaming } = useChat()
  const { createConversation } = useConversations()
  const [selectedModel, setSelectedModel] = useState('YandexGPT Pro')
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)

  /** Отправка сообщения — создаём новый conversation если нужно */
  const handleSend = async (content: string, files?: File[]) => {
    // Создаём новый conversation и редиректим
    const id = await createConversation('Новый чат', selectedModel)
    router.push(`/chat/${id}`)

    // Отправляем сообщение
    await sendMessage({
      content,
      model: selectedModel,
      files,
    })
  }

  return (
    <>
      <ChatWindow
        messages={messages}
        streamState={streamState}
        isStreaming={isStreaming}
        className="flex-1"
      />

      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        onStop={stopStreaming}
        selectedModel={selectedModel}
        onOpenModelSelector={() => setModelSelectorOpen(true)}
      />

      <ModelSelector
        selectedModel={selectedModel}
        onSelect={setSelectedModel}
        models={AVAILABLE_MODELS}
        isOpen={modelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
      />
    </>
  )
}

/** Доступные модели (хардкод для UI, в реальности приходят с бэкенда) */
const AVAILABLE_MODELS: LLMModel[] = [
  {
    id: 'yandexgpt-pro',
    name: 'YandexGPT Pro',
    provider: 'yandexgpt',
    description: 'Флагманская модель Яндекса. Поддержка русского языка, высокая точность.',
    maxTokens: 8192,
    isAvailable: true,
  },
  {
    id: 'yandexgpt-lite',
    name: 'YandexGPT Lite',
    provider: 'yandexgpt',
    description: 'Быстрая и лёгкая модель для простых задач.',
    maxTokens: 4096,
    isAvailable: true,
  },
  {
    id: 'gigachat-pro',
    name: 'GigaChat Pro',
    provider: 'gigachat',
    description: 'Модель от Сбера. Оптимизирована для бизнес-задач.',
    maxTokens: 8192,
    isAvailable: true,
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    description: 'Мощная open-source модель. Отличное соотношение цена/качество.',
    maxTokens: 32768,
    isAvailable: true,
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'vllm',
    description: 'Самая мощная open-source модель от Meta. Self-hosted на GPU.',
    maxTokens: 8192,
    isAvailable: true,
  },
  {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'vllm',
    description: 'Китайская модель с отличной поддержкой кода и математики.',
    maxTokens: 32768,
    isAvailable: true,
  },
]