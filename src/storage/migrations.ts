import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheUtils } from '@/src/api/utils/cache';
import {
  APP_STATE_KEYS,
  LEGACY_TOKEN_KEYS,
  STORAGE_SCHEMA_VERSION,
  STORAGE_SCHEMA_VERSION_KEY,
} from '@/src/storage/schema';

export async function runStorageMigrations(): Promise<{ requiresReauth: boolean }> {
  const storedVersion = await AsyncStorage.getItem(STORAGE_SCHEMA_VERSION_KEY);
  const requiresVersionBump = storedVersion !== String(STORAGE_SCHEMA_VERSION);

  if (requiresVersionBump) {
    await AsyncStorage.multiRemove(APP_STATE_KEYS);
    await cacheUtils.clear();
    await AsyncStorage.setItem(STORAGE_SCHEMA_VERSION_KEY, String(STORAGE_SCHEMA_VERSION));
  }

  const legacyEntries = await AsyncStorage.multiGet(LEGACY_TOKEN_KEYS);
  const hasLegacyTokens = legacyEntries.some(([, value]) => value);

  if (hasLegacyTokens) {
    await AsyncStorage.multiRemove(LEGACY_TOKEN_KEYS);
  }

  return { requiresReauth: hasLegacyTokens };
}
