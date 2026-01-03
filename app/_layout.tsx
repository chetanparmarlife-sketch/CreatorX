import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { AppProvider } from '@/src/context';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '@/src/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_APP_ROUTE = '/(app)/(tabs)/explore';
const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@onboarding_complete_creator',
};

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

function ThemedContainer({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedStatusBar />
      {children}
    </View>
  );
}

function AuthGuard() {
  const { isAuthenticated, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!initialized) return;
    let isMounted = true;

    const loadOnboarding = async () => {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      if (isMounted) {
        setOnboardingComplete(value === '1');
      }
    };

    loadOnboarding();

    return () => {
      isMounted = false;
    };
  }, [initialized]);

  useEffect(() => {
    if (!initialized) return;
    if (onboardingComplete === null) return;
    if (!segments || !segments.length) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';
    const authScreen = segments[1] || '';
    const allowedOnboardingScreens = new Set(['onboarding-form', 'onboarding-social', 'onboarding-commercial']);

    if (isAuthenticated && inAuthGroup) {
      if (!onboardingComplete && !allowedOnboardingScreens.has(authScreen)) {
        router.replace('/(auth)/onboarding-form');
      } else if (onboardingComplete && authScreen === 'onboarding-form') {
        router.replace(DEFAULT_APP_ROUTE);
      } else if (onboardingComplete && allowedOnboardingScreens.has(authScreen)) {
        router.replace(DEFAULT_APP_ROUTE);
      } else if (onboardingComplete) {
        router.replace(DEFAULT_APP_ROUTE);
      }
    } else if (!isAuthenticated && inAppGroup) {
      router.replace('/(auth)/login-otp');
    }
  }, [isAuthenticated, initialized, onboardingComplete, segments, router]);

  return (
    <ThemedContainer>
      <Slot />
    </ThemedContainer>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AuthProvider>
          <AuthGuard />
        </AuthProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
