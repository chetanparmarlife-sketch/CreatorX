import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme';
import { useAuth } from '@/src/context/AuthContext';

export default function WelcomeScreen() {
  const router = useRouter();
  const { devLogin } = useAuth();

  const handleGetStarted = () => {
    router.push('/(auth)/login-otp');
  };

  const handleSkipDev = () => {
    devLogin();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <LinearGradient
            colors={[colors.primary, colors.violet]}
            style={styles.logoIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="zap" size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.logoText}>CreatorX</Text>
        </View>
      </View>

      <View style={styles.phonePreview}>
        <View style={styles.phoneFrame}>
          <View style={styles.phoneScreen}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewGreeting}>Welcome back!</Text>
              <View style={styles.notificationDot} />
            </View>
            
            <View style={styles.earningsCard}>
              <LinearGradient
                colors={[colors.primary, colors.violet]}
                style={styles.earningsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.memberBadge}>
                  <Feather name="award" size={12} color={colors.amber} />
                  <Text style={styles.memberText}>Pro Creator</Text>
                </View>
                <Text style={styles.earningsLabel}>Total Earnings</Text>
                <Text style={styles.earningsAmount}>₹1,25,000</Text>
                <TouchableOpacity style={styles.viewBtn}>
                  <Text style={styles.viewBtnText}>View →</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            <Text style={styles.sectionTitle}>Active Campaigns</Text>
            <View style={styles.brandsRow}>
              <View style={styles.brandCard}>
                <View style={[styles.brandLogo, { backgroundColor: '#FF6B6B' }]}>
                  <Text style={styles.brandInitial}>N</Text>
                </View>
                <Text style={styles.brandName}>Nykaa</Text>
              </View>
              <View style={styles.brandCard}>
                <View style={[styles.brandLogo, { backgroundColor: '#4ECDC4' }]}>
                  <Text style={styles.brandInitial}>M</Text>
                </View>
                <Text style={styles.brandName}>Myntra</Text>
              </View>
              <View style={styles.brandCard}>
                <View style={[styles.brandLogo, { backgroundColor: '#FFE66D' }]}>
                  <Text style={styles.brandInitial}>B</Text>
                </View>
                <Text style={styles.brandName}>Boat</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.headline}>
          Turn your content{'\n'}into <Text style={styles.headlineHighlight}>earnings.</Text>
        </Text>
        <Text style={styles.subtext}>
          Get paid for brand collaborations.{'\n'}Join 10,000+ creators earning with CreatorX.
        </Text>

        <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
          <Text style={styles.ctaText}>Sign up or Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkipDev}>
          <Text style={styles.skipText}>Skip for Dev Preview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 10,
  },
  phonePreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 0.52,
    backgroundColor: '#1a1a2e',
    borderRadius: 32,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewGreeting: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  earningsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  earningsGradient: {
    padding: 16,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  memberText: {
    fontSize: 10,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  earningsLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  viewBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  brandsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandCard: {
    alignItems: 'center',
    flex: 1,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  brandInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  brandName: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  headlineHighlight: {
    color: colors.primary,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 16,
    padding: 8,
  },
  skipText: {
    color: '#999',
    fontSize: 13,
  },
});
