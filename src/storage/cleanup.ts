import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CACHE_PREFIX } from '@/src/storage/schema';

export async function removeKeysWithPrefix(prefix: string): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const scopedKeys = keys.filter((key) => key.startsWith(prefix));
  if (scopedKeys.length === 0) return;
  await AsyncStorage.multiRemove(scopedKeys);
}

export async function clearApiCacheKeys(): Promise<void> {
  await removeKeysWithPrefix(API_CACHE_PREFIX);
}
