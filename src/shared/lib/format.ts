const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const shortDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: '2-digit',
})

export function formatDate(value: string) {
  return dateFormatter.format(new Date(value))
}

export function formatShortDate(value: string) {
  return shortDateFormatter.format(new Date(value))
}

export function formatTokens(amount: number) {
  return amount.toLocaleString('ru-RU')
}

export function getDraftTokens(value: string) {
  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : 0
}
