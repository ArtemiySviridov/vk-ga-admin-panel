import { formatDate } from '../../../shared/lib/format'
import { getTokenOperationSign, tokenOperationLabels } from '../lib/labels'
import type { TokenOperation } from '../model/types'
import './TokenOperationsList.css'

type TokenOperationsListProps = {
  operations: TokenOperation[]
  isLoading: boolean
}

export function TokenOperationsList({
  operations,
  isLoading,
}: TokenOperationsListProps) {
  if (isLoading) {
    return <div className="empty-state">Загружаем операции...</div>
  }

  if (operations.length === 0) {
    return <div className="empty-state">У пользователя пока нет операций.</div>
  }

  return (
    <div className="operations-list">
      {operations.map((operation) => (
        <div className="operation-row" key={operation.id}>
          <div className={`operation-badge operation-${operation.type}`}>
            {getTokenOperationSign(operation)}
          </div>
          <div className="operation-body">
            <strong>{tokenOperationLabels[operation.type]}</strong>
            <span>{operation.comment}</span>
            <small>
              {operation.balanceChange} · {formatDate(operation.createdAt)}
            </small>
          </div>
        </div>
      ))}
    </div>
  )
}
