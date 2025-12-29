import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useState, useCallback } from 'react';
import { AppProvider } from '@/src/context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SplashScreen, CreatorAuthScreen } from '@/src/components';
import { useTheme } from '@/src/hooks';

type AppState = 'splash' | 'auth' | 'main';

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

function MainNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="conversation" />
      <Stack.Screen name="new-message" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="help" />
      <Stack.Screen name="kyc" />
      <Stack.Screen name="transaction-detail" />
    </Stack>
  );
}

function AppContent() {
  const [appState, setAppState] = useState<AppState>('splash');

  const handleSplashFinish = useCallback(() => {
    setAppState('auth');
  }, []);

  const handleAuthenticate = useCallback(() => {
    setAppState('main');
  }, []);

  const handleSkip = useCallback(() => {
    setAppState('main');
  }, []);

  if (appState === 'splash') {
    return (
      <ThemedContainer>
        <SplashScreen onFinish={handleSplashFinish} />
      </ThemedContainer>
    );
  }

  if (appState === 'auth') {
    return (
      <ThemedContainer>
        <CreatorAuthScreen
          onAuthenticate={() => handleAuthenticate()}
          onSkip={handleSkip}
        />
      </ThemedContainer>
    );
  }

  return (
    <ThemedContainer>
      <MainNavigator />
    </ThemedContainer>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
