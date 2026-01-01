/**
 * Environment configuration for CreatorX API
 * Supports dev, staging, and production environments
 * 
 * Environment Variable Priority:
 * 1. EXPO_PUBLIC_ENV (explicitly set)
 * 2. __DEV__ flag (development mode)
 * 3. Default to 'prod' (production build)
 * 
 * For local development:
 * - Create .env.local file with EXPO_PUBLIC_ENV=dev
 * - Or ensure __DEV__ is true (default in Expo development)
 */

export type Environment = 'dev' | 'staging' | 'prod';

const getEnvironment = (): Environment => {
  // Check for environment variable first
  // @ts-ignore - Expo environment variables
  const env = (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_ENV) as Environment | undefined;
  if (env && (env === 'dev' || env === 'staging' || env === 'prod')) {
    return env;
  }
  
  // Default to dev in development
  // @ts-ignore - Expo __DEV__ global
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    return 'dev';
  }
  
  // Default to prod in production builds
  return 'prod';
};

const ENV = getEnvironment();

const appendApiVersion = (url: string): string => {
  if (!url) return url;
  const normalized = url.replace(/\/+$/, '');
  return normalized.endsWith('/api/v1') ? normalized : `${normalized}/api/v1`;
};

const getEnvBaseURL = (): string | undefined => {
  // @ts-ignore - Expo environment variables
  if (typeof process === 'undefined') return undefined;
  // @ts-ignore
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (explicit && explicit !== 'your-api-url') {
    return explicit;
  }
  // @ts-ignore
  const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (backendUrl && backendUrl !== 'your-api-url') {
    return appendApiVersion(backendUrl);
  }
  return undefined;
};

const getDefaultApiUrl = (env: Environment): string => {
  const defaultURLs: Record<Environment, string> = {
    dev: 'http://localhost:8080/api/v1',
    staging: 'https://api-staging.creatorx.com/api/v1',
    prod: 'https://api.creatorx.com/api/v1',
  };
  return defaultURLs[env];
};

const getWebSocketURL = (env: Environment): string => {
  // Check for explicit environment variable (highest priority)
  // @ts-ignore - Expo environment variables
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_WS_URL) {
    // @ts-ignore
    const url = process.env.EXPO_PUBLIC_WS_URL;
    if (url && url !== 'your-ws-url') {
      return url;
    }
  }
  
  // Auto-generate WebSocket URL from API URL if not explicitly set
  const apiUrl = API_BASE_URL || getDefaultApiUrl(env);
  if (apiUrl && apiUrl.startsWith('http://localhost')) {
    return 'ws://localhost:8080/ws';
  } else if (apiUrl && apiUrl.startsWith('https://')) {
    // Extract domain from API URL and convert to WebSocket
    try {
      const url = new URL(apiUrl);
      return `wss://${url.hostname}/ws`;
    } catch {
      // Fallback to default
    }
  }
  
  // Default URLs based on environment
  const defaultURLs: Record<Environment, string> = {
    dev: 'ws://localhost:8080/ws',
    staging: 'wss://api-staging.creatorx.com/ws',
    prod: 'wss://api.creatorx.com/ws',
  };
  
  return defaultURLs[env];
};

const explicitApiBaseUrl = getEnvBaseURL();

export const API_BASE_URL = explicitApiBaseUrl || getDefaultApiUrl(ENV);
export const API_TIMEOUT = 30000;
export const WS_BASE_URL = getWebSocketURL(ENV);
export const CURRENT_ENV = ENV;

const isLocalhostBaseUrl =
  API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
const isHttpBaseUrl = API_BASE_URL.startsWith('http://');

if (__DEV__) {
  if (!explicitApiBaseUrl) {
    console.warn(
      '⚠️  EXPO_PUBLIC_API_BASE_URL not set. Set EXPO_PUBLIC_API_BASE_URL=https://<host>/api/v1 for device testing.'
    );
  }
  if (isLocalhostBaseUrl) {
    console.log('📍 Local Development Mode');
    console.log(`   API: ${API_BASE_URL}`);
    console.log(`   WebSocket: ${WS_BASE_URL}`);
    console.log('   Make sure backend is running on http://localhost:8080');
  }
}

if (!__DEV__ && (isLocalhostBaseUrl || !API_BASE_URL)) {
  throw new Error(
    'API_BASE_URL is invalid for production builds. Set EXPO_PUBLIC_API_BASE_URL=https://<host>/api/v1.'
  );
}

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@access_token',
  REFRESH_TOKEN: '@refresh_token',
  USER: '@user',
  LAST_SYNC: '@last_sync',
} as const;
