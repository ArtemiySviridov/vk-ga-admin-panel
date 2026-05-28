import type { TokenOperation, TokenOperationType } from '../model/types'

export const tokenOperationLabels: Record<TokenOperationType, string> = {
  add: 'Начислить',
  subtract: 'Списать',
  set: 'Установить',
}

export function getTokenOperationSign(operation: TokenOperation) {
  if (operation.type === 'add') {
    return `+${operation.amount}`
  }

  if (operation.type === 'subtract') {
    return `-${operation.amount}`
  }

  return `=${operation.amount}`
}
