import { useEffect, useState, useRef } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen } from '@/src/components';
import { useAuth } from '@/src/context/AuthContext';
import { useTheme } from '@/src/hooks';

const DEFAULT_APP_ROUTE = '/(app)/(tabs)/explore';
const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@onboarding_complete_creator',
};

export default function Index() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuth();
  const { colors } = useTheme();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [splashComplete, setSplashComplete] = useState(false);
  const hasNavigated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE)
      .then(value => setOnboardingComplete(value === '1'))
      .catch(() => setOnboardingComplete(false));
  }, []);

  useEffect(() => {
    if (!initialized || onboardingComplete === null || !splashComplete || hasNavigated.current) {
      return;
    }

    hasNavigated.current = true;

    if (isAuthenticated) {
      router.replace(DEFAULT_APP_ROUTE);
    } else if (onboardingComplete) {
      router.replace('/(auth)/login-otp');
    } else {
      router.replace('/(auth)/connect');
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
