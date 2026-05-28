import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TokenOperationForm } from '../../../features/token-operation-form'
import { UserListFilters } from '../../../features/user-list-filters'
import {
  type TokenOperation,
  type TokenOperationPayload,
  TokenOperationsList,
} from '../../../entities/token-operation'
import {
  type AdminUser,
  type UserRegistrationOrder,
  type UserStatusFilter,
  UserCard,
  UserInfoPanel,
} from '../../../entities/user'
import { adminApi } from '../../../shared/api'
import './UsersManagement.css'

const PAGE_SIZE = 5

export function UsersManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all')
  const [registrationOrder, setRegistrationOrder] =
    useState<UserRegistrationOrder>('newest')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [usersError, setUsersError] = useState('')
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserDetails, setSelectedUserDetails] =
    useState<AdminUser | null>(null)
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false)
  const [operations, setOperations] = useState<TokenOperation[]>([])
  const [isUsersLoading, setIsUsersLoading] = useState(true)
  const [isOperationsLoading, setIsOperationsLoading] = useState(false)
  const [isMoreLoading, setIsMoreLoading] = useState(false)
  const usersScrollRef = useRef<HTMLDivElement | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const listQueryKeyRef = useRef('')

  const selectedUser = useMemo(
    () =>
      selectedUserDetails ??
      users.find((user) => user.id === selectedUserId) ??
      null,
    [selectedUserDetails, selectedUserId, users],
  )

  const listQueryKey = `${debouncedSearchQuery}|${statusFilter}|${registrationOrder}`

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim())
    }, 350)

    return () => {
      window.clearTimeout(debounceTimer)
    }
  }, [searchQuery])

  useEffect(() => {
    listQueryKeyRef.current = listQueryKey
  }, [listQueryKey])

  useEffect(() => {
    let ignore = false

    async function loadInitialUsers() {
      setIsUsersLoading(true)

      try {
        const page = await adminApi.listUsers({
          cursor: null,
          limit: PAGE_SIZE,
          registrationOrder,
          searchQuery: debouncedSearchQuery,
          statusFilter,
        })

        if (ignore) {
          return
        }

        setUsers(page.items)
        setNextCursor(page.nextCursor)
        setSelectedUserId(page.items[0]?.id ?? null)
        setSelectedUserDetails(null)
        setOperations([])
        setUsersError('')
        setIsMobileDetailsOpen(false)
      } catch (error) {
        if (!ignore) {
          setUsers([])
          setNextCursor(null)
          setSelectedUserId(null)
          setSelectedUserDetails(null)
          setOperations([])
          setUsersError(
            error instanceof Error
              ? error.message
              : 'Не удалось загрузить пользователей.',
          )
        }
      } finally {
        if (!ignore) {
          setIsUsersLoading(false)
        }
      }
    }

    loadInitialUsers()

    return () => {
      ignore = true
    }
  }, [debouncedSearchQuery, registrationOrder, statusFilter])

  useEffect(() => {
    let ignore = false

    async function loadOperations(userId: string) {
      setIsOperationsLoading(true)

      try {
        const details = await adminApi.getUser(userId)

        if (!ignore) {
          setSelectedUserDetails(details.user)
          setOperations(details.operations)
          setUsers((currentUsers) =>
            currentUsers.map((user) =>
              user.id === details.user.id ? details.user : user,
            ),
          )
        }
      } finally {
        if (!ignore) {
          setIsOperationsLoading(false)
        }
      }
    }

    if (selectedUserId) {
      loadOperations(selectedUserId)
    }

    return () => {
      ignore = true
    }
  }, [selectedUserId])

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isMoreLoading || isUsersLoading) {
      return
    }

    const requestQueryKey = listQueryKey

    setIsMoreLoading(true)

    try {
      const page = await adminApi.listUsers({
        cursor: nextCursor,
        limit: PAGE_SIZE,
        registrationOrder,
        searchQuery: debouncedSearchQuery,
        statusFilter,
      })

      if (listQueryKeyRef.current !== requestQueryKey) {
        return
      }

      setUsers((currentUsers) => [...currentUsers, ...page.items])
      setNextCursor(page.nextCursor)
      setUsersError('')
    } catch (error) {
      setUsersError(
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить следующую страницу.',
      )
    } finally {
      setIsMoreLoading(false)
    }
  }, [
    debouncedSearchQuery,
    isMoreLoading,
    isUsersLoading,
    listQueryKey,
    nextCursor,
    registrationOrder,
    statusFilter,
  ])

  useEffect(() => {
    const sentinel = loadMoreRef.current
    const scrollRoot = usersScrollRef.current

    if (
      !sentinel ||
      !scrollRoot ||
      !nextCursor ||
      isUsersLoading ||
      isMoreLoading
    ) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void handleLoadMore()
        }
      },
      {
        root: scrollRoot,
        rootMargin: '160px 0px',
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [handleLoadMore, isMoreLoading, isUsersLoading, nextCursor, users.length])

  function handleUserSelect(userId: string) {
    setSelectedUserId(userId)
    setSelectedUserDetails(null)
    setIsMobileDetailsOpen(true)
  }

  function handleBackToUsers() {
    setIsMobileDetailsOpen(false)
  }

  async function handleApplyTokenOperation(payload: TokenOperationPayload) {
    if (!selectedUser) {
      return
    }

    const details = await adminApi.applyTokenOperation(
      selectedUser.id,
      payload,
    )

    setSelectedUserDetails(details.user)
    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === details.user.id ? details.user : currentUser,
      ),
    )
    setOperations(details.operations)
  }

  return (
    <section
      id="users-content"
      className={
        isMobileDetailsOpen ? 'users-grid users-grid-details-open' : 'users-grid'
      }
      aria-labelledby="users-tab"
    >
      <aside className="panel users-panel">
        <div className="panel-header">
          <div>
            <h2>Пользователи приложения</h2>
            <p>
              Показано {users.length}
              {nextCursor ? '+' : ''}
            </p>
          </div>
        </div>

        <UserListFilters
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          registrationOrder={registrationOrder}
          onSearchQueryChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onRegistrationOrderChange={setRegistrationOrder}
        />

        {isUsersLoading ? (
          <div className="empty-state">Загружаем пользователей...</div>
        ) : usersError ? (
          <div className="empty-state">{usersError}</div>
        ) : (
          <div className="users-list-scroll" ref={usersScrollRef}>
            <div className="users-list">
              {users.map((user) => (
                <UserCard
                  isSelected={user.id === selectedUserId}
                  key={user.id}
                  user={user}
                  onSelect={handleUserSelect}
                />
              ))}
            </div>

            {users.length === 0 ? (
              <div className="empty-state">Пользователи не найдены.</div>
            ) : null}

            {users.length > 0 ? (
              <div className="load-more-sentinel" ref={loadMoreRef}>
                {isMoreLoading
                  ? 'Загружаем еще...'
                  : nextCursor
                    ? ''
                    : 'Все пользователи загружены'}
              </div>
            ) : null}
          </div>
        )}
      </aside>

      <div className="details-column">
        {selectedUser ? (
          <>
            <div className="mobile-details-bar">
              <button
                className="mobile-back-button"
                type="button"
                onClick={handleBackToUsers}
              >
                Назад к списку
              </button>
            </div>

            <UserInfoPanel user={selectedUser} />

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Изменить баланс</h2>
                  <p>Укажите количество токенов и причину операции</p>
                </div>
              </div>

              <TokenOperationForm onSubmit={handleApplyTokenOperation} />
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h2>Последние операции пользователя</h2>
                  <p>
                    {isOperationsLoading
                      ? 'Обновляем список'
                      : 'История ручных изменений'}
                  </p>
                </div>
              </div>

              <TokenOperationsList
                isLoading={isOperationsLoading}
                operations={operations}
              />
            </section>
          </>
        ) : (
          <section className="panel">
            <div className="empty-state">Выберите пользователя из списка.</div>
          </section>
        )}
      </div>
    </section>
  )
}
