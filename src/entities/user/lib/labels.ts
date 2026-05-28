import type { UserStatus } from '../model/types'

export const userStatusLabels: Record<UserStatus, string> = {
  regular: 'Обычный',
  subscribed: 'С подпиской',
}

export function getUserListStatusLabel(status: UserStatus) {
  return userStatusLabels[status]
}
