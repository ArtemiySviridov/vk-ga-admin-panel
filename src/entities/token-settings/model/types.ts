export type TokenSettings = {
  regularBaseTokens: number
  subscribedBaseTokens: number
  postGenerationCost: number
  imageGenerationCost: number
  updatedAt: string
}

export type TokenSettingsPayload = Omit<TokenSettings, 'updatedAt'>
