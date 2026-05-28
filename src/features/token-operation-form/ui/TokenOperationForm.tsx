import { type FormEvent, useState } from 'react'
import {
  type TokenOperationPayload,
  type TokenOperationType,
} from '../../../entities/token-operation'
import './TokenOperationForm.css'

const operationOptions: Array<{
  label: string
  value: TokenOperationType
}> = [
  { label: 'Начислить', value: 'add' },
  { label: 'Списать', value: 'subtract' },
  { label: 'Установить', value: 'set' },
]

type TokenOperationFormProps = {
  onSubmit: (payload: TokenOperationPayload) => Promise<void>
}

export function TokenOperationForm({ onSubmit }: TokenOperationFormProps) {
  const [operationType, setOperationType] =
    useState<TokenOperationType>('add')
  const [amount, setAmount] = useState('100')
  const [comment, setComment] = useState('Ручная корректировка')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = Number(amount)
    const trimmedComment = comment.trim()
    const isAmountInvalid =
      !Number.isFinite(parsedAmount) ||
      !Number.isInteger(parsedAmount) ||
      (operationType === 'set' ? parsedAmount < 0 : parsedAmount <= 0)

    if (isAmountInvalid) {
      setError(
        operationType === 'set'
          ? 'Укажите целое количество токенов от 0.'
          : 'Укажите целое количество токенов больше 0.',
      )
      return
    }

    if (!trimmedComment) {
      setError('Добавьте комментарий к операции.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await onSubmit({
        type: operationType,
        amount: parsedAmount,
        comment: trimmedComment,
      })
      setComment('')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось применить операцию.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="operation-form" onSubmit={handleSubmit}>
      <fieldset className="segmented-control">
        <legend>Операция</legend>
        <div className="segments">
          {operationOptions.map((option) => (
            <label
              className={
                operationType === option.value
                  ? 'segment segment-active'
                  : 'segment'
              }
              key={option.value}
            >
              <input
                type="radio"
                name="operation"
                value={option.value}
                checked={operationType === option.value}
                onChange={() => setOperationType(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-grid">
        <label className="form-field" htmlFor="amount">
          <span>Количество токенов</span>
          <input
            id="amount"
            type="number"
            min={operationType === 'set' ? 0 : 1}
            step={1}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>

        <label className="form-field" htmlFor="comment">
          <span>Комментарий</span>
          <textarea
            id="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Например: майское промо"
          />
        </label>
      </div>

      {error ? (
        <div className="form-error" role="alert">
          {error}
        </div>
      ) : null}

      <button className="button button-primary" type="submit" disabled={isLoading}>
        {isLoading ? 'Применяем...' : 'Применить изменение'}
      </button>
    </form>
  )
}
