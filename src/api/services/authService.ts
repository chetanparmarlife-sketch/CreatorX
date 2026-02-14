/**
 * Authentication service
 */

import { apiClient } from '../client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  ForgotPasswordRequest,
} from '../types';
import { STORAGE_KEYS } from '@/src/config/env';
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/src/lib/secureStore';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);

    // Store tokens
    await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

    return response;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);

    // Store tokens
    await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

    return response;
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh-token', { refreshToken });

    // Update tokens
    await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    if (response.refreshToken) {
      await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
    }

    return response;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      await deleteSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
      await deleteSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER]);
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await apiClient.post('/auth/forgot-password', data);
  },

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    return await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
  },

  /**
   * Get stored refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await getSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },

  /**
   * Link Supabase user to backend user profile
   * Returns the backend user profile with userId
   */
  async linkSupabaseUser(data: {
    supabaseUserId: string;
    email: string;
    name: string;
    role: 'CREATOR' | 'BRAND' | 'ADMIN';
  }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/link-supabase-user', data);
    return response;
  },
};
