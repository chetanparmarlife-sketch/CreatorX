import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const PRIMARY = '#135bec';
const BG_DARK = '#000000';
const SURFACE = '#161b26';

const hosts = [
  {
    id: '1',
    name: 'Sarah Styles',
    handle: '@sarahstyles',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA07m7ClVdVlHNo1Jl9Taa_XeMni_8R5fB0BSg1dd81ZFibjvmhKK-a75L76NHA03MGzA2X5PPDgrt_3oMsGJWfdMy1v6gEPxIKcMmr-2ugCD6rHslcvK-hpCCo9ZgwmSkeqECIaKYTZi-jOrJ7ZaO8kzVn0SCO_iTHeWmKEYVZnBln-7wpzOaFXLtDWVdHnhvv8l2YeVvBD766cv2kCxHhnWp3FzK61A7Ex5pz6h0EU4ket8aFOcWPljBjEQUHHHSzo6f6TrG6XRU',
    highlight: true,
  },
  {
    id: '2',
    name: 'Tech Tom',
    handle: '@techtom',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKMe3zpMOqxtjlzidK62ma3s8jxgmuQb5t9EPHhxJ3BVleX3ritK1PBFcvFsskrp0TYtNSN3JfKHVqWXcp5HgUadZPKlSML_09KGxs3ohKOxiTlRuUMmQ9DYtUfBv9qsTa8yrtbo2lDTk2zJ3DN61i-27fWgIz-AWMhdZBQYEZBeliEwDyj8FDG1na9dqtcPGgW90Sx-beDq6rml7aux22dpitKRoUhKss_RNUTl-19c3ypBQzN24ao471KX0FClE1LEvoTamKhCE',
  },
  {
    id: '3',
    name: 'Mina K.',
    handle: '@minacreates',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiTCIEzZP8eGG2PDV2GxhsaBucpS86LvhW6x5WmE76Zvlsg2G1fCL7iDaDmSVgNHRjScVRBCJBMBdJRV9JYqiXu5EcHtEx9QJeafa21k5UG56gbBT0WNqb2TpbP8QE8nKqijNLDQu5vmlhmg2qjV1QKXDk621rd5ImLumcRDTr67Nm7SUV_AUYNM3gp9uMZhxfJA7srhLfr6Qj1jJ8kzRGeaV5jgsZs1eDdPhyNsn13yjIYiW6mVQCQEnFfyDCejP82BXxI-ml1bg',
  },
  {
    id: '4',
    name: 'Alex J.',
    handle: '@alexj',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCP224xvCRSDpORCOTSilj22jAVRic9oMZIcvRMKBpTcaAtC0K8TPrTaQEoNtudH977Z1WDfT8w2PujRwJeb0xFSoRj4MwyPJ0kpRLvawAT3q_zIthfboFBNoQmDdSlaLu7VoWyZRIO-5ACLRTMOIZPQ46qsZjlzBij7TTsQXfYeWPEGEbSNnvQ7i-4xYCSzgFtkBwE8-5LO2xiwg7Bi6PCrOjgaxO5TxYNks7D8CIQ38oRsAqdulRkfDV58W9YVhztsy3NPJWcb70',
  },
];

