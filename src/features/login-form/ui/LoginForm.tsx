import { type FormEvent, useState } from 'react'
import type { LoginPayload } from '../../../shared/api'
import './LoginForm.css'

type LoginFormProps = {
  onSubmit: (payload: LoginPayload) => Promise<void>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!login.trim()) {
      setError('Введите логин.')
      return
    }

    if (!password) {
      setError('Введите пароль.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await onSubmit({
        login: login.trim(),
        password,
      })
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось войти.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label className="login-field" htmlFor="admin-login">
        <span>Login</span>
        <input
          autoComplete="username"
          autoFocus
          id="admin-login"
          type="text"
          value={login}
          onChange={(event) => {
            setLogin(event.target.value)
            setError('')
          }}
        />
      </label>

      <label className="login-field" htmlFor="admin-password">
        <span>Password</span>
        <input
          autoComplete="current-password"
          id="admin-password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            setError('')
          }}
        />
      </label>

      {error ? (
        <div className="form-error" role="alert">
          {error}
        </div>
      ) : null}

      <button className="button button-primary" type="submit" disabled={isLoading}>
        {isLoading ? 'Входим...' : 'Войти'}
      </button>
    </form>
  )
}
