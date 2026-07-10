/**
 * Страница конкретного conversation — /chat/[id].
 * Загружает историю сообщений и позволяет продолжать диалог.
 */

'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { ChatInput } from '@/components/chat/ChatInput'
import { ModelSelector } from '@/components/chat/ModelSelector'
import { useChat } from '@/hooks/useChat'
import type { LLMModel } from '@/types/chat'

export const dynamic = 'force-dynamic'

export default function ChatConversationPage() {
  const params = useParams()
  const router = useRouter()
  const conversationId = params.id as string
  const { messages, streamState, isStreaming, sendMessage, stopStreaming, loadConversation } = useChat()
  const [selectedModel, setSelectedModel] = useState('YandexGPT Pro')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId).finally(() => setIsLoading(false))
    }
  }, [conversationId])

  const handleSend = async (content: string, files?: File[]) => {
    await sendMessage(content, selectedModel, conversationId)
  }

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" /></div>
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatWindow messages={messages} streamState={streamState} isStreaming={isStreaming} />
      <ChatInput onSend={handleSend} isStreaming={isStreaming} onStop={stopStreaming} onAttachClick={() => {}} />
    </div>
  )
}