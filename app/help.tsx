import { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Button, EmptyState } from '@/src/components';
import { useApp } from '@/src/context';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I apply for a campaign?',
    answer: 'Browse available campaigns in the Explore tab, tap on any campaign that interests you, and click "Apply". Fill in the required details and submit your application. Brands typically respond within 2-3 business days.',
    category: 'Campaigns',
  },
  {
    id: '2',
    question: 'When will I receive my payment?',
    answer: 'Payments are processed within 7-14 business days after your deliverable is approved by the brand. You can track payment status in your Wallet section.',
    category: 'Payments',
  },
  {
    id: '3',
    question: 'How do I withdraw my earnings?',
    answer: 'Go to the Wallet tab and tap "Withdraw Funds". Enter the amount you wish to withdraw and select your preferred payment method (Bank Transfer or UPI). Withdrawals are processed within 2-3 business days.',
    category: 'Payments',
  },
  {
    id: '4',
    question: 'What are the requirements for KYC verification?',
    answer: 'You need to submit a valid government ID (Aadhaar, PAN, or Passport), a selfie for identity verification, and bank account details. Verification typically takes 24-48 hours.',
    category: 'Account',
  },
  {
    id: '5',
    question: 'How does the referral program work?',
    answer: 'Share your unique referral code with other creators. When they sign up and complete their first paid campaign, you both earn ₹500! There\'s no limit to how many people you can refer.',
    category: 'Referrals',
  },
  {
    id: '6',
    question: 'What content formats are supported?',
    answer: 'We support images (JPG, PNG), videos (MP4, MOV), and documents (PDF). Maximum file size is 100MB for videos and 10MB for images.',
    category: 'Content',
  },
  {
    id: '7',
    question: 'Can I work with multiple brands at once?',
    answer: 'Yes! You can apply to and work on multiple campaigns simultaneously, as long as there are no exclusivity clauses in your agreements.',
    category: 'Campaigns',
  },
  {
    id: '8',
    question: 'How do I update my social media followers count?',
    answer: 'Go to Profile > Edit Profile > Connected Accounts. Tap on the social platform you want to update and enter your current follower count.',
    category: 'Account',
  },
];

