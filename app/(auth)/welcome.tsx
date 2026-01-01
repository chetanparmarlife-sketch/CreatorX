import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme';
import { useAuth } from '@/src/context/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const PHONE_WIDTH = Math.min(screenWidth * 0.5, 200);
const PHONE_HEIGHT = PHONE_WIDTH * 2;

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
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <LinearGradient
              colors={[colors.primary, colors.violet]}
              style={styles.logoIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="zap" size={16} color="#fff" />
            </LinearGradient>
            <Text style={styles.logoText}>CreatorX</Text>
          </View>
        </View>

        <View style={styles.phoneContainer}>
          <View style={[styles.phoneFrame, { width: PHONE_WIDTH, height: PHONE_HEIGHT }]}>
            <View style={styles.phoneNotch} />
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
                    <Feather name="award" size={8} color={colors.amber} />
                    <Text style={styles.memberText}>Pro Creator</Text>
                  </View>
                  <Text style={styles.earningsLabel}>Total Earnings</Text>
                  <View style={styles.earningsRow}>
                    <Text style={styles.earningsAmount}>₹1,25,000</Text>
                    <TouchableOpacity style={styles.viewBtn}>
                      <Text style={styles.viewBtnText}>View →</Text>
                    </TouchableOpacity>
                  </View>
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

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Campaigns</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>45K</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>4.8</Text>
                  <Text style={styles.statLabel}>Rating</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 8,
  },
  phoneContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  phoneFrame: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  phoneNotch: {
    position: 'absolute',
    top: 5,
    left: '50%',
    marginLeft: -18,
    width: 36,
    height: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    zIndex: 10,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 10,
    paddingTop: 20,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewGreeting: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
  },
  notificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  earningsCard: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  earningsGradient: {
    padding: 8,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  memberText: {
    fontSize: 7,
    color: '#fff',
    marginLeft: 2,
    fontWeight: '500',
  },
  earningsLabel: {
    fontSize: 7,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  viewBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  viewBtnText: {
    fontSize: 7,
    fontWeight: '600',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  brandsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandCard: {
    alignItems: 'center',
    flex: 1,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  brandInitial: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  brandName: {
    fontSize: 7,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: 6,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 10,
  },
  headlineHighlight: {
    color: colors.primary,
  },
  subtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
    width: '100%',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipButton: {
    marginTop: 14,
    padding: 8,
  },
  skipText: {
    color: '#999',
    fontSize: 13,
  },
});
