import { memo, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/hooks';

const headerTabs = [
  { id: 'events', label: 'Events' },
  { id: 'perks', label: 'Perks' },
  { id: 'news', label: 'News' },
];

const cities = [
  { id: 'all', label: 'All Cities', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400' },
  { id: 'bengaluru', label: 'Bengaluru', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400' },
  { id: 'mumbai', label: 'Mumbai', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400' },
  { id: 'delhi', label: 'Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400' },
];

const eventTimeFilters = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'saved', label: 'Saved' },
];

const perkCategories = [
  { id: 'all', label: 'All' },
  { id: 'saas', label: 'SaaS Tools' },
  { id: 'shopping', label: 'Shopping' },
  { id: 'travel', label: 'Travel' },
  { id: 'creator', label: 'Creator Tools' },
];

const newsFilters = [
  { id: 'all', label: 'All' },
  { id: 'product', label: 'Product Update' },
  { id: 'campaign', label: 'Campaign' },
  { id: 'industry', label: 'Industry' },
];

const mockEvents = [
  {
    id: '1',
    title: 'Creator Summit 2025',
    host: 'CreatorX Official',
    date: 'Jan 15, 2025',
    time: '10:00 AM',
    location: 'Bengaluru',
    city: 'bengaluru',
    description: 'Join us for the biggest creator event of the year with exclusive insights and networking opportunities.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    badge: { label: 'Registration Open', tone: 'primary' },
    isPast: false,
    isSaved: true,
  },
  {
    id: '2',
    title: 'Sports & Culture Mixer',
    host: 'Partner Event',
    date: 'Feb 22, 2025',
    time: '6:30 PM',
    location: 'Mumbai',
    city: 'mumbai',
    description: 'An exclusive evening for sports creators to connect with Nike\'s brand team and fellow athletes.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    badge: { label: 'Limited Spots', tone: 'warning' },
    isPast: false,
  },
  {
    id: '3',
    title: 'Monetization Bootcamp',
    host: 'CreatorX Official',
    date: 'Dec 10, 2024',
    time: '11:00 AM',
    location: 'Delhi',
    city: 'delhi',
    description: 'A hands-on bootcamp focused on brand pricing, negotiations, and steady creator income.',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800',
    badge: { label: 'Past Event', tone: 'neutral' },
    isPast: true,
  },
];

const mockPerks = [
  {
    id: '1',
    name: '50% Off Canva Pro',
    partner: 'Canva',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/120px-Canva_icon_2021.svg.png',
    description: 'Create stunning graphics with 50% off Canva Pro annual subscription.',
    validity: 'Valid until Dec 31, 2025',
    category: 'creator',
  },
  {
    id: '2',
    name: 'Free Adobe Creative Cloud Trial',
    partner: 'Adobe',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg/120px-Adobe_Creative_Cloud_rainbow_icon.svg.png',
    description: '3-month free trial of Adobe Creative Cloud for all CreatorX members.',
    validity: 'Valid until Mar 31, 2025',
    category: 'creator',
  },
  {
    id: '3',
    name: '30% Off Notion Team',
    partner: 'Notion',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/120px-Notion-logo.svg.png',
    description: 'Organize your content calendar with 30% off Notion Team plan.',
    validity: 'No expiry',
    category: 'saas',
  },
];

const mockNews = [
  {
    id: '1',
    title: 'CreatorX Launches New Campaign Dashboard',
    source: 'CreatorX',
    sourceType: 'product',
    date: 'Dec 5, 2024',
    summary: 'We are excited to announce the launch of our new campaign dashboard with enhanced analytics and real-time tracking.',
    tag: 'Product Update',
  },
  {
    id: '2',
    title: 'Nike Partners with CreatorX for 2025 Campaign',
    source: 'Nike',
    sourceType: 'campaign',
    date: 'Dec 3, 2024',
    summary: 'Nike announces exclusive partnership with CreatorX platform for their upcoming fitness campaign targeting Gen Z.',
    tag: 'Campaign',
  },
  {
    id: '3',
    title: 'Influencer Marketing to Grow 25% in 2025',
    source: 'Marketing Weekly',
    sourceType: 'industry',
    date: 'Dec 1, 2024',
    summary: 'New industry report predicts significant growth in influencer marketing spend, with micro-influencers leading the charge.',
    tag: 'Industry',
  },
];

const TopTabButton = memo(function TopTabButton({
  label,
  isActive,
  onPress,
  palette,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  palette: ReturnType<typeof getPalette>;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.headerTabButton,
        isActive
          ? [styles.headerTabButtonActive, { borderColor: palette.text }]
          : [styles.headerTabButtonInactive, { backgroundColor: palette.surfaceAlt }],
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.headerTabButtonText, { color: isActive ? palette.text : palette.textMuted }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const FilterPill = memo(function FilterPill({
  label,
  isActive,
  onPress,
  palette,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  palette: ReturnType<typeof getPalette>;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterPill,
        {
          backgroundColor: isActive ? palette.primary : palette.surfaceAlt,
          borderColor: isActive ? palette.primary : 'transparent',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.filterPillText, { color: isActive ? '#FFFFFF' : palette.textMuted }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const CityCard = memo(function CityCard({
  city,
  isActive,
  onPress,
  palette,
}: {
  city: typeof cities[0];
  isActive: boolean;
  onPress: () => void;
  palette: ReturnType<typeof getPalette>;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.cityCard,
        isActive && { borderColor: palette.primary, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image source={{ uri: city.image }} style={styles.cityImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.cityGradient}
      />
      {city.id === 'all' ? (
        <View style={styles.cityAllOverlay}>
          <Text style={styles.cityAllText}>All{'\n'}Cities</Text>
        </View>
      ) : (
        <View style={styles.cityLabelWrap}>
          <Text style={styles.cityLabel}>{city.label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const EventCard = memo(function EventCard({
  event,
  palette,
  onViewDetails,
  onRegister,
}: {
  event: typeof mockEvents[0];
  palette: ReturnType<typeof getPalette>;
  onViewDetails: () => void;
  onRegister: () => void;
}) {
  const badgeTone = getBadgeTone(event.badge?.tone || 'primary', palette);

  return (
    <View style={[styles.eventCard, { backgroundColor: palette.surface, borderColor: palette.cardBorder }]}>
      <View style={styles.eventImageWrap}>
        <Image source={{ uri: event.image }} style={styles.eventImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)']}
          style={styles.eventImageGradient}
        />
        <View style={[styles.eventBadge, { backgroundColor: badgeTone.bg, borderColor: badgeTone.border }]}>
          <Text style={[styles.eventBadgeText, { color: badgeTone.text }]}>{event.badge?.label}</Text>
        </View>
      </View>
      <View style={styles.eventContent}>
        <View style={styles.eventMetaRow}>
          <View style={[styles.eventHostPill, { backgroundColor: palette.primarySoft }]}>
            <Text style={[styles.eventHostText, { color: palette.primary }]}>{event.host}</Text>
          </View>
          <View style={[styles.eventLocationPill, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}>
            <Feather name="map-pin" size={12} color={palette.textMuted} />
            <Text style={[styles.eventLocationText, { color: palette.textMuted }]}>{event.location}</Text>
          </View>
        </View>
        <Text style={[styles.eventTitle, { color: palette.text }]} numberOfLines={2}>{event.title}</Text>
        <View style={styles.eventDateRow}>
          <Feather name="calendar" size={14} color={palette.primary} />
          <Text style={[styles.eventDateText, { color: palette.textMuted }]}>{event.date} • {event.time}</Text>
        </View>
        <Text style={[styles.eventDescription, { color: palette.textMuted }]} numberOfLines={2}>
          {event.description}
        </Text>
        <View style={styles.eventActions}>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: palette.primary }]} onPress={onRegister}>
            <Text style={styles.primaryButtonText}>Register Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: palette.surfaceAlt, borderColor: palette.border }]}
            onPress={onViewDetails}
          >
            <Text style={[styles.secondaryButtonText, { color: palette.text }]}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const PerkCard = memo(function PerkCard({
  perk,
  palette,
  onRedeem,
  onLearnMore,
}: {
  perk: typeof mockPerks[0];
  palette: ReturnType<typeof getPalette>;
  onRedeem: () => void;
  onLearnMore: () => void;
}) {
  const [logoError, setLogoError] = useState(false);

  return (
    <View style={[styles.perkCard, { backgroundColor: palette.surface, borderColor: palette.cardBorder }]}>
      <View style={styles.perkHeader}>
        <View style={[styles.perkLogo, { backgroundColor: palette.surfaceAlt }]}>
          {perk.logo && !logoError ? (
            <Image
              source={{ uri: perk.logo }}
              style={styles.perkLogoImage}
              onError={() => setLogoError(true)}
            />
          ) : (
            <Text style={[styles.perkLogoText, { color: palette.text }]}>{perk.partner.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.perkInfo}>
          <Text style={[styles.perkPartner, { color: palette.textMuted }]}>{perk.partner}</Text>
          <Text style={[styles.perkName, { color: palette.text }]} numberOfLines={1}>{perk.name}</Text>
        </View>
      </View>
      <Text style={[styles.perkDescription, { color: palette.textMuted }]} numberOfLines={2}>
        {perk.description}
      </Text>
      <View style={styles.perkFooter}>
        <View style={styles.perkValidity}>
          <Feather name="clock" size={12} color={palette.textMuted} />
          <Text style={[styles.perkValidityText, { color: palette.textMuted }]}>{perk.validity}</Text>
        </View>
        <View style={styles.perkActions}>
          <TouchableOpacity style={[styles.perkBtn, { backgroundColor: palette.primary }]} onPress={onRedeem}>
            <Text style={styles.perkBtnText}>Redeem</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLearnMore}>
            <Text style={[styles.perkLearnMore, { color: palette.primary }]}>Learn more</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const NewsCard = memo(function NewsCard({
  news,
  palette,
  onReadMore,
}: {
  news: typeof mockNews[0];
  palette: ReturnType<typeof getPalette>;
  onReadMore: () => void;
}) {
  const tagColors = getTagTone(news.tag, palette);

  return (
    <View style={[styles.newsCard, { backgroundColor: palette.surface, borderColor: palette.cardBorder }]}>
      <View style={styles.newsHeader}>
        <View style={[styles.newsTag, { backgroundColor: tagColors.bg }]}>
          <Text style={[styles.newsTagText, { color: tagColors.text }]}>{news.tag}</Text>
        </View>
        <Text style={[styles.newsDate, { color: palette.textMuted }]}>{news.date}</Text>
      </View>
      <Text style={[styles.newsTitle, { color: palette.text }]} numberOfLines={2}>{news.title}</Text>
      <Text style={[styles.newsSource, { color: palette.textMuted }]}>By {news.source}</Text>
      <Text style={[styles.newsSummary, { color: palette.textMuted }]} numberOfLines={3}>
        {news.summary}
      </Text>
      <TouchableOpacity style={styles.newsReadMore} onPress={onReadMore}>
        <Text style={[styles.newsReadMoreText, { color: palette.primary }]}>Read more</Text>
        <Feather name="arrow-right" size={14} color={palette.primary} />
      </TouchableOpacity>
    </View>
  );
});

export default function MoreScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const palette = getPalette(isDark);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: palette.background, borderColor: palette.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={[styles.brandBadge, { backgroundColor: palette.surfaceAlt }]} onPress={() => router.push('/profile')}>
            <Text style={[styles.brandBadgeText, { color: palette.primary }]}>CX</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: palette.text }]}>Community Hub</Text>
        </View>
      </View>

      <View style={styles.comingSoonContainer}>
        <View style={[styles.comingSoonIcon, { backgroundColor: palette.surfaceAlt }]}>
          <Feather name="users" size={48} color={palette.textMuted} />
        </View>
        <Text style={[styles.comingSoonTitle, { color: palette.text }]}>Community Coming Soon</Text>
        <Text style={[styles.comingSoonSubtitle, { color: palette.textMuted }]}>
          Events, perks, and creator news will be available here
        </Text>
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
      textSubtle: '#737373',
      primary: '#0047FF',
      primarySoft: 'rgba(0, 71, 255, 0.2)',
      border: 'rgba(255, 255, 255, 0.08)',
      cardBorder: 'rgba(255, 255, 255, 0.1)',
    }
    : {
      background: '#F3F4F6',
      surface: '#FFFFFF',
      surfaceAlt: '#E5E7EB',
      text: '#0F172A',
      textMuted: '#64748B',
      textSubtle: '#94A3B8',
      primary: '#0047FF',
      primarySoft: 'rgba(0, 71, 255, 0.15)',
      border: 'rgba(15, 23, 42, 0.08)',
      cardBorder: 'rgba(15, 23, 42, 0.08)',
    };
}

function getBadgeTone(tone: string, palette: ReturnType<typeof getPalette>) {
  if (tone === 'warning') {
    return {
      bg: 'rgba(249, 115, 22, 0.2)',
      border: 'rgba(249, 115, 22, 0.3)',
      text: '#FB923C',
    };
  }
  if (tone === 'neutral') {
    return {
      bg: 'rgba(0, 0, 0, 0.4)',
      border: 'rgba(255, 255, 255, 0.1)',
      text: '#E5E7EB',
    };
  }
  return {
    bg: 'rgba(0, 0, 0, 0.6)',
    border: 'rgba(255, 255, 255, 0.12)',
    text: palette.text,
  };
}

function getTagTone(tag: string, palette: ReturnType<typeof getPalette>) {
  switch (tag) {
    case 'Product Update':
      return { bg: palette.primarySoft, text: palette.primary };
    case 'Campaign':
      return { bg: 'rgba(16, 185, 129, 0.18)', text: '#34D399' };
    case 'Industry':
      return { bg: 'rgba(99, 102, 241, 0.2)', text: '#818CF8' };
    default:
      return { bg: palette.surfaceAlt, text: palette.textMuted };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  searchButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  headerTabButton: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  headerTabButtonActive: {
    backgroundColor: 'transparent',
  },
  headerTabButtonInactive: {
    borderColor: 'transparent',
  },
  headerTabButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  citySection: {
    paddingTop: 8,
    paddingBottom: 6,
  },
  cityHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cityLink: {
    fontSize: 12,
    fontWeight: '600',
  },
  cityScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cityCard: {
    width: 110,
    height: 110,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cityImage: {
    width: '100%',
    height: '100%',
  },
  cityGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  cityAllOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  cityAllText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  cityLabelWrap: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cityLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  filtersSticky: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 999,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  eventCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  eventImageWrap: {
    height: 190,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  eventBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  eventBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventContent: {
    padding: 18,
    paddingTop: 12,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventHostPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventHostText: {
    fontSize: 11,
    fontWeight: '700',
  },
  eventLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  eventLocationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  eventDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  eventDateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  filtersInline: {
    paddingVertical: 10,
  },
  perkCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  perkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  perkLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  perkLogoImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  perkLogoText: {
    fontSize: 16,
    fontWeight: '700',
  },
  perkInfo: {
    flex: 1,
  },
  perkPartner: {
    fontSize: 11,
    marginBottom: 2,
  },
  perkName: {
    fontSize: 15,
    fontWeight: '700',
  },
  perkDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  perkFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  perkValidity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  perkValidityText: {
    fontSize: 11,
  },
  perkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  perkBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  perkLearnMore: {
    fontSize: 12,
    fontWeight: '600',
  },
  newsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  newsTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  newsDate: {
    fontSize: 11,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  newsSource: {
    fontSize: 11,
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  newsReadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newsReadMoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 13,
    marginTop: 10,
    fontWeight: '500',
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  comingSoonIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
