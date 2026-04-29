/**
 * Global type definitions for React Native and Expo
 */

declare const __DEV__: boolean;

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
    // The creator app reads the real backend from EXPO_PUBLIC_API_URL instead of legacy mock/backend aliases.
    EXPO_PUBLIC_WS_URL?: string;
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_PUBLIC_SENTRY_DSN?: string;
    EXPO_PUBLIC_ENV?: 'dev' | 'staging' | 'prod';
  }
}
