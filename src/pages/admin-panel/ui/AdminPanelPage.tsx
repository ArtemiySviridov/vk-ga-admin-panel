import { useState } from 'react'
import type { AuthSession } from '../../../entities/session'
import { TokenSettingsWidget } from '../../../widgets/token-settings'
import { UsersManagement } from '../../../widgets/users-management'
import './AdminPanelPage.css'

type AdminTab = 'users' | 'tokens'

type AdminPanelPageProps = {
  session: AuthSession
  onLogout: () => void
}

export function AdminPanelPage({ session, onLogout }: AdminPanelPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('users')

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">VK Mini App</p>
          <h1>Админ-панель токенов</h1>
        </div>

        <div className="admin-session">
          <span>{session.login}</span>
          <button type="button" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Разделы админ-панели">
        <button
          className={
            activeTab === 'users' ? 'tab-button tab-button-active' : 'tab-button'
          }
          type="button"
          id="users-tab"
          aria-controls="users-content"
          aria-selected={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
        >
          Управление пользователями
        </button>
        <button
          className={
            activeTab === 'tokens'
              ? 'tab-button tab-button-active'
              : 'tab-button'
          }
          type="button"
          id="tokens-tab"
          aria-controls="tokens-content"
          aria-selected={activeTab === 'tokens'}
          onClick={() => setActiveTab('tokens')}
        >
          Настройка токенов
        </button>
      </nav>

      {activeTab === 'users' ? <UsersManagement /> : <TokenSettingsWidget />}
    </main>
  )
}
