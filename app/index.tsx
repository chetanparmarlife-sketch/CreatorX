import { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen } from '@/src/components';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/hooks';

const DEFAULT_APP_ROUTE = '/(app)/(tabs)/explore';
const CURRENT_STORAGE_VERSION = '2';
const STORAGE_KEYS = {
  STORAGE_VERSION: '@storage_version',
  ONBOARDING_COMPLETE: '@onboarding_complete_creator',
};

const clearOnboardingData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ONBOARDING_COMPLETE,
    ]);
  } catch (e) {
    console.error('Failed to clear onboarding data:', e);
  }
};

const checkAndMigrateStorage = async (): Promise<boolean> => {
  try {
    const storedVersion = await AsyncStorage.getItem(STORAGE_KEYS.STORAGE_VERSION);
    if (storedVersion !== CURRENT_STORAGE_VERSION) {
      console.log(`Storage version changed (${storedVersion} -> ${CURRENT_STORAGE_VERSION}), clearing onboarding data`);
      await clearOnboardingData();
      await AsyncStorage.setItem(STORAGE_KEYS.STORAGE_VERSION, CURRENT_STORAGE_VERSION);
      return false;
    }
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value === '1';
  } catch {
    return false;
  }
};

export default function Index() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [splashComplete, setSplashComplete] = useState(false);
  const hasNavigated = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    checkAndMigrateStorage().then((value) => {
      if (isMountedRef.current) {
        setOnboardingComplete(value);
      }
    });
  }, []);

  useEffect(() => {
    if (!initialized || onboardingComplete === null || !splashComplete || hasNavigated.current) {
      return;
    }

    hasNavigated.current = true;

    if (isAuthenticated) {
      router.replace(DEFAULT_APP_ROUTE);
    } else {
      router.replace('/(auth)/login-otp');
    }
  }, [initialized, isAuthenticated, onboardingComplete, splashComplete, router]);

  const handleSplashFinish = () => {
    setSplashComplete(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SplashScreen onFinish={handleSplashFinish} />
    </View>
  );
}
