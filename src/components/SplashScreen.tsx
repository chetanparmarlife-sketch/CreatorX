import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useCallback } from 'react';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/src/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const hasFinished = useRef(false);

  const handleFinish = useCallback(() => {
    if (!hasFinished.current) {
      hasFinished.current = true;
      onFinish();
    }
  }, [onFinish]);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const mainAnimation = Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(textTranslate, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
    ]);

    pulseAnimation.start();
    mainAnimation.start(() => {
      pulseAnimation.stop();
      handleFinish();
    });

    return () => {
      mainAnimation.stop();
      pulseAnimation.stop();
    };
  }, [handleFinish]);

  const rotateInterpolate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#12121f', '#0a0a0a']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]}>
        <LinearGradient
          colors={['transparent', 'rgba(139, 92, 246, 0.15)', 'transparent']}
          style={styles.glowRingGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
      
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: Animated.multiply(logoScale, pulseScale) },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[colors.primary, colors.violet, '#9333ea']}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="zap" size={52} color={colors.text} />
          </LinearGradient>
          <View style={styles.logoGlow} />
        </Animated.View>

        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textTranslate }],
          }}
        >
          <Text style={styles.title}>CreatorX</Text>
        </Animated.View>

        <Animated.View style={{ opacity: taglineOpacity }}>
          <Text style={styles.tagline}>Earn with Your Influence</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.bottomGlow, { opacity: glowOpacity }]}>
        <LinearGradient
          colors={['transparent', 'rgba(139, 92, 246, 0.12)', 'rgba(139, 92, 246, 0.05)']}
          style={styles.glowGradient}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  glowRing: {
    position: 'absolute',
    top: height * 0.25,
    left: -width * 0.5,
    right: -width * 0.5,
    height: height * 0.5,
  },
  glowRingGradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 28,
    position: 'relative',
  },
  logoGradient: {
    width: 110,
    height: 110,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 42,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    zIndex: -1,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  glowGradient: {
    flex: 1,
  },
});
