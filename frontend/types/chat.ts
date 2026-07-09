export interface ChatMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  toolCalls?: ToolCall[]
  artifacts?: Artifact[]
  tokensIn?: number
  tokensOut?: number
  latencyMs?: number
  createdAt: string
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  result?: string
}

export interface Artifact {
  id: string
  type: 'image' | 'code' | 'chart' | 'file'
  url: string
  name: string
  mimeType?: string
  content?: string
}

export interface Conversation {
  id: string
  title: string
  model: string
  userId: string
  projectId?: string
  messageCount: number
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ConversationSummary {
  id: string
  title: string
  model: string
  messageCount: number
  lastMessage?: string
  createdAt: string
  updatedAt: string
}

/** Модель LLM, доступная для выбора */
export interface LLMModel {
  id: string
  name: string
  provider: 'yandexgpt' | 'gigachat' | 'deepseek' | 'vllm' | 'openai'
  description: string
  maxTokens: number
  isAvailable: boolean
}

/** Параметры отправки сообщения */
export interface SendMessageParams {
  conversationId?: string // Если не указан — создаётся новый
  content: string
  model: string
  files?: File[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

/** Состояние стриминга чата */
export interface ChatStreamState {
  status: 'idle' | 'connecting' | 'streaming' | 'done' | 'error'
  content: string
  error?: string
}

/** Событие SSE от бэкенда */
export interface SSEChatEvent {
  type: 'token' | 'done' | 'error' | 'tool_call' | 'artifact'
  data: string
}

/** Загружаемый файл */
export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  status: 'uploading' | 'uploaded' | 'error'
}