import type { AuthSession } from '../model/types'

const AUTH_SESSION_STORAGE_KEY = 'vk-ga-admin-session'

export function getStoredSession(): AuthSession | null {
  try {
    const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)

    return rawSession ? (JSON.parse(rawSession) as AuthSession) : null
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
}