export default function EventDetailsScreen() {
  const router = useRouter();

  const eventMeta = useMemo(
    () => ({
      title: 'CreatorX Summer Summit: Los Angeles',
      date: 'Oct 12, 2023',
      time: '7:00 PM - 10:00 PM',
      price: 'Free',
      strikePrice: '$50',
      location: 'The Hoxton',
      address: '1060 S Broadway, Los Angeles, CA 90015',
      hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe5d9Cl1jw1NFDausIeMWpSAFbsC80PzlKjO3RaauWs9N9zhCJrWs3V_AZkqV9GST-bJPGL1eciMw6KPL1_He4kXAwCcieJeRaB47srJvmy4OSID569FyPkH2MNef78QApHOgZxPbflRIlPq-2W149nbLp0DInoiu1ntS_IYvLqh7dmLFTCf5vnq99aVQk8qqWeAqsFQKshcj5bLWFO1ujky6Dbr2pgOeW_j7RBZ8_oY-nzuWQNRwsoDtkHM6MGEc9VOBwrQ9wM4w',
      map: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhHuQVad6nJkSS-ep1GgOmRvelwjhbZTznzgZvhXAJxeanzpMgpldgzvJxipspuFFT_joS8BSMtGFSY7va0Xnf4WqgQ7jK4ImySZU9kuJZ5JEvoiAEKbc_gAXSKy7niBDEYTlEIKPE7lF0W2P6FrXD0s3BPZCsr0Ni0UOwGOIckt3s8707nvokLg7iSE1rcCvnNX6eHo1bxK7cX2b7q3ubLLwMKurJX13dH3awWXx8V4uYnwOfgLeYfsDjB_ZEl0yarqzHzqulVe4',
    }),
    []
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.headerOverlay}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.8}>
            <Feather name="arrow-left" size={18} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
              <Feather name="heart" size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
              <Feather name="share-2" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.hero}>
            <Image source={{ uri: eventMeta.hero }} style={styles.heroImage} />
            <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)']} style={styles.heroGradient} />
            <View style={styles.heroContent}>
              <View style={styles.heroChips}>
                <View style={styles.primaryChip}>
                  <Text style={styles.primaryChipText}>CreatorX Exclusive</Text>
                </View>
                <View style={styles.secondaryChip}>
                  <Text style={styles.secondaryChipText}>Networking</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>{eventMeta.title}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.infoRow}>
              <View>
                <View style={styles.infoItem}>
                  <Feather name="calendar" size={18} color={PRIMARY} />
                  <Text style={styles.infoTitle}>{eventMeta.date}</Text>
                </View>
                <View style={styles.infoItemMuted}>
                  <Feather name="clock" size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.infoSubtitle}>{eventMeta.time}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.calendarButton} activeOpacity={0.8}>
                <Feather name="plus" size={16} color={PRIMARY} />
                <Text style={styles.calendarButtonText}>Calendar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Feather name="ticket" size={34} color="rgba(19,91,236,0.2)" style={styles.statIcon} />
              <Text style={styles.statLabel}>Entry</Text>
              <Text style={styles.statValue}>Free</Text>
              <Text style={styles.statHint}>For members</Text>
            </View>
            <View style={styles.statCard}>
              <Feather name="users" size={34} color="rgba(19,91,236,0.2)" style={styles.statIcon} />
              <Text style={styles.statLabel}>Capacity</Text>
              <Text style={styles.statValue}>50 ppl</Text>
              <Text style={styles.statHint}>12 spots left</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Event</Text>
            <Text style={styles.sectionBody}>
              Join 50+ top creators for an intimate evening of networking, cocktails, and real talk about the industry.
              We are gathering at The Hoxton to discuss brand partnerships, platform changes, and how to scale your
              business in Q4.
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.readMore}>Read more</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hosted By</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hostsRow}>
              {hosts.map((host) => (
                <View key={host.id} style={styles.hostCard}>
                  <View style={[styles.hostAvatarWrap, host.highlight && styles.hostAvatarWrapActive]}>
                    <View style={styles.hostAvatarInner}>
                      <Image source={{ uri: host.image }} style={styles.hostAvatar} />
                    </View>
                  </View>
                  <Text style={styles.hostName}>{host.name}</Text>
                  <Text style={styles.hostHandle}>{host.handle}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.section, styles.sectionBottom]}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <View style={styles.mapWrap}>
                <Image source={{ uri: eventMeta.map }} style={styles.mapImage} />
                <View style={styles.mapPulse}>
                  <View style={styles.mapPulseRing}>
                    <View style={styles.mapPulseDot} />
                  </View>
                </View>
                <TouchableOpacity style={styles.mapButton} activeOpacity={0.85}>
                  <Text style={styles.mapButtonText}>View Map</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.locationInfo}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationTitle}>{eventMeta.location}</Text>
                  <Text style={styles.locationAddress}>{eventMeta.address}</Text>
                </View>
                <TouchableOpacity style={styles.locationAction} activeOpacity={0.8}>
                  <Feather name="navigation" size={18} color={PRIMARY} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.actionBar}>
          <View style={styles.priceWrap}>
            <Text style={styles.priceLabel}>Total Price</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>{eventMeta.price}</Text>
              <Text style={styles.priceStrike}>{eventMeta.strikePrice}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.rsvpButton} activeOpacity={0.85}>
            <Text style={styles.rsvpText}>RSVP Now</Text>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  scrollContent: {
    paddingBottom: 140,
  },
  hero: {
    height: 420,
    minHeight: 360,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  heroContent: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
  },
  heroChips: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  primaryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(19,91,236,0.9)',
    shadowColor: PRIMARY,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  primaryChipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  secondaryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  secondaryChipText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 34,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sectionBottom: {
    paddingBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoItemMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  infoTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  infoSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(19,91,236,0.15)',
  },
  calendarButtonText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  statIcon: {
    position: 'absolute',
    top: 6,
    right: 10,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  statHint: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionBody: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  readMore: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  hostsRow: {
    paddingTop: 8,
    paddingBottom: 4,
    gap: 16,
  },
  hostCard: {
    alignItems: 'center',
    width: 84,
  },
  hostAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 8,
  },
  hostAvatarWrapActive: {
    borderColor: PRIMARY,
  },
  hostAvatarInner: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#1f1f1f',
  },
  hostAvatar: {
    width: '100%',
    height: '100%',
  },
  hostName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  hostHandle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 2,
  },
  locationCard: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  mapWrap: {
    height: 140,
    backgroundColor: '#0f0f0f',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  mapPulse: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  mapPulseRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19,91,236,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(19,91,236,0.5)',
  },
  mapPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },
  mapButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mapButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  locationTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  locationAddress: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  locationAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  priceWrap: {
    flex: 1,
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  priceValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  priceStrike: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textDecorationLine: 'line-through',
    textDecorationColor: 'rgba(255,255,255,0.3)',
  },
  rsvpButton: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: PRIMARY,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  rsvpText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
