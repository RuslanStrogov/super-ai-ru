/**
 * NextAuth маршруты — /api/auth/[...nextauth]/route.ts.
 * Обрабатывает аутентификацию через NextAuth.js.
 * Проксирует запросы к бэкенду /api/v1/auth/.
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Обработчик NextAuth маршрутов.
 * Проксирует все методы (GET, POST) к бэкенду /api/v1/auth/.
 * В production заменить на полноценную NextAuth конфигурацию
 * с провайдерами (Credentials, OIDC).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { nextauth: string[] } },
) {
  const path = params.nextauth.join('/')
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Проксируем заголовок авторизации, если есть
        ...(request.headers.get('authorization')
          ? { Authorization: request.headers.get('authorization')! }
          : {}),
      },
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Set-Cookie': response.headers.get('set-cookie') || '',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Backend unreachable' },
      { status: 503 },
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { nextauth: string[] } },
) {
  const path = params.nextauth.join('/')
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  try {
    const body = await request.json()

    const response = await fetch(`${apiUrl}/api/v1/auth/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization')
          ? { Authorization: request.headers.get('authorization')! }
          : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Set-Cookie': response.headers.get('set-cookie') || '',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Backend unreachable' },
      { status: 503 },
    )
  }
}