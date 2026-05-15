import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/src/hooks';

export default function MoreScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const palette = getPalette(isDark);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: palette.background, borderColor: palette.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={[styles.brandBadge, { backgroundColor: palette.surfaceAlt }]}
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
          >
            <Text style={[styles.brandBadgeText, { color: palette.primary }]}>CX</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Community Hub</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.comingSoonCard, { backgroundColor: palette.surface, borderColor: palette.cardBorder }]}>
          <View style={[styles.comingSoonIcon, { backgroundColor: palette.surfaceAlt }]}>
            <Feather name="users" size={40} color={palette.primary} />
          </View>
          <Text style={[styles.comingSoonTitle, { color: palette.text }]}>Community Coming Soon</Text>
          <Text style={[styles.comingSoonSubtitle, { color: palette.textMuted }]}>
            Events, perks, and creator news will be available after the enterprise workflow release.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function getPalette(isDark: boolean) {
  return isDark
    ? {
      background: '#000000',
      surface: '#111111',
      surfaceAlt: '#1E1E1E',
      text: '#FFFFFF',
      textMuted: '#A3A3A3',
      primary: '#0047FF',
      border: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.1)',
    }
    : {
      background: '#F3F4F6',
      surface: '#FFFFFF',
      surfaceAlt: '#E5E7EB',
      text: '#0F172A',
      textMuted: '#64748B',
      primary: '#0047FF',
      border: 'rgba(15, 23, 42, 0.08)',
      cardBorder: 'rgba(15, 23, 42, 0.08)',
    };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  comingSoonCard: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  comingSoonIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
