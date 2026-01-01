import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { AppProvider } from '@/src/context';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '@/src/hooks';

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

function AuthGuard() {
  const { isAuthenticated, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (!segments || !segments.length) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (isAuthenticated && inAuthGroup) {
      router.replace(DEFAULT_APP_ROUTE);
    } else if (!isAuthenticated && inAppGroup) {
      router.replace('/(auth)/login-otp');
    }
  }, [isAuthenticated, initialized, segments, router]);

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
