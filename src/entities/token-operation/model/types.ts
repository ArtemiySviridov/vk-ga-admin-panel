export type TokenOperationType = 'add' | 'subtract' | 'set'

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
