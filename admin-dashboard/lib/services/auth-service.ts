'use client'

import { login } from '@/lib/api/auth'
import type { LoginResponse } from '@/lib/api/auth'

const STORAGE_KEYS = {
  accessToken: 'creatorx_admin_access_token',
  refreshToken: 'creatorx_admin_refresh_token',
} as const

type TokenPayload = {
  token?: string
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

const storeTokens = (payload: TokenPayload) => {
  if (typeof window === 'undefined') return

  const accessToken = payload.token ?? payload.accessToken ?? payload.tokens?.accessToken
  const refreshToken = payload.refreshToken ?? payload.tokens?.refreshToken

  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  }

  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
  }
}

export const authService = {
  login: async ({ email, password }: LoginPayload): Promise<LoginResponse> => {
    const response = await login(email, password)
    storeTokens(response as TokenPayload)
    return response
  },
}
