import { Stack } from 'expo-router';
import { useTheme } from '@/src/hooks';

export default function AppLayout() {
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
