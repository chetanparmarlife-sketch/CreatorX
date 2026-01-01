import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/src/theme';

const STORAGE_KEYS = {
  STORAGE_VERSION: '@storage_version',
  ONBOARDING_COMPLETE: '@onboarding_complete_creator',
  CONNECTED_PLATFORM: '@connected_platform',
  FOLLOWER_COUNT: '@follower_count',
};

export default function ResetOnboarding() {
  const router = useRouter();

  useEffect(() => {
    const resetAndRedirect = async () => {
      try {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.STORAGE_VERSION,
          STORAGE_KEYS.ONBOARDING_COMPLETE,
          STORAGE_KEYS.CONNECTED_PLATFORM,
          STORAGE_KEYS.FOLLOWER_COUNT,
        ]);
        console.log('Onboarding data cleared successfully');
      } catch (e) {
        console.error('Failed to clear onboarding data:', e);
      }
      
      setTimeout(() => {
        router.replace('/(auth)/connect');
      }, 500);
    };

    resetAndRedirect();
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Resetting onboarding...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
});
