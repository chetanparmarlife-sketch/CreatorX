'use client'

import { login } from '@/lib/api/auth'
import type { LoginResponse } from '@/lib/api/auth'

type LoginPayload = {
  email: string
  password: string
}

export const authService = {
  login: async ({ email, password }: LoginPayload): Promise<LoginResponse> => {
    const response = await login(email, password)
    // Tokens are already stored as HttpOnly cookies by login(), replacing the old localStorage write.
    return response
  },
}
