/** Пользователь системы */
export interface User {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'developer' | 'viewer'
  avatar?: string
  isActive: boolean
  createdAt: string
}

/** Данные для входа */
export interface LoginCredentials {
  email: string
  password: string
}

/** Данные для регистрации */
export interface RegisterData {
  email: string
  password: string
  fullName: string
}

/** Ответ от бэкенда при успешной аутентификации */
export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/** JWT токен (декодированная часть) */
export interface JWTPayload {
  sub: string
  email: string
  role: string
  exp: number
  iat: number
}

/** Состояние аутентификации на клиенте */
export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

/** Ошибка аутентификации */
export interface AuthError {
  code: 'INVALID_CREDENTIALS' | 'EMAIL_EXISTS' | 'WEAK_PASSWORD' | 'TOKEN_EXPIRED' | 'UNAUTHORIZED' | 'UNKNOWN'
  message: string
}

/** Контекст авторизации (провайдер) */
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
  error: AuthError | null
}