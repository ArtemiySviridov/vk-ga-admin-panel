import { getApiErrorMessage, httpClient } from './httpClient'

export type UserStatus = 'regular' | 'subscribed'

export type TokenOperationType = 'add' | 'subtract' | 'set'

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

export type TokenOperation = {
  id: string
  userId: string
  type: TokenOperationType
  amount: number
  balanceChange: string
  comment: string
  createdAt: string
}

export type TokenOperationPayload = {
  type: TokenOperationType
  amount: number
  comment: string
}

export type TokenSettings = {
  regularBaseTokens: number
  subscribedBaseTokens: number
  postGenerationCost: number
  imageGenerationCost: number
  updatedAt: string
}

export type TokenSettingsPayload = Omit<TokenSettings, 'updatedAt'>

export type CursorPage<T> = {
  items: T[]
  nextCursor: string | null
}

export type UserDetails = {
  user: AdminUser
  operations: TokenOperation[]
}

export type AdminApi = {
  listUsers(params: {
    cursor: string | null
    limit: number
    registrationOrder: UserRegistrationOrder
    searchQuery: string
    statusFilter: UserStatusFilter
  }): Promise<CursorPage<AdminUser>>
  getUser(userId: string): Promise<UserDetails>
  applyTokenOperation(
    userId: string,
    payload: TokenOperationPayload,
  ): Promise<UserDetails>
  getTokenSettings(): Promise<TokenSettings>
  updateTokenSettings(payload: TokenSettingsPayload): Promise<TokenSettings>
}

type BalanceActionDto = 'increase' | 'decrease' | 'set'

type SortOrderDto = 'asc' | 'desc'

type UsersListItemDto = {
  id: number
  avatar: string
  fullName: string
  registeredAt: string
  isDonut: boolean
  balance: number
}

type UsersListResponseDto = {
  items: UsersListItemDto[]
  meta: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

type LogsListItemDto = {
  id: number
  action: BalanceActionDto
  amount: number
  change: string
  comment?: string | null
  datetime: string
}

type UserDetailsResponseDto = UsersListItemDto & {
  lastBalanceResetAt: string
  logs: LogsListItemDto[]
}

type UserBalanceUpdateRequestDto = {
  action: BalanceActionDto
  amount: number
  comment?: string | null
}

type GenerationSettingsDto = {
  baseTokens: number
  donutTokens: number
  postCost: number
  imageCost: number
}

type GenerationSettingsUpdateRequestDto = GenerationSettingsDto

function mapStatus(isDonut: boolean): UserStatus {
  return isDonut ? 'subscribed' : 'regular'
}

function mapListUser(dto: UsersListItemDto): AdminUser {
  return {
    id: String(dto.id),
    vkId: dto.id,
    fullName: dto.fullName,
    avatarUrl: dto.avatar,
    tokenBalance: dto.balance,
    status: mapStatus(dto.isDonut),
    balanceUpdatedAt: dto.registeredAt,
    registeredAt: dto.registeredAt,
  }
}

function mapDetailsUser(dto: UserDetailsResponseDto): AdminUser {
  return {
    ...mapListUser(dto),
    balanceUpdatedAt: dto.lastBalanceResetAt,
  }
}

function mapActionToOperationType(action: BalanceActionDto): TokenOperationType {
  if (action === 'increase') {
    return 'add'
  }

  if (action === 'decrease') {
    return 'subtract'
  }

  return 'set'
}

function mapOperationTypeToAction(type: TokenOperationType): BalanceActionDto {
  if (type === 'add') {
    return 'increase'
  }

  if (type === 'subtract') {
    return 'decrease'
  }

  return 'set'
}

function mapRegistrationOrder(order: UserRegistrationOrder): SortOrderDto {
  return order === 'oldest' ? 'asc' : 'desc'
}

function mapStatusFilter(statusFilter: UserStatusFilter): boolean | undefined {
  if (statusFilter === 'all') {
    return undefined
  }

  return statusFilter === 'subscribed'
}

function mapLog(userId: string, dto: LogsListItemDto): TokenOperation {
  return {
    id: String(dto.id),
    userId,
    type: mapActionToOperationType(dto.action),
    amount: dto.amount,
    balanceChange: dto.change,
    comment: dto.comment ?? '',
    createdAt: dto.datetime,
  }
}

function mapUserDetails(dto: UserDetailsResponseDto): UserDetails {
  const user = mapDetailsUser(dto)

  return {
    user,
    operations: dto.logs.map((log) => mapLog(user.id, log)),
  }
}

function mapTokenSettings(dto: GenerationSettingsDto): TokenSettings {
  return {
    regularBaseTokens: dto.baseTokens,
    subscribedBaseTokens: dto.donutTokens,
    postGenerationCost: dto.postCost,
    imageGenerationCost: dto.imageCost,
    updatedAt: new Date().toISOString(),
  }
}

function mapTokenSettingsPayload(
  payload: TokenSettingsPayload,
): GenerationSettingsUpdateRequestDto {
  return {
    baseTokens: payload.regularBaseTokens,
    donutTokens: payload.subscribedBaseTokens,
    postCost: payload.postGenerationCost,
    imageCost: payload.imageGenerationCost,
  }
}

export function createAdminApi(): AdminApi {
  return {
    async listUsers({
      cursor,
      limit,
      registrationOrder,
      searchQuery,
      statusFilter,
    }) {
      const offset = cursor ? Number(cursor) : 0
      const trimmedSearch = searchQuery.trim()

      try {
        const response = await httpClient.get<UsersListResponseDto>(
          '/api/v1/admin/users',
          {
            params: {
              is_donut: mapStatusFilter(statusFilter),
              limit,
              offset: Number.isFinite(offset) ? offset : 0,
              search: trimmedSearch || undefined,
              sort_order: mapRegistrationOrder(registrationOrder),
            },
          },
        )
        const { items, meta } = response.data

        return {
          items: items.map(mapListUser),
          nextCursor: meta.hasMore ? String(meta.offset + meta.limit) : null,
        }
      } catch (error) {
        throw new Error(
          getApiErrorMessage(error, 'Не удалось загрузить пользователей.'),
          { cause: error },
        )
      }
    },

    async getUser(userId) {
      try {
        const response = await httpClient.get<UserDetailsResponseDto>(
          `/api/v1/admin/users/${userId}`,
        )

        return mapUserDetails(response.data)
      } catch (error) {
        throw new Error(
          getApiErrorMessage(error, 'Не удалось загрузить пользователя.'),
          { cause: error },
        )
      }
    },

    async applyTokenOperation(userId, payload) {
      const requestBody: UserBalanceUpdateRequestDto = {
        action: mapOperationTypeToAction(payload.type),
        amount: payload.amount,
        comment: payload.comment || null,
      }

      try {
        await httpClient.post(`/api/v1/admin/users/${userId}/balance`, requestBody)

        const details = await this.getUser(userId)

        return details
      } catch (error) {
        throw new Error(
          getApiErrorMessage(error, 'Не удалось применить операцию.'),
          { cause: error },
        )
      }
    },

    async getTokenSettings() {
      try {
        const response = await httpClient.get<GenerationSettingsDto>(
          '/api/v1/admin/generation-settings',
        )

        return mapTokenSettings(response.data)
      } catch (error) {
        throw new Error(
          getApiErrorMessage(error, 'Не удалось загрузить настройки токенов.'),
          { cause: error },
        )
      }
    },

    async updateTokenSettings(payload) {
      try {
        const response = await httpClient.post<GenerationSettingsDto>(
          '/api/v1/admin/generation-settings',
          mapTokenSettingsPayload(payload),
        )

        return mapTokenSettings(response.data)
      } catch (error) {
        throw new Error(
          getApiErrorMessage(error, 'Не удалось сохранить настройки токенов.'),
          { cause: error },
        )
      }
    },
  }
}

export const adminApi = createAdminApi()
