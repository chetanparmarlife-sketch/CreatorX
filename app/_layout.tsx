import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { AppProvider } from '@/src/context';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen } from '@/src/components';
import { useTheme } from '@/src/hooks';
import { useBootstrap } from '@/src/bootstrap/useBootstrap';
import { getOnboardingComplete, OnboardingRole } from '@/src/lib/onboarding';
import {
  AUTH_LOGIN_ROUTE,
  AUTH_ONBOARDING_ROUTE,
  DEFAULT_APP_ROUTE,
  DEFAULT_ONBOARDING_ROLE,
} from '@/src/constants/routes';

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
  const { initialized, isAuthenticated, user, signOut } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();
  const [splashComplete, setSplashComplete] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const segmentKey = segments.join('/');

  useEffect(() => {
    let active = true;
    const loadState = async () => {
      const complete = await getOnboardingComplete(DEFAULT_ONBOARDING_ROLE as OnboardingRole);
      if (active) {
        setOnboardingComplete(complete);
      }
    };

    loadState();
    return () => {
      active = false;
    };
  }, [segmentKey]);

  useEffect(() => {
    if (!ready || !initialized || !splashComplete || onboardingComplete === null) return;
    if (segments.length === 0) return;
    const inAuthGroup = segments[0] === '(auth)';
    const authRoot = segments[1] || '';
    const authSubRoute = segments[2] || '';

    if (isAuthenticated) {
      const role = (user?.user_metadata?.role as string | undefined) ?? (user?.app_metadata?.role as string | undefined);
      if (role && role !== 'CREATOR') {
        Alert.alert('CreatorX', 'This app is for creators only. Please use the Brand/Admin dashboard.');
        signOut();
        return;
      }

      if (inAuthGroup) {
        router.replace(DEFAULT_APP_ROUTE);
      }
      return;
    }

    if (!onboardingComplete) {
      const targetRoute = `${AUTH_ONBOARDING_ROUTE}/${DEFAULT_ONBOARDING_ROLE}`;
      if (!inAuthGroup || authRoot !== 'onboarding' || authSubRoute !== DEFAULT_ONBOARDING_ROLE) {
        router.replace(targetRoute);
      }
      return;
    }

    if (!inAuthGroup || authRoot !== 'login') {
      router.replace(AUTH_LOGIN_ROUTE);
    }
  }, [ready, initialized, splashComplete, onboardingComplete, isAuthenticated, user, signOut, segments, router]);

  const showSplash = !ready || !initialized || onboardingComplete === null || !splashComplete;

  if (showSplash) {
    return (
      <ThemedContainer>
        <SplashScreen onFinish={() => setSplashComplete(true)} />
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
