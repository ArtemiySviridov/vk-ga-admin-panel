import { getApiErrorMessage, httpClient } from './httpClient'

export type LoginPayload = {
  login: string
  password: string
}

export type LoginResult = {
  accessToken: string
  login: string
}

export type AuthApi = {
  login(payload: LoginPayload): Promise<LoginResult>
}

type AdminLoginResponseDto = {
  access_token: string
}

export function createAuthApi(): AuthApi {
  return {
    async login(payload) {
      try {
        const response = await httpClient.post<AdminLoginResponseDto>(
          '/api/v1/admin/login',
          payload,
        )

        return {
          accessToken: response.data.access_token,
          login: payload.login,
        }
      } catch (error) {
        throw new Error(
          getApiErrorMessage(error, 'Неверный логин или пароль.'),
          { cause: error },
        )
      }
    },
  }
}

export const authApi = createAuthApi()
