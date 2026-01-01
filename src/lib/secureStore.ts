import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Lazy-require to avoid bundling native-only SecureStore on web builds.
let secureStoreModule: typeof import('expo-secure-store') | null = null;

function getSecureStore() {
  if (Platform.OS === 'web') return null;
  if (secureStoreModule) return secureStoreModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    secureStoreModule = require('expo-secure-store');
  } catch {
    secureStoreModule = null;
  }
  return secureStoreModule;
}

async function isSecureStoreAvailable(): Promise<boolean> {
  const secureStore = getSecureStore();
  if (!secureStore?.isAvailableAsync) return false;
  try {
    return await secureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

const toSecureStoreKey = (key: string): string =>
  key.replace(/[^a-zA-Z0-9._-]/g, '_');

export async function getSecureItem(key: string): Promise<string | null> {
  const secureStore = getSecureStore();
  if (secureStore && (await isSecureStoreAvailable())) {
    const safeKey = toSecureStoreKey(key);
    const stored = await secureStore.getItemAsync(safeKey);
    if (stored) return stored;

    const legacy = await AsyncStorage.getItem(key);
    if (legacy) {
      await secureStore.setItemAsync(safeKey, legacy);
      await AsyncStorage.removeItem(key);
      return legacy;
    }
    return null;
  }
  return AsyncStorage.getItem(key);
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  const secureStore = getSecureStore();
  if (secureStore && (await isSecureStoreAvailable())) {
    await secureStore.setItemAsync(toSecureStoreKey(key), value);
    return;
  }
  await AsyncStorage.setItem(key, value);
}

export async function deleteSecureItem(key: string): Promise<void> {
  const secureStore = getSecureStore();
  if (secureStore && (await isSecureStoreAvailable())) {
    await secureStore.deleteItemAsync(toSecureStoreKey(key));
    return;
  }
  await AsyncStorage.removeItem(key);
}
