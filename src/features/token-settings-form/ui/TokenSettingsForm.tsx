import { type FormEvent, useState } from 'react'
import type {
  TokenSettings,
  TokenSettingsPayload,
} from '../../../entities/token-settings'
import { formatTokens, getDraftTokens } from '../../../shared/lib/format'
import './TokenSettingsForm.css'

type TokenSettingsFormState = Record<keyof TokenSettingsPayload, string>

type TokenSettingsFormProps = {
  settings: TokenSettings
  onSubmit: (payload: TokenSettingsPayload) => Promise<TokenSettings>
}

function createSettingsForm(settings: TokenSettings): TokenSettingsFormState {
  return {
    regularBaseTokens: String(settings.regularBaseTokens),
    subscribedBaseTokens: String(settings.subscribedBaseTokens),
    postGenerationCost: String(settings.postGenerationCost),
    imageGenerationCost: String(settings.imageGenerationCost),
  }
}

export function TokenSettingsForm({
  settings,
  onSubmit,
}: TokenSettingsFormProps) {
  const [form, setForm] = useState<TokenSettingsFormState>(
    createSettingsForm(settings),
  )
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  function handleChange(field: keyof TokenSettingsPayload, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
    setError('')
    setSuccess('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextSettings: TokenSettingsPayload = {
      regularBaseTokens: Number(form.regularBaseTokens),
      subscribedBaseTokens: Number(form.subscribedBaseTokens),
      postGenerationCost: Number(form.postGenerationCost),
      imageGenerationCost: Number(form.imageGenerationCost),
    }
    const hasInvalidValue = Object.values(nextSettings).some(
      (value) =>
        !Number.isFinite(value) || !Number.isInteger(value) || value < 0,
    )

    if (hasInvalidValue) {
      setError('Укажите целые значения от 0 для всех настроек.')
      setSuccess('')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      const savedSettings = await onSubmit(nextSettings)

      setForm(createSettingsForm(savedSettings))
      setSuccess('Настройки токенов сохранены.')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось сохранить настройки токенов.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="settings-grid">
        <label className="settings-field" htmlFor="regular-base">
          <span>Базовые токены без подписки</span>
          <input
            id="regular-base"
            type="number"
            min={0}
            step={1}
            value={form.regularBaseTokens}
            onChange={(event) =>
              handleChange('regularBaseTokens', event.target.value)
            }
          />
        </label>

        <label className="settings-field" htmlFor="subscribed-base">
          <span>Базовые токены с подпиской</span>
          <input
            id="subscribed-base"
            type="number"
            min={0}
            step={1}
            value={form.subscribedBaseTokens}
            onChange={(event) =>
              handleChange('subscribedBaseTokens', event.target.value)
            }
          />
        </label>

        <label className="settings-field" htmlFor="post-cost">
          <span>Цена генерации поста</span>
          <input
            id="post-cost"
            type="number"
            min={0}
            step={1}
            value={form.postGenerationCost}
            onChange={(event) =>
              handleChange('postGenerationCost', event.target.value)
            }
          />
        </label>

        <label className="settings-field" htmlFor="image-cost">
          <span>Цена генерации изображения</span>
          <input
            id="image-cost"
            type="number"
            min={0}
            step={1}
            value={form.imageGenerationCost}
            onChange={(event) =>
              handleChange('imageGenerationCost', event.target.value)
            }
          />
        </label>
      </div>

      <div className="settings-summary">
        <div>
          <span>Обычный пользователь</span>
          <strong>
            {formatTokens(getDraftTokens(form.regularBaseTokens))} ток.
          </strong>
        </div>
        <div>
          <span>Пользователь с подпиской</span>
          <strong>
            {formatTokens(getDraftTokens(form.subscribedBaseTokens))} ток.
          </strong>
        </div>
        <div>
          <span>Пост + изображение</span>
          <strong>
            {formatTokens(
              getDraftTokens(form.postGenerationCost) +
                getDraftTokens(form.imageGenerationCost),
            )}{' '}
            ток.
          </strong>
        </div>
      </div>

      {error ? (
        <div className="form-error" role="alert">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="form-success" role="status">
          {success}
        </div>
      ) : null}

      <button className="button button-primary" type="submit" disabled={isSaving}>
        {isSaving ? 'Сохраняем...' : 'Сохранить настройки'}
      </button>
    </form>
  )
}
