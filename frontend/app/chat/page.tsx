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

export const dynamic = 'force-dynamic'

export default function ChatPage() {
  const router = useRouter()
  const { messages, streamState, isStreaming, sendMessage, stopStreaming } = useChat()
  const { createConversation } = useConversations()
  const [selectedModel, setSelectedModel] = useState('YandexGPT Pro')
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false)

  const handleSend = async (content: string, files?: File[]) => {
    const id = await createConversation('Новый чат', selectedModel)
    router.push(`/chat/${id}`)
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatWindow
        messages={messages}
        streamState={streamState}
        isStreaming={isStreaming}
      />
      <ChatInput
        onSend={handleSend}
        isStreaming={isStreaming}
        onStop={stopStreaming}
        onAttachClick={() => {}}
      />
    </div>
  )
}