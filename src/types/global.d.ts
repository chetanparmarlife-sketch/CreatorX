/**
 * Global type definitions for React Native and Expo
 */

declare const __DEV__: boolean;

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_BASE_URL?: string;
    EXPO_PUBLIC_ENV?: 'dev' | 'staging' | 'prod';
  }
}

