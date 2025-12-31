import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { AppProvider } from '@/src/context';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen } from '@/src/components';
import { useTheme } from '@/src/hooks';
import { useBootstrap } from '@/src/bootstrap/useBootstrap';

const DEFAULT_APP_ROUTE = '/(app)/(tabs)/explore';

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

  useEffect(() => {
    if (!ready || !initialized) return;
    if (segments.length === 0) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }

    if (isAuthenticated && inAuthGroup) {
      router.replace(DEFAULT_APP_ROUTE);
    }
  }, [ready, initialized, isAuthenticated, segments, router]);

  if (!ready || !initialized) {
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
