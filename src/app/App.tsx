import { useLayoutEffect, useState } from 'react'
import {
  type AuthSession,
  clearSession,
  getStoredSession,
  saveSession,
} from '../entities/session'
import { AdminPanelPage } from '../pages/admin-panel'
import { AuthPage } from '../pages/auth'
import { configureHttpClientAuth } from '../shared/api'

export function App() {
  const [session, setSession] = useState<AuthSession | null>(getStoredSession)

  useLayoutEffect(() => {
    configureHttpClientAuth({
      getAccessToken: () => getStoredSession()?.accessToken ?? null,
      onUnauthorized: () => {
        clearSession()
        setSession(null)
      },
    })
  }, [])

  function handleAuthenticated(nextSession: AuthSession) {
    saveSession(nextSession)
    setSession(nextSession)
  }

  function handleLogout() {
    clearSession()
    setSession(null)
  }

  if (!session) {
    return <AuthPage onAuthenticated={handleAuthenticated} />
  }

  return <AdminPanelPage session={session} onLogout={handleLogout} />
}
