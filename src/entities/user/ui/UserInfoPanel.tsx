import { formatDate, formatTokens } from '../../../shared/lib/format'
import { AvatarBadge } from '../../../shared/ui'
import { userStatusLabels } from '../lib/labels'
import type { AdminUser } from '../model/types'
import './UserInfoPanel.css'

type UserInfoPanelProps = {
  user: AdminUser
}

export function UserInfoPanel({ user }: UserInfoPanelProps) {
  return (
    <section className="panel">
      <div className="profile-summary">
        <AvatarBadge fullName={user.fullName} src={user.avatarUrl} size="l" />
        <div>
          <h2>{user.fullName}</h2>
          <span className={`status-badge status-${user.status}`}>
            {userStatusLabels[user.status]}
          </span>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-cell">
          <span>VK ID</span>
          <strong>{user.vkId}</strong>
        </div>
        <div className="info-cell">
          <span>Баланс токенов</span>
          <strong>{formatTokens(user.tokenBalance)}</strong>
        </div>
        <div className="info-cell">
          <span>Статус</span>
          <strong>{userStatusLabels[user.status]}</strong>
        </div>
        <div className="info-cell">
          <span>Последнее обновление баланса</span>
          <strong>{formatDate(user.balanceUpdatedAt)}</strong>
        </div>
        <div className="info-cell">
          <span>Дата регистрации</span>
          <strong>{formatDate(user.registeredAt)}</strong>
        </div>
      </div>
    </section>
  )
}
