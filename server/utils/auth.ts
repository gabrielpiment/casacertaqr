import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'

export const AUTH_COOKIE = 'cc_auth'

export function authToken(): string {
  const { adminPassword } = useRuntimeConfig()
  return createHash('sha256').update(`casacerta-qr:${adminPassword}`).digest('hex')
}

export function isAuthenticated(event: H3Event): boolean {
  return getCookie(event, AUTH_COOKIE) === authToken()
}

export function requireAuth(event: H3Event) {
  if (!isAuthenticated(event)) throw createError({ statusCode: 401, message: 'Não autorizado' })
}
