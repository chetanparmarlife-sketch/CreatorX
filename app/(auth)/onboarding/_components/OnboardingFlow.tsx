import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius } from '@/src/theme';
import { setOnboardingComplete, OnboardingRole } from '@/src/lib/onboarding';
import { AUTH_LOGIN_ROUTE, DEFAULT_APP_ROUTE } from '@/src/constants/routes';
import { useAuth } from '@/src/context/AuthContext';

export interface OnboardingSlide {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
}

interface OnboardingFlowProps {
  role: OnboardingRole;
  title: string;
  subtitle: string;
  slides: OnboardingSlide[];
}

const { width } = Dimensions.get('window');

export function OnboardingFlow({ role, title, subtitle, slides }: OnboardingFlowProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);

  const totalSteps = slides.length;
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  const activeSlide = useMemo(() => slides[step], [slides, step]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(DEFAULT_APP_ROUTE);
    }
  }, [isAuthenticated, router]);

  const handleFinish = async () => {
    await setOnboardingComplete(role);
    router.replace(AUTH_LOGIN_ROUTE);
  };

  const handleNext = () => {
    if (isLast) {
      handleFinish();
      return;
    }
    setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSkip = () => {
    handleFinish();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#09090b', '#121228', '#0a0a0a']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>CreatorX</Text>
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.slideCard}>
          <View style={styles.iconWrap}>
            <Feather name={activeSlide.icon} size={22} color={colors.text} />
          </View>
          <Text style={styles.slideTitle}>{activeSlide.title}</Text>
          <Text style={styles.slideDescription}>{activeSlide.description}</Text>
        </View>

        <View style={styles.stepRow}>
          {slides.map((_, index) => (
            <View
              key={`step-${index}`}
              style={[
                styles.stepDot,
                index === step ? styles.stepDotActive : styles.stepDotInactive,
              ]}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.actionButton, isFirst && styles.actionDisabled]} onPress={handleBack} disabled={isFirst}>
          <Text style={styles.actionText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
          <Text style={styles.primaryText}>{isLast ? 'Finish' : 'Next'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.glow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  badgeText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  slideCard: {
    marginTop: spacing.xxl,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(20, 20, 32, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  slideTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  slideDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    marginRight: 8,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionDisabled: {
    opacity: 0.4,
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  glow: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    bottom: -width * 0.6,
    left: -width * 0.1,
  },
});
