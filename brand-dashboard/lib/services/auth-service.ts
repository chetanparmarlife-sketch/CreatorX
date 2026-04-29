import { login, register } from '@/lib/api/auth'
import type { LoginResponse } from '@/lib/api/auth'
import type { AuthResponse } from '@/lib/types'

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

const mapLoginResponse = (response: LoginResponse): AuthResponse => ({
  userId: response.user.id,
  email: response.user.email,
  role: response.user.role,
  onboardingStatus: response.user.onboardingStatus,
  accessToken: response.token,
  refreshToken: (response as any).refreshToken,
})

export const authService = {
  login: async ({ email, password }: LoginPayload): Promise<AuthResponse> => {
    const response = await login(email, password)
    // login() now stores tokens in HttpOnly cookies, not localStorage token keys.
    return mapLoginResponse(response)
  },
  register: async ({
    email,
    password,
    companyName,
    industry,
    website,
  }: RegisterPayload): Promise<AuthResponse> => {
    const response = await register(email, password, companyName, companyName)
    // register() now stores tokens in HttpOnly cookies, not localStorage token keys.
    return mapLoginResponse(response)
  },
}
