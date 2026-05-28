import { useEffect, useState } from 'react'
import {
  type TokenSettings,
  type TokenSettingsPayload,
} from '../../../entities/token-settings'
import { TokenSettingsForm } from '../../../features/token-settings-form'
import { adminApi } from '../../../shared/api'
import { formatDate } from '../../../shared/lib/format'
import './TokenSettingsWidget.css'

export function TokenSettingsWidget() {
  const [tokenSettings, setTokenSettings] = useState<TokenSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadTokenSettings() {
      setIsLoading(true)

      try {
        const settings = await adminApi.getTokenSettings()

        if (ignore) {
          return
        }

        setTokenSettings(settings)
        setError('')
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Не удалось загрузить настройки токенов.',
          )
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    loadTokenSettings()

    return () => {
      ignore = true
    }
  }, [])

  async function handleUpdateTokenSettings(payload: TokenSettingsPayload) {
    const savedSettings = await adminApi.updateTokenSettings(payload)

    setTokenSettings(savedSettings)
    setError('')

    return savedSettings
  }

  return (
    <section
      id="tokens-content"
      className="tokens-settings"
      aria-labelledby="tokens-tab"
    >
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Настройка токенов</h2>
            <p>
              {tokenSettings
                ? `Синхронизировано: ${formatDate(tokenSettings.updatedAt)}`
                : 'Загружаем текущие значения'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state">Загружаем настройки...</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : !tokenSettings ? (
          <div className="empty-state">Настройки токенов не найдены.</div>
        ) : (
          <TokenSettingsForm
            key={tokenSettings.updatedAt}
            settings={tokenSettings}
            onSubmit={handleUpdateTokenSettings}
          />
        )}
      </section>
    </section>
  )
}
