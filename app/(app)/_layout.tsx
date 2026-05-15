import { Stack } from 'expo-router';
import { useTheme } from '@/src/hooks';
import { OfflineNotice } from '@/src/components/OfflineNotice';

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="media-kit" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="conversation" />
        <Stack.Screen name="new-message" />
        <Stack.Screen name="saved" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="documents" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="help" />
        <Stack.Screen name="kyc" />
        <Stack.Screen name="refer-earn" />
        <Stack.Screen name="transaction-detail" />
        <Stack.Screen name="withdraw" />
        <Stack.Screen name="add-bank-account" />
        <Stack.Screen name="event-details" />
      </Stack>
      <OfflineNotice />
    </>
  );
}
