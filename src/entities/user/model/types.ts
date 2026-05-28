export type UserStatus = 'regular' | 'subscribed'

export type UserStatusFilter = UserStatus | 'all'

export type UserRegistrationOrder = 'newest' | 'oldest'

export type AdminUser = {
  id: string
  vkId: number
  fullName: string
  avatarUrl?: string
  tokenBalance: number
  status: UserStatus
  balanceUpdatedAt: string
  registeredAt: string
}
