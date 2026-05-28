import type {
  UserRegistrationOrder,
  UserStatusFilter,
} from '../../../entities/user'
import './UserListFilters.css'

const statusFilterOptions: Array<{
  label: string
  value: UserStatusFilter
}> = [
  { label: 'Все', value: 'all' },
  { label: 'Подписанные', value: 'subscribed' },
  { label: 'Без подписки', value: 'regular' },
]

const registrationOrderOptions: Array<{
  label: string
  value: UserRegistrationOrder
}> = [
  { label: 'Новые', value: 'newest' },
  { label: 'Старые', value: 'oldest' },
]

type UserListFiltersProps = {
  searchQuery: string
  statusFilter: UserStatusFilter
  registrationOrder: UserRegistrationOrder
  onSearchQueryChange: (value: string) => void
  onStatusFilterChange: (value: UserStatusFilter) => void
  onRegistrationOrderChange: (value: UserRegistrationOrder) => void
}

export function UserListFilters({
  searchQuery,
  statusFilter,
  registrationOrder,
  onSearchQueryChange,
  onStatusFilterChange,
  onRegistrationOrderChange,
}: UserListFiltersProps) {
  return (
    <div className="users-toolbar">
      <label className="search-field" htmlFor="user-search">
        <span>Поиск</span>
        <input
          id="user-search"
          type="search"
          value={searchQuery}
          placeholder="ФИО или VK ID"
          onChange={(event) => onSearchQueryChange(event.target.value)}
        />
      </label>

      <div className="filter-block">
        <span>Подписка</span>
        <div className="filter-segments">
          {statusFilterOptions.map((option) => (
            <button
              className={
                statusFilter === option.value
                  ? 'filter-chip filter-chip-active'
                  : 'filter-chip'
              }
              key={option.value}
              type="button"
              onClick={() => onStatusFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-block">
        <span>Регистрация</span>
        <div className="filter-segments">
          {registrationOrderOptions.map((option) => (
            <button
              className={
                registrationOrder === option.value
                  ? 'filter-chip filter-chip-active'
                  : 'filter-chip'
              }
              key={option.value}
              type="button"
              onClick={() => onRegistrationOrderChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