const FAQItemComponent = memo(function FAQItemComponent({
  item,
  isExpanded,
  onToggle,
}: {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity style={styles.faqItem} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <View style={[styles.chevronContainer, isExpanded && styles.chevronExpanded]}>
          <Feather name="chevron-down" size={18} color={colors.textSecondary} />
        </View>
      </View>
      {isExpanded && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );
});

export default function HelpScreen() {
  const router = useRouter();
  const { addNotification } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Campaigns', 'Payments', 'Account', 'Content', 'Referrals'];

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleContact = useCallback((method: 'email' | 'chat' | 'call') => {
    switch (method) {
      case 'email':
        Linking.openURL('mailto:support@creatorx.com?subject=Support Request');
        break;
      case 'chat':
        addNotification({
          type: 'message',
          title: 'Chat Support',
          description: 'A support agent will connect with you shortly',
          time: 'Just now',
          read: false,
        });
        Alert.alert('Chat Support', 'A support agent will connect with you shortly. Average wait time: 2 minutes');
        break;
      case 'call':
        Alert.alert(
          'Call Support',
          'Our support hours are 9 AM - 6 PM IST, Monday to Friday.\n\nCall: 1800-123-4567 (Toll Free)',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call Now', onPress: () => Linking.openURL('tel:18001234567') },
          ]
        );
        break;
    }
  }, [addNotification]);

  const handleReportBug = useCallback(() => {
    Alert.alert(
      'Report a Bug',
      'Help us improve by describing the issue you encountered',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          onPress: () => {
            addNotification({
              type: 'system',
              title: 'Bug Report Submitted',
              description: 'Thank you for your feedback. We\'ll look into this issue.',
              time: 'Just now',
              read: false,
            });
            Alert.alert('Thank You', 'Your bug report has been submitted. We appreciate your help!');
          },
        },
      ]
    );
  }, [addNotification]);

  const handleFeedback = useCallback(() => {
    Alert.alert(
      'Send Feedback',
      'We\'d love to hear your thoughts about CreatorX!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rate App',
          onPress: () => {
            Alert.alert('Thank You!', 'Your rating helps us improve');
          },
        },
      ]
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Help & Support</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contactCard}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.contactGradient}
          >
            <View style={styles.contactHeader}>
              <View style={[styles.contactIcon, { backgroundColor: colors.primaryLight }]}>
                <Feather name="headphones" size={24} color={colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Need Help?</Text>
                <Text style={styles.contactSubtitle}>Our support team is here for you</Text>
              </View>
            </View>

            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactBtn} onPress={() => handleContact('chat')}>
                <Feather name="message-circle" size={18} color={colors.primary} />
                <Text style={styles.contactBtnText}>Live Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} onPress={() => handleContact('email')}>
                <Feather name="mail" size={18} color={colors.primary} />
                <Text style={styles.contactBtnText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} onPress={() => handleContact('call')}>
                <Feather name="phone" size={18} color={colors.primary} />
                <Text style={styles.contactBtnText}>Call</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for help..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {filteredFAQs.length > 0 ? (
            <View style={styles.faqList}>
              {filteredFAQs.map((faq) => (
                <FAQItemComponent
                  key={faq.id}
                  item={faq}
                  isExpanded={expandedId === faq.id}
                  onToggle={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="search"
              title="No results found"
              subtitle="Try a different search term or browse categories"
            />
          )}
        </View>

        <View style={styles.quickLinks}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          
          <TouchableOpacity style={styles.quickLinkItem} onPress={handleFeedback}>
            <View style={[styles.quickLinkIcon, { backgroundColor: colors.amberLight }]}>
              <Feather name="star" size={18} color={colors.amber} />
            </View>
            <View style={styles.quickLinkContent}>
              <Text style={styles.quickLinkTitle}>Rate the App</Text>
              <Text style={styles.quickLinkDescription}>Share your experience</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickLinkItem} onPress={handleReportBug}>
            <View style={[styles.quickLinkIcon, { backgroundColor: colors.redLight }]}>
              <Feather name="alert-triangle" size={18} color={colors.red} />
            </View>
            <View style={styles.quickLinkContent}>
              <Text style={styles.quickLinkTitle}>Report a Bug</Text>
              <Text style={styles.quickLinkDescription}>Help us fix issues</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickLinkItem}
            onPress={() => Linking.openURL('https://creatorx.com/terms')}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: colors.blueLight }]}>
              <Feather name="file-text" size={18} color={colors.blue} />
            </View>
            <View style={styles.quickLinkContent}>
              <Text style={styles.quickLinkTitle}>Terms of Service</Text>
              <Text style={styles.quickLinkDescription}>Read our policies</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickLinkItem}
            onPress={() => Linking.openURL('https://creatorx.com/privacy')}
          >
            <View style={[styles.quickLinkIcon, { backgroundColor: colors.emeraldLight }]}>
              <Feather name="shield" size={18} color={colors.emerald} />
            </View>
            <View style={styles.quickLinkContent}>
              <Text style={styles.quickLinkTitle}>Privacy Policy</Text>
              <Text style={styles.quickLinkDescription}>How we protect your data</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>CreatorX v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with love in India</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  contactCard: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  contactGradient: {
    padding: spacing.xl,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  contactIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: spacing.md,
  },
  contactTitle: {
    ...typography.h4,
    color: colors.text,
  },
  contactSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  contactBtnText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '500',
  },
  searchSection: {
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.text,
    fontSize: 15,
  },
  categoriesContainer: {
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  categoryChipText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  faqSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  faqList: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  faqItem: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  faqQuestion: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  faqAnswer: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  quickLinks: {
    marginBottom: spacing.xl,
  },
  quickLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  quickLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLinkContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  quickLinkTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  quickLinkDescription: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  footerText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  footerSubtext: {
    ...typography.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
});
