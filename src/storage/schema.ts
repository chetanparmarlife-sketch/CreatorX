import { STORAGE_KEYS as AUTH_STORAGE_KEYS } from '@/src/config/env';

export const STORAGE_SCHEMA_VERSION = 1;
export const STORAGE_SCHEMA_VERSION_KEY = '@storage_schema_version';
export const FEATURE_FLAG_KEY = '@feature_flags';
export const API_CACHE_PREFIX = '@api_cache_';
export const OFFLINE_QUEUE_KEY = '@offline_messages';
export const PENDING_NOTIFICATION_KEY = 'pendingNotification';

export const APP_STATE_KEYS = [
  '@user_profile',
  '@wallet',
  '@campaigns',
  '@saved_campaigns',
  '@notifications',
  '@dark_mode',
  '@active_campaigns',
  '@applications',
];

export const APP_OWNED_KEYS = [
  ...APP_STATE_KEYS,
  OFFLINE_QUEUE_KEY,
  PENDING_NOTIFICATION_KEY,
];

export const LEGACY_TOKEN_KEYS = [
  AUTH_STORAGE_KEYS.ACCESS_TOKEN,
  AUTH_STORAGE_KEYS.REFRESH_TOKEN,
  AUTH_STORAGE_KEYS.USER,
];
