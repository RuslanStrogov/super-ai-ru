/**
 * Страница конкретного conversation — /chat/[id].
 * CSR. Загружает историю сообщений и позволяет продолжать диалог.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ChatInput } from '@/components/chat/ChatInput'
import { ModelSelector } from '@/components/chat/ModelSelector'
import { useChat } from '@/hooks/useChat'
import type { LLMModel } from '@/types/chat'

export default function ChatConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string

  const { messages, streamState, isStreaming, sendMessage, stopStreaming, loadHistory } =
    useChat(conversationId)

  const [selectedModel, setSelectedModel] = useState('YandexGPT Pro')
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  /** Загружаем историю при монтировании */
  useEffect(() => {
    if (conversationId && !historyLoaded) {
      loadHistory(conversationId)
      setHistoryLoaded(true)
    }
  }, [conversationId, loadHistory, historyLoaded])

  /** Отправка сообщения */
  const handleSend = async (content: string, files?: File[]) => {
    await sendMessage({
      conversationId,
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

/** Доступные модели */
const AVAILABLE_MODELS: LLMModel[] = [
  {
    id: 'yandexgpt-pro',
    name: 'YandexGPT Pro',
    provider: 'yandexgpt',
    description: 'Флагманская модель Яндекса.',
    maxTokens: 8192,
    isAvailable: true,
  },
  {
    id: 'yandexgpt-lite',
    name: 'YandexGPT Lite',
    provider: 'yandexgpt',
    description: 'Быстрая модель для простых задач.',
    maxTokens: 4096,
    isAvailable: true,
  },
  {
    id: 'gigachat-pro',
    name: 'GigaChat Pro',
    provider: 'gigachat',
    description: 'Модель от Сбера для бизнес-задач.',
    maxTokens: 8192,
    isAvailable: true,
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    description: 'Open-source модель. Отличное качество.',
    maxTokens: 32768,
    isAvailable: true,
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'vllm',
    description: 'Самая мощная open-source модель.',
    maxTokens: 8192,
    isAvailable: true,
  },
  {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'vllm',
    description: 'Модель с отличной поддержкой кода.',
    maxTokens: 32768,
    isAvailable: true,
  },
]