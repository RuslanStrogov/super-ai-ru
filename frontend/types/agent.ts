/** Доступный инструмент для агента */
export interface AgentTool {
  id: string
  name: string
  description: string
  category: 'search' | 'code' | 'data' | 'image' | 'file' | 'custom'
  parameters?: Record<string, unknown>
}

/** Конфигурация агента */
export interface AgentConfig {
  model: string
  temperature: number
  maxTokens: number
  maxIterations: number
  tools: string[] // ID выбранных инструментов
  memory: boolean
  allowCodeExecution: boolean
  sandbox: boolean
}

/** Определение агента */
export interface AgentDefinition {
  id: string
  projectId: string
  name: string
  description: string
  systemPrompt: string
  tools: AgentTool[]
  config: AgentConfig
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/** Краткая информация об агенте для списка */
export interface AgentSummary {
  id: string
  name: string
  description: string
  model: string
  toolCount: number
  isActive: boolean
  lastRun?: string
  createdAt: string
}

/** Результат выполнения агента */
export interface AgentRunResult {
  id: string
  agentId: string
  status: 'running' | 'completed' | 'failed' | 'cancelled'
  input: string
  output: string
  steps: AgentStep[]
  artifacts: AgentArtifact[]
  tokensUsed: number
  durationMs: number
  error?: string
  createdAt: string
}

/** Шаг выполнения агента */
export interface AgentStep {
  id: string
  agentId: string
  agentName: string
  type: 'thought' | 'action' | 'observation' | 'result'
  content: string
  toolUsed?: string
  durationMs?: number
  timestamp: string
}

/** Артефакт агента */
export interface AgentArtifact {
  id: string
  type: 'code' | 'chart' | 'image' | 'file' | 'dataframe'
  name: string
  url: string
  content?: string
}

/** Категории для группировки инструментов */
export const TOOL_CATEGORIES: Record<string, string> = {
  search: '🔍 Поиск и RAG',
  code: '💻 Код и скрипты',
  data: '📊 Данные и анализ',
  image: '🖼️ Изображения',
  file: '📁 Файлы',
  custom: '⚙️ Пользовательские',
}

/** Стандартные инструменты для выбора */
export const DEFAULT_TOOLS: AgentTool[] = [
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Поиск информации в интернете',
    category: 'search',
  },
  {
    id: 'rag_search',
    name: 'RAG Search',
    description: 'Поиск по загруженным документам',
    category: 'search',
  },
  {
    id: 'python_executor',
    name: 'Python Executor',
    description: 'Выполнение Python-кода в песочнице',
    category: 'code',
  },
  {
    id: 'code_review',
    name: 'Code Review',
    description: 'Ревью кода',
    category: 'code',
  },
  {
    id: 'data_analyzer',
    name: 'Data Analyzer',
    description: 'Анализ данных и визуализация',
    category: 'data',
  },
  {
    id: 'image_generator',
    name: 'Image Generator',
    description: 'Генерация изображений',
    category: 'image',
  },
  {
    id: 'file_reader',
    name: 'File Reader',
    description: 'Чтение файлов различных форматов',
    category: 'file',
  },
]