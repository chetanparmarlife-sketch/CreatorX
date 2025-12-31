import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/src/theme';
import { isEligible, getPlatformDisplayName, formatFollowerCount, SocialPlatform } from '@/src/services/socialConnectMock';

export default function EligibilityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    platform: string;
    followerCount: string;
    handle: string;
  }>();

  const platform = params.platform as SocialPlatform;
  const followerCount = parseInt(params.followerCount || '0', 10);
  const handle = params.handle || '';
  const eligible = isEligible(followerCount);

  const handleContinue = () => {
    if (eligible) {
      router.push({
        pathname: '/(auth)/onboarding-form',
        params: { platform, followerCount: followerCount.toString(), handle },
      });
    }
  };

  const handleTryAnother = () => {
    router.replace('/(auth)/connect');
  };

  const handleLoginWithPhone = () => {
    router.push('/(auth)/login-otp');
  };

  if (eligible) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[colors.emerald, '#10b981']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="check" size={48} color={colors.text} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>You're eligible 🎉</Text>
          <Text style={styles.subtitle}>
            Welcome to CreatorX! Your {getPlatformDisplayName(platform)} account qualifies.
          </Text>

          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Platform</Text>
              <Text style={styles.statValue}>{getPlatformDisplayName(platform)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Followers</Text>
              <Text style={[styles.statValue, styles.followerCount]}>
                {formatFollowerCount(followerCount)}
              </Text>
            </View>
            {handle && (
              <>
                <View style={styles.divider} />
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Handle</Text>
                  <Text style={styles.statValue}>{handle}</Text>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient
              colors={[colors.primary, colors.violet]}
              style={styles.continueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueText}>Continue</Text>
              <Feather name="arrow-right" size={20} color={colors.text} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.notEligibleIcon}>
            <Feather name="x" size={48} color={colors.red} />
          </View>
        </View>

        <Text style={styles.title}>Not eligible yet</Text>
        <Text style={styles.subtitle}>
          You need at least 1,000 followers to join CreatorX.
        </Text>

        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Platform</Text>
            <Text style={styles.statValue}>{getPlatformDisplayName(platform)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Your followers</Text>
            <Text style={[styles.statValue, styles.notEligibleCount]}>
              {formatFollowerCount(followerCount)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Required</Text>
            <Text style={styles.statValue}>1,000+</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.tryAnotherButton} onPress={handleTryAnother}>
            <Feather name="refresh-cw" size={18} color={colors.primary} />
            <Text style={styles.tryAnotherText}>Try another platform</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLoginWithPhone}>
            <Text style={styles.loginText}>Login with phone (existing account)</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notEligibleIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.redLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.red,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  statsCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  followerCount: {
    color: colors.emerald,
  },
  notEligibleCount: {
    color: colors.red,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  continueButton: {
    width: '100%',
    marginTop: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  continueText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    width: '100%',
    marginTop: 32,
    gap: 16,
  },
  tryAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    gap: 8,
  },
  tryAnotherText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
