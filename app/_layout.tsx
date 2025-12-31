import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { AppProvider } from '@/src/context';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen } from '@/src/components';
import { useTheme } from '@/src/hooks';
import { useBootstrap } from '@/src/bootstrap/useBootstrap';
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

function BootstrapGate() {
  const { ready, error, retry } = useBootstrap();
  const { initialized, isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
        setOnboardingComplete(value === '1');
      } catch (e) {
        setOnboardingComplete(false);
      } finally {
        setOnboardingChecked(true);
      }
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!ready || !initialized || !onboardingChecked) return;
    if (segments.length === 0) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isAuthenticated && inAuthGroup) {
      router.replace(DEFAULT_APP_ROUTE);
      return;
    }

    if (!isAuthenticated && !inAuthGroup) {
      if (onboardingComplete) {
        router.replace('/(auth)/login-otp');
      } else {
        router.replace('/(auth)/connect');
      }
      return;
    }
  }, [ready, initialized, isAuthenticated, segments, router, onboardingChecked, onboardingComplete]);

  if (!ready || !initialized || !onboardingChecked) {
    return (
      <ThemedContainer>
        <SplashScreen onFinish={() => {}} />
        {error ? (
          <View style={styles.errorOverlay}>
            <Text style={[styles.errorTitle, { color: colors.text }]}>
              Something went wrong
            </Text>
            <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
              {error.message || 'Bootstrap failed. Please try again.'}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={retry}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ThemedContainer>
    );
  }

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
          <BootstrapGate />
        </AuthProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  errorOverlay: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 80,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    marginBottom: 16,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
