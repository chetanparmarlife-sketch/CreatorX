import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { colors } from '@/src/theme';
import { useAuth } from '@/src/context/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HERO_HEIGHT = Math.min(screenHeight * 0.5, 420);

const slides = [
  {
    key: 'discover',
    title: 'Find Your',
    accent: 'Perfect Match',
    accentNewLine: true,
    description: 'Access a curated feed of premium campaigns from world-class brands, filtered just for you.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAP_XM7Zk5UPHZhAxi2eYwj1lARft3ON9vcIBbwKbXwwcu_XXMrAKQBf8aT2k3GhwLi_Cm8JXrJqMKBG-MvaUMlQFLqiYt1H6vEELTBHrLfC5WikN4qarJImBF4e0TCMnnFEKRG6iorpytoZpUDquavDI-sEP6TonnxowkeSDvdNPdc-iSa2_Yc782BF3QVwEMus4IgVaoQbsyVQxGx_fYvyBHHIInjVdK4sZYwHdvJEPecJlnasLcitjszUQIZhgn8qucmyhc7oMQ',
  },
  {
    key: 'submit',
    title: 'Submit in Seconds',
    accent: '',
    accentNewLine: false,
    description: 'Upload your content directly to brand campaigns. Track approvals and feedback in real-time.',
    image: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1000&auto=format&fit=crop',
  },
  {
    key: 'earnings',
    title: 'Track Earnings',
    accent: '& Chat',
    accentNewLine: true,
    description: 'Monitor your campaign revenue in real-time and communicate directly with top brands.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9-n8uK_vWkxZoixGqLnU1RDc91sCBwZYfcjr81rBeA0wfd3zACy_1FLX5hvuH5zgHqzkpYBwPgy9Dq0ajiSwRp5xB-JzdZIp0GmuTY7OzXHVLJb-xD3a_FS7GQYXGBL2tER4sSCwGK2fX4TevadIfttH5qrJBdCl3IUWVm1fOPEnyXjrYP2jDPBrOIX6iroqslbmqV_kv-vq1mX4OyZ2qO5FzbRuLelmshdZZtxvgoTANIPgKzmwgxxkt90U1Vz3Iatxuw-1PJt4',
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { devLogin } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleGetStarted = () => {
    router.push('/(auth)/login-otp');
  };

  const handleSkipDev = () => {
    devLogin();
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      const nextIndex = activeIndex + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * screenWidth, animated: true });
      setActiveIndex(nextIndex);
    } else {
      handleGetStarted();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0b0d1a', '#101322', '#0a0c16']}
        style={styles.background}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Feather name="zap" size={14} color={colors.primary} />
          </View>
          <Text style={styles.brandText}>CreatorX</Text>
        </View>
        <TouchableOpacity onPress={handleGetStarted}>
          <Text style={styles.skipHeader}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setActiveIndex(index);
        }}
        contentContainerStyle={styles.carousel}
      >
        {slides.map((slide) => (
          <View key={slide.key} style={[styles.slide, { width: screenWidth }]}>
            <View style={styles.heroWrap}>
              <ImageBackground
                source={{ uri: slide.image }}
                style={styles.heroImage}
                imageStyle={styles.heroImageStyle}
              >
                <LinearGradient
                  colors={['rgba(16,19,34,0.1)', 'rgba(16,19,34,0.6)']}
                  style={styles.heroOverlay}
                />
                <View style={styles.heroBadge}>
                  <Feather name="check-circle" size={14} color="#fff" />
                  <Text style={styles.heroBadgeText}>Premium campaigns</Text>
                </View>
              </ImageBackground>
            </View>

            <View style={styles.slideContent}>
              <Text style={styles.slideTitle}>
                {slide.title}
                {slide.accent ? (
                  <Text style={styles.slideTitleAccent}>
                    {slide.accentNewLine ? `\n${slide.accent}` : ` ${slide.accent}`}
                  </Text>
                ) : null}
              </Text>
              <Text style={styles.slideDescription}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((slide, index) => (
            <View
              key={slide.key}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryButtonText}>
            {activeIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={handleGetStarted}>
          <Text style={styles.loginText}>Already have an account? Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.devSkip} onPress={handleSkipDev}>
          <Text style={styles.devSkipText}>Skip for Dev Preview</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0d1a',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(19, 55, 236, 0.25)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -140,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  header: {
    paddingTop: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(19, 55, 236, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  skipHeader: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  carousel: {
    alignItems: 'center',
  },
  slide: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  heroWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: HERO_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImageStyle: {
    borderRadius: 24,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(19, 55, 236, 0.75)',
    alignSelf: 'flex-start',
    margin: 16,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  slideContent: {
    paddingBottom: 8,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 36,
    marginBottom: 10,
  },
  slideTitleAccent: {
    color: colors.primary,
  },
  slideDescription: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  primaryButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    marginTop: 12,
    alignItems: 'center',
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  devSkip: {
    marginTop: 10,
    alignItems: 'center',
  },
  devSkipText: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
