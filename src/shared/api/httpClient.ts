import axios, { AxiosHeaders } from 'axios'

const DEFAULT_API_BASE_URL = 'https://vk.wonderrfau1t.site'

let accessTokenProvider: (() => string | null) | null = null
let unauthorizedHandler: (() => void) | null = null

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL,
})

export function configureHttpClientAuth({
  getAccessToken,
  onUnauthorized,
}: {
  getAccessToken: () => string | null
  onUnauthorized: () => void
}) {
  accessTokenProvider = getAccessToken
  unauthorizedHandler = onUnauthorized
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage
  }

  const responseData = error.response?.data as
    | { detail?: unknown; message?: unknown }
    | undefined

  if (typeof responseData?.message === 'string') {
    return responseData.message
  }

  if (typeof responseData?.detail === 'string') {
    return responseData.detail
  }

  if (Array.isArray(responseData?.detail)) {
    const validationMessage = responseData.detail
      .map((item) =>
        item && typeof item === 'object' && 'msg' in item
          ? String(item.msg)
          : '',
      )
      .filter(Boolean)
      .join(', ')

    return validationMessage || fallbackMessage
  }

  return fallbackMessage
}

httpClient.interceptors.request.use((config) => {
  const accessToken = accessTokenProvider?.()

  if (!accessToken) {
    return config
  }

  const headers = AxiosHeaders.from(config.headers)
  headers.set('Authorization', `Bearer ${accessToken}`)
  config.headers = headers

  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      unauthorizedHandler?.()
    }

    return Promise.reject(error)
  },
)
