import { formatShortDate, formatTokens } from '../../../shared/lib/format'
import { AvatarBadge } from '../../../shared/ui'
import { getUserListStatusLabel } from '../lib/labels'
import type { AdminUser } from '../model/types'
import './UserCard.css'

type UserCardProps = {
  user: AdminUser
  isSelected: boolean
  onSelect: (userId: string) => void
}

export function UserCard({ user, isSelected, onSelect }: UserCardProps) {
  return (
    <button
      className={isSelected ? 'user-card user-card-active' : 'user-card'}
      type="button"
      onClick={() => onSelect(user.id)}
    >
      <AvatarBadge fullName={user.fullName} src={user.avatarUrl} />
      <span className="user-card-main">
        <strong>{user.fullName}</strong>
        <span className="user-card-meta">
          <span className={`list-status status-${user.status}`}>
            {getUserListStatusLabel(user.status)}
          </span>
          <span>с {formatShortDate(user.registeredAt)}</span>
        </span>
      </span>
      <span className="token-pill">{formatTokens(user.tokenBalance)} ток.</span>
    </button>
  )
}
