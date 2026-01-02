import { View, Text, StyleSheet, Animated, Dimensions, Easing, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/src/theme';

const { width, height } = Dimensions.get('window');
const useNativeDriver = Platform.OS !== 'web';
const SPLASH_DURATION = 2500;
const SPLASH_SESSION_TIMEOUT = 30000;

const getSplashState = () => {
  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    const completedAt = sessionStorage.getItem('splashCompletedAt');
    if (completedAt) {
      const elapsed = Date.now() - parseInt(completedAt, 10);
      if (elapsed < SPLASH_SESSION_TIMEOUT) {
        return { completed: true };
      }
      sessionStorage.removeItem('splashCompletedAt');
    }
    const startTime = sessionStorage.getItem('splashStartTime');
    if (startTime) {
      return { completed: false, startTime: parseInt(startTime, 10) };
    }
    const now = Date.now();
    sessionStorage.setItem('splashStartTime', now.toString());
    return { completed: false, startTime: now };
  }
  return { completed: false, startTime: Date.now() };
};

const markSplashComplete = () => {
  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('splashCompletedAt', Date.now().toString());
    sessionStorage.removeItem('splashStartTime');
  }
};

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const spinnerOpacity = useRef(new Animated.Value(0)).current;
  const spinnerRotation = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    const state = getSplashState();
    
    if (state.completed) {
      onFinishRef.current();
      return;
    }

    const startTime = state.startTime ?? Date.now();
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, SPLASH_DURATION - elapsed);

    if (remaining <= 0) {
      markSplashComplete();
      onFinishRef.current();
      return;
    }

    const timer = setTimeout(() => {
      markSplashComplete();
      onFinishRef.current();
    }, remaining);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinnerRotation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver,
      })
    );

    const mainAnimation = Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 60,
          useNativeDriver,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver,
        }),
      ]),
      Animated.delay(200),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
      Animated.delay(200),
      Animated.timing(spinnerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver,
      }),
    ]);

    spinAnimation.start();
    mainAnimation.start();

    return () => {
      mainAnimation.stop();
      spinAnimation.stop();
    };
  }, []);

  const spinInterpolate = spinnerRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a1628', '#050d1a', '#020810']}
        style={styles.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Animated.View style={[styles.glowContainer, { opacity: glowOpacity }]}>
        <View style={styles.glowEffect} />
      </Animated.View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoBox}>
            <View style={styles.xIconContainer}>
              <Feather name="x" size={48} color="#1337ec" />
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.title}>
            <Text style={styles.titleCreator}>Creator</Text>
            <Text style={styles.titleX}>X</Text>
          </Text>
        </Animated.View>
      </View>

      <View style={styles.bottomSection}>
        <Animated.View
          style={[
            styles.spinnerContainer,
            {
              opacity: spinnerOpacity,
              transform: [{ rotate: spinInterpolate }],
            },
          ]}
        >
          <View style={styles.spinner} />
        </Animated.View>

        <Animated.Text style={[styles.version, { opacity: spinnerOpacity }]}>
          v1.0.2
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020810',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  glowContainer: {
    position: 'absolute',
    top: height * 0.3,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  glowEffect: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(19, 55, 236, 0.12)',
    ...Platform.select({
      ios: {
        shadowColor: '#1337ec',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 50,
      },
      android: {},
      web: {
        boxShadow: '0 0 100px 50px rgba(19, 55, 236, 0.15)',
      },
    }),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBox: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#0f1419',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(19, 55, 236, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 40px rgba(19, 55, 236, 0.1)',
      },
    }),
  },
  xIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  titleCreator: {
    color: '#ffffff',
  },
  titleX: {
    color: '#1337ec',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  spinnerContainer: {
    marginBottom: 12,
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: 'transparent',
    borderTopColor: '#1337ec',
    borderRightColor: '#1337ec',
  },
  version: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '500',
  },
});
