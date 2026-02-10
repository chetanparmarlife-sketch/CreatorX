import { login, register } from '@/lib/api/auth'
import type { LoginResponse } from '@/lib/api/auth'
import type { AuthResponse } from '@/lib/types'

const STORAGE_KEYS = {
  accessToken: 'creatorx_access_token',
  refreshToken: 'creatorx_refresh_token',
} as const

type TokenPayload = {
  accessToken?: string
  refreshToken?: string
  tokens?: {
    accessToken?: string
    refreshToken?: string
  }
}

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = {
  email: string
  password: string
  companyName: string
  industry: string
  website?: string
}

const storeTokens = (payload: TokenPayload) => {
  if (typeof window === 'undefined') return

  const accessToken = payload.accessToken ?? payload.tokens?.accessToken
  const refreshToken = payload.refreshToken ?? payload.tokens?.refreshToken

  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  }

  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
  }
}

const mapLoginResponse = (response: LoginResponse): AuthResponse => ({
  userId: response.user.id,
  email: response.user.email,
  role: response.user.role,
  accessToken: response.token,
  refreshToken: (response as any).refreshToken,
})

export const authService = {
  login: async ({ email, password }: LoginPayload): Promise<AuthResponse> => {
    const response = await login(email, password)
    storeTokens({ accessToken: response.token, refreshToken: (response as any).refreshToken })
    return mapLoginResponse(response)
  },
  register: async ({
    email,
    password,
    companyName,
    industry,
    website,
  }: RegisterPayload): Promise<AuthResponse> => {
    const response = await register(email, password, companyName, undefined, companyName, industry, website)
    storeTokens({ accessToken: response.token, refreshToken: (response as any).refreshToken })
    return mapLoginResponse(response)
  },
}
