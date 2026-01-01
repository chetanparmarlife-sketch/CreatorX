import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { colors } from '@/src/theme';

const DEFAULT_APP_ROUTE = '/(app)/(tabs)/explore';
const SPLASH_DURATION = 2000;

export default function Index() {
  const router = useRouter();
  const { initialized, isAuthenticated } = useAuth();
  const hasNavigated = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!initialized || hasNavigated.current) return;

    timerRef.current = setTimeout(() => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      if (isAuthenticated) {
        router.replace(DEFAULT_APP_ROUTE);
      } else {
        router.replace('/(auth)/welcome');
      }
    }, SPLASH_DURATION);
  }, [initialized, isAuthenticated, router]);

  return (
    <LinearGradient
      colors={[colors.primary, colors.violet]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.logoContainer}>
        <View style={styles.logoIcon}>
          <Feather name="zap" size={48} color={colors.primary} />
        </View>
        <Text style={styles.logoText}>CreatorX</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
});
