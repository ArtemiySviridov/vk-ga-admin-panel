import { LoginForm } from '../../../features/login-form'
import type { AuthSession } from '../../../entities/session'
import { authApi, type LoginPayload } from '../../../shared/api'
import './AuthPage.css'

type AuthPageProps = {
  onAuthenticated: (session: AuthSession) => void
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  async function handleLogin(payload: LoginPayload) {
    const result = await authApi.login(payload)

    onAuthenticated({
      accessToken: result.accessToken,
      login: result.login,
    })
  }

  return (
    <main className="auth-shell">
      <section className="panel auth-panel">
        <div className="panel-header">
          <div>
            <p className="auth-kicker">VK Mini App</p>
            <h1>Вход в админ-панель</h1>
          </div>
        </div>

        <LoginForm onSubmit={handleLogin} />
      </section>
    </main>
  )
}
