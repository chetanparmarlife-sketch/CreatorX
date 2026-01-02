import { useState, memo, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/hooks';
import { Avatar } from '@/src/components';
import { spacing, borderRadius } from '@/src/theme';

const { width: screenWidth } = Dimensions.get('window');

const headerTabs = [
  { id: 'events', label: 'Events' },
  { id: 'perks', label: 'Perks' },
  { id: 'news', label: 'News' },
];

const cities = [
  { id: 'all', label: 'All Cities', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400' },
  { id: 'bengaluru', label: 'Bengaluru', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400' },
  { id: 'mumbai', label: 'Mumbai', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400' },
  { id: 'delhi', label: 'New Delhi', image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400' },
  { id: 'hyderabad', label: 'Hyderabad', image: 'https://images.unsplash.com/photo-1626014303219-d4eb6ebcb6be?w=400' },
  { id: 'chennai', label: 'Chennai', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=400' },
];

const eventTimeFilters = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
];

const eventHostFilters = [
  { id: 'all', label: 'All' },
  { id: 'creatorx', label: 'CreatorX' },
  { id: 'brand', label: 'Brand' },
  { id: 'influencer', label: 'Influencer' },
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
    host: 'CreatorX',
    hostType: 'creatorx',
    date: 'Jan 15, 2025',
    time: '10:00 AM',
    location: 'Bengaluru',
    city: 'bengaluru',
    isOnline: false,
    description: 'Join us for the biggest creator event of the year with exclusive insights and networking.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
  },
  {
    id: '2',
    title: 'Brand Collaboration Workshop',
    host: 'Nike',
    hostType: 'brand',
    date: 'Jan 20, 2025',
    time: '2:00 PM',
    location: 'Mumbai',
    city: 'mumbai',
    isOnline: false,
    description: 'Learn how to create impactful brand collaborations that resonate with your audience.',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
  },
  {
    id: '3',
    title: 'Content Strategy Masterclass',
    host: 'Sarah Johnson',
    hostType: 'influencer',
    date: 'Jan 25, 2025',
    time: '4:00 PM',
    location: 'Online',
    city: 'online',
    isOnline: true,
    description: 'Top influencer shares secrets to building a content strategy that drives engagement.',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400',
  },
  {
    id: '4',
    title: 'Monetization Bootcamp',
    host: 'CreatorX',
    hostType: 'creatorx',
    date: 'Feb 1, 2025',
    time: '11:00 AM',
    location: 'New Delhi',
    city: 'delhi',
    isOnline: false,
    description: 'Intensive workshop on maximizing your earning potential as a creator.',
    image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400',
  },
  {
    id: '5',
    title: 'Fashion Week Meetup',
    host: 'Gucci',
    hostType: 'brand',
    date: 'Dec 10, 2024',
    time: '6:00 PM',
    location: 'Hyderabad',
    city: 'hyderabad',
    isOnline: false,
    description: 'Exclusive fashion week event for top creators in the fashion space.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    isPast: true,
  },
  {
    id: '6',
    title: 'Tech Creators Meetup',
    host: 'Google',
    hostType: 'brand',
    date: 'Feb 15, 2025',
    time: '3:00 PM',
    location: 'Chennai',
    city: 'chennai',
    isOnline: false,
    description: 'Connect with tech creators and learn about the latest Google tools for content creation.',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
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
  {
    id: '4',
    name: '$100 Amazon Gift Card',
    partner: 'Amazon',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/120px-Amazon_logo.svg.png',
    description: 'Earn $100 Amazon gift card when you complete 5 campaigns.',
    validity: 'Valid until Feb 28, 2025',
    category: 'shopping',
  },
  {
    id: '5',
    name: '25% Off Airbnb Stays',
    partner: 'Airbnb',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_B%C3%A9lo.svg/120px-Airbnb_Logo_B%C3%A9lo.svg.png',
    description: 'Get 25% off your next Airbnb stay for content creation trips.',
    validity: 'Valid until Jun 30, 2025',
    category: 'travel',
  },
  {
    id: '6',
    name: 'Free Grammarly Premium',
    partner: 'Grammarly',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Grammarly_Logo.svg/120px-Grammarly_Logo.svg.png',
    description: '1-year free Grammarly Premium for polished captions and scripts.',
    validity: 'Valid until Dec 31, 2025',
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
  {
    id: '4',
    title: 'New Payment Options Available',
    source: 'CreatorX',
    sourceType: 'product',
    date: 'Nov 28, 2024',
    summary: 'Creators can now receive payments via PayPal, Stripe, and direct bank transfer with faster processing times.',
    tag: 'Product Update',
  },
  {
    id: '5',
    title: 'Sephora Launches Beauty Creator Program',
    source: 'Sephora',
    sourceType: 'campaign',
    date: 'Nov 25, 2024',
    summary: 'Sephora introduces an exclusive creator program with up to $10K per campaign for beauty influencers.',
    tag: 'Campaign',
  },
  {
    id: '6',
    title: 'TikTok Algorithm Changes Impact Creator Reach',
    source: 'Social Media Today',
    sourceType: 'industry',
    date: 'Nov 20, 2024',
    summary: 'Recent TikTok algorithm updates are affecting creator visibility. Here is what you need to know to adapt.',
    tag: 'Industry',
  },
];

const HeaderTabButton = memo(function HeaderTabButton({
  label,
  isActive,
  onPress,
  colors,
  isDark,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: any;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.headerTabButton,
        isActive 
          ? [styles.headerTabButtonActive, { borderColor: isDark ? 'rgba(255, 255, 255, 0.8)' : colors.primary }]
          : [styles.headerTabButtonInactive, { backgroundColor: isDark ? '#2a2a2a' : colors.card, borderColor: isDark ? '#2a2a2a' : colors.cardBorder }],
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.headerTabButtonText,
        isActive 
          ? { color: isDark ? '#FFFFFF' : colors.primary }
          : { color: isDark ? 'rgba(255, 255, 255, 0.9)' : colors.textSecondary },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const FilterChip = memo(function FilterChip({
  label,
  isActive,
  onPress,
  colors,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
        isActive && { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.filterChipText,
        { color: colors.textSecondary },
        isActive && { color: colors.primary, fontWeight: '600' },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const EventCard = memo(function EventCard({
  event,
  colors,
  onViewDetails,
  onRegister,
}: {
  event: typeof mockEvents[0];
  colors: any;
  onViewDetails: () => void;
  onRegister: () => void;
}) {
  return (
    <View style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={[styles.hostBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.hostBadgeText, { color: colors.primary }]}>{event.host}</Text>
          </View>
          <View style={[styles.locationBadge, { backgroundColor: event.isOnline ? colors.emeraldLight : colors.card, borderColor: colors.cardBorder }]}>
            <Feather name={event.isOnline ? 'video' : 'map-pin'} size={12} color={event.isOnline ? colors.emerald : colors.textSecondary} />
            <Text style={[styles.locationText, { color: event.isOnline ? colors.emerald : colors.textSecondary }]}>
              {event.isOnline ? 'Online' : event.location}
            </Text>
          </View>
        </View>
        <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>{event.title}</Text>
        <View style={styles.eventDateTime}>
          <Feather name="calendar" size={14} color={colors.textMuted} />
          <Text style={[styles.eventDateTimeText, { color: colors.textMuted }]}>{event.date} at {event.time}</Text>
        </View>
        <Text style={[styles.eventDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {event.description}
        </Text>
        <View style={styles.eventActions}>
          <TouchableOpacity style={[styles.eventBtn, { backgroundColor: colors.primary }]} onPress={onRegister}>
            <Text style={styles.eventBtnText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.eventBtnOutline, { borderColor: colors.cardBorder }]} onPress={onViewDetails}>
            <Text style={[styles.eventBtnOutlineText, { color: colors.text }]}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const PerkCard = memo(function PerkCard({
  perk,
  colors,
  onRedeem,
  onLearnMore,
}: {
  perk: typeof mockPerks[0];
  colors: any;
  onRedeem: () => void;
  onLearnMore: () => void;
}) {
  const [logoError, setLogoError] = useState(false);

  return (
    <View style={[styles.perkCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.perkHeader}>
        <View style={[styles.perkLogo, { backgroundColor: '#ffffff' }]}>
          {perk.logo && !logoError ? (
            <Image 
              source={{ uri: perk.logo }} 
              style={styles.perkLogoImage} 
              onError={() => setLogoError(true)}
            />
          ) : (
            <Text style={styles.perkLogoText}>{perk.partner.charAt(0)}</Text>
          )}
        </View>
        <View style={styles.perkInfo}>
          <Text style={[styles.perkPartner, { color: colors.textSecondary }]}>{perk.partner}</Text>
          <Text style={[styles.perkName, { color: colors.text }]} numberOfLines={1}>{perk.name}</Text>
        </View>
      </View>
      <Text style={[styles.perkDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {perk.description}
      </Text>
      <View style={styles.perkFooter}>
        <View style={styles.perkValidity}>
          <Feather name="clock" size={12} color={colors.textMuted} />
          <Text style={[styles.perkValidityText, { color: colors.textMuted }]}>{perk.validity}</Text>
        </View>
        <View style={styles.perkActions}>
          <TouchableOpacity style={[styles.perkBtn, { backgroundColor: colors.primary }]} onPress={onRedeem}>
            <Text style={styles.perkBtnText}>Redeem</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onLearnMore}>
            <Text style={[styles.perkLearnMore, { color: colors.primary }]}>Learn more</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const CityCard = memo(function CityCard({
  city,
  isActive,
  onPress,
  colors,
}: {
  city: typeof cities[0];
  isActive: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.cityCard,
        isActive && { borderColor: colors.primary, borderWidth: 2 },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: city.image }} style={styles.cityImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cityGradient}
      />
      <Text style={[styles.cityLabel, isActive && { color: colors.primary }]}>{city.label}</Text>
    </TouchableOpacity>
  );
});

const NewsCard = memo(function NewsCard({
  news,
  colors,
  onReadMore,
}: {
  news: typeof mockNews[0];
  colors: any;
  onReadMore: () => void;
}) {
  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Product Update':
        return { bg: colors.primaryLight, text: colors.primary };
      case 'Campaign':
        return { bg: colors.emeraldLight, text: colors.emerald };
      case 'Industry':
        return { bg: 'rgba(19, 55, 236, 0.15)', text: '#1337ec' };
      default:
        return { bg: colors.card, text: colors.textSecondary };
    }
  };

  const tagColors = getTagColor(news.tag);

  return (
    <View style={[styles.newsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.newsHeader}>
        <View style={[styles.newsTag, { backgroundColor: tagColors.bg }]}>
          <Text style={[styles.newsTagText, { color: tagColors.text }]}>{news.tag}</Text>
        </View>
        <Text style={[styles.newsDate, { color: colors.textMuted }]}>{news.date}</Text>
      </View>
      <Text style={[styles.newsTitle, { color: colors.text }]} numberOfLines={2}>{news.title}</Text>
      <Text style={[styles.newsSource, { color: colors.textSecondary }]}>By {news.source}</Text>
      <Text style={[styles.newsSummary, { color: colors.textSecondary }]} numberOfLines={3}>
        {news.summary}
      </Text>
      <TouchableOpacity style={styles.newsReadMore} onPress={onReadMore}>
        <Text style={[styles.newsReadMoreText, { color: colors.primary }]}>Read more</Text>
        <Feather name="arrow-right" size={14} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
});

export default function MoreScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('events');
  const [eventTimeFilter, setEventTimeFilter] = useState('upcoming');
  const [eventHostFilter, setEventHostFilter] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [perkCategory, setPerkCategory] = useState('all');
  const [perkSearch, setPerkSearch] = useState('');
  const [newsFilter, setNewsFilter] = useState('all');
  const [newsSearch, setNewsSearch] = useState('');

  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => {
      const timeMatch = eventTimeFilter === 'upcoming' ? !event.isPast : event.isPast;
      const hostMatch = eventHostFilter === 'all' || event.hostType === eventHostFilter;
      const cityMatch = selectedCity === 'all' || event.city === selectedCity || (selectedCity === 'online' && event.isOnline);
      return timeMatch && hostMatch && cityMatch;
    });
  }, [eventTimeFilter, eventHostFilter, selectedCity]);

  const filteredPerks = useMemo(() => {
    let perks = mockPerks;
    if (perkCategory !== 'all') {
      perks = perks.filter(perk => perk.category === perkCategory);
    }
    if (perkSearch.trim()) {
      const query = perkSearch.toLowerCase();
      perks = perks.filter(perk => 
        perk.name.toLowerCase().includes(query) ||
        perk.partner.toLowerCase().includes(query) ||
        perk.description.toLowerCase().includes(query)
      );
    }
    return perks;
  }, [perkCategory, perkSearch]);

  const filteredNews = useMemo(() => {
    let news = mockNews;
    if (newsFilter !== 'all') {
      news = news.filter(n => n.sourceType === newsFilter);
    }
    if (newsSearch.trim()) {
      const query = newsSearch.toLowerCase();
      news = news.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.source.toLowerCase().includes(query) ||
        n.summary.toLowerCase().includes(query)
      );
    }
    return news;
  }, [newsFilter, newsSearch]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.stickyHeader, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
          <Avatar size={30} name="User" />
        </TouchableOpacity>
        <View style={styles.headerTabsContainer}>
          {headerTabs.map((tab) => (
            <HeaderTabButton
              key={tab.id}
              label={tab.label}
              isActive={selectedTab === tab.id}
              onPress={() => setSelectedTab(tab.id)}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {selectedTab === 'events' && (
          <>
            <View style={styles.citiesSection}>
              <Text style={[styles.citiesSectionTitle, { color: colors.text }]}>CITIES</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.citiesScroll}>
                {cities.map((city) => (
                  <CityCard
                    key={city.id}
                    city={city}
                    isActive={selectedCity === city.id}
                    onPress={() => setSelectedCity(city.id)}
                    colors={colors}
                  />
                ))}
              </ScrollView>
            </View>
            <View style={styles.filtersContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                {eventTimeFilters.map((filter) => (
                  <FilterChip
                    key={filter.id}
                    label={filter.label}
                    isActive={eventTimeFilter === filter.id}
                    onPress={() => setEventTimeFilter(filter.id)}
                    colors={colors}
                  />
                ))}
                <View style={[styles.filterDivider, { backgroundColor: colors.cardBorder }]} />
                {eventHostFilters.map((filter) => (
                  <FilterChip
                    key={filter.id}
                    label={filter.label}
                    isActive={eventHostFilter === filter.id}
                    onPress={() => setEventHostFilter(filter.id)}
                    colors={colors}
                  />
                ))}
              </ScrollView>
            </View>
            <View style={styles.section}>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    colors={colors}
                    onViewDetails={() => {}}
                    onRegister={() => {}}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="calendar" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No events found</Text>
                </View>
              )}
            </View>
          </>
        )}

        {selectedTab === 'perks' && (
          <>
            <View style={styles.searchContainer}>
              <View style={[styles.searchBar, { backgroundColor: '#FFFFFF' }]}>
                <Feather name="search" size={20} color="#1a1a1a" />
                <TextInput
                  style={[styles.searchInput, { color: '#1a1a1a' }]}
                  placeholder="Search perks, partners..."
                  placeholderTextColor="rgba(0,0,0,0.5)"
                  value={perkSearch}
                  onChangeText={setPerkSearch}
                />
                {perkSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setPerkSearch('')}>
                    <Feather name="x" size={18} color="#1a1a1a" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.filtersContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                {perkCategories.map((category) => (
                  <FilterChip
                    key={category.id}
                    label={category.label}
                    isActive={perkCategory === category.id}
                    onPress={() => setPerkCategory(category.id)}
                    colors={colors}
                  />
                ))}
              </ScrollView>
            </View>
            <View style={styles.section}>
              {filteredPerks.length > 0 ? (
                filteredPerks.map((perk) => (
                  <PerkCard
                    key={perk.id}
                    perk={perk}
                    colors={colors}
                    onRedeem={() => {}}
                    onLearnMore={() => {}}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="gift" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No perks found</Text>
                </View>
              )}
            </View>
          </>
        )}

        {selectedTab === 'news' && (
          <>
            <View style={styles.searchContainer}>
              <View style={[styles.searchBar, { backgroundColor: '#FFFFFF' }]}>
                <Feather name="search" size={20} color="#1a1a1a" />
                <TextInput
                  style={[styles.searchInput, { color: '#1a1a1a' }]}
                  placeholder="Search news, updates..."
                  placeholderTextColor="rgba(0,0,0,0.5)"
                  value={newsSearch}
                  onChangeText={setNewsSearch}
                />
                {newsSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setNewsSearch('')}>
                    <Feather name="x" size={18} color="#1a1a1a" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.filtersContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                {newsFilters.map((filter) => (
                  <FilterChip
                    key={filter.id}
                    label={filter.label}
                    isActive={newsFilter === filter.id}
                    onPress={() => setNewsFilter(filter.id)}
                    colors={colors}
                  />
                ))}
              </ScrollView>
            </View>
            <View style={styles.section}>
              {filteredNews.length > 0 ? (
                filteredNews.map((news) => (
                  <NewsCard
                    key={news.id}
                    news={news}
                    colors={colors}
                    onReadMore={() => {}}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="file-text" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No news found</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    zIndex: 100,
  },
  headerTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTabButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTabButtonActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerTabButtonInactive: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
  },
  headerTabButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  headerTabButtonTextActive: {
    color: '#FFFFFF',
  },
  headerTabButtonTextInactive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  filtersContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
  },
  filterDivider: {
    width: 1,
    height: 24,
    marginHorizontal: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
    fontWeight: '400',
  },
  citiesSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  citiesSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  citiesScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cityCard: {
    width: (screenWidth - spacing.lg * 2 - spacing.md * 2) / 3,
    height: 100,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  cityImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cityGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  cityLabel: {
    position: 'absolute',
    bottom: spacing.sm,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  eventCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  eventImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  eventContent: {
    padding: spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  hostBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  hostBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '500',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  eventDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  eventDateTimeText: {
    fontSize: 12,
  },
  eventDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  eventActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  eventBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  eventBtnText: {
    color: '#1a1a1a',
    fontSize: 13,
    fontWeight: '600',
  },
  eventBtnOutline: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  eventBtnOutlineText: {
    fontSize: 13,
    fontWeight: '500',
  },
  perkCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  perkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  perkLogo: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  perkLogoImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  perkLogoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  perkInfo: {
    flex: 1,
  },
  perkPartner: {
    fontSize: 12,
    marginBottom: 2,
  },
  perkName: {
    fontSize: 15,
    fontWeight: '600',
  },
  perkDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  perkFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  perkValidity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  perkValidityText: {
    fontSize: 11,
  },
  perkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  perkBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
  },
  perkBtnText: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: '600',
  },
  perkLearnMore: {
    fontSize: 12,
    fontWeight: '500',
  },
  newsCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  newsTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  newsTagText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  newsDate: {
    fontSize: 11,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  newsSource: {
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  newsSummary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  newsReadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newsReadMoreText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: spacing.md,
  },
});
