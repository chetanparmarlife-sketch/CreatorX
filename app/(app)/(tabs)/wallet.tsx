import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks';
import {
  Avatar,
  Button,
  TransactionItem,
  EmptyState,
  ErrorView,
  Skeleton,
  StatCardSkeleton,
  TransactionItemSkeleton,
} from '@/src/components';
import { TransactionDTO } from '@/src/api/services/walletService';
import { useApp } from '@/src/context';
import { useAuth } from '@/src/context/AuthContext';
import { useRefresh } from '@/src/hooks';
import { spacing, borderRadius } from '@/src/theme';
import { formatCurrencyAmount } from '@/src/utils/walletFormatting';

const headerTabs = [
  { id: 'wallet', label: 'Wallet' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'kyc', label: 'KYC' },
];

const invoiceFilters = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'overdue', label: 'Overdue' },
];

const mockInvoices = [
  {
    id: 'INV-2024-001',
    campaign: 'StyleCo - Summer Collection',
    brand: 'StyleCo',
    amount: '₹15,000',
    date: 'Dec 2, 2024',
    dueDate: 'Dec 15, 2024',
    status: 'paid' as const,
  },
  {
    id: 'INV-2024-002',
    campaign: 'TechBrand - Product Review',
    brand: 'TechBrand',
    amount: '₹8,500',
    date: 'Nov 28, 2024',
    dueDate: 'Dec 12, 2024',
    status: 'pending' as const,
  },
  {
    id: 'INV-2024-003',
    campaign: 'FoodieApp - Promo Campaign',
    brand: 'FoodieApp',
    amount: '₹8,000',
    date: 'Nov 25, 2024',
    dueDate: 'Dec 9, 2024',
    status: 'paid' as const,
  },
  {
    id: 'INV-2024-004',
    campaign: 'GymPro - Fitness Challenge',
    brand: 'GymPro',
    amount: '₹12,000',
    date: 'Nov 15, 2024',
    dueDate: 'Nov 29, 2024',
    status: 'paid' as const,
  },
  {
    id: 'INV-2024-005',
    campaign: 'BeautyBox - Skincare Launch',
    brand: 'BeautyBox',
    amount: '₹6,500',
    date: 'Nov 10, 2024',
    dueDate: 'Nov 24, 2024',
    status: 'overdue' as const,
  },
];

const kycSteps = [
  { id: 'personal', label: 'Personal Information', description: 'Basic details and contact info', icon: 'user' as const },
  { id: 'identity', label: 'Identity Verification', description: 'Government ID and selfie', icon: 'credit-card' as const },
  { id: 'address', label: 'Address Proof', description: 'Utility bill or bank statement', icon: 'map-pin' as const },
  { id: 'bank', label: 'Bank Details', description: 'Account for payouts', icon: 'rupee-sign' as const },
];

type FilterType = 'all' | 'credit' | 'debit' | 'pending';

const HeaderTabButton = memo(function HeaderTabButton({
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
        styles.headerTabButton,
        isActive 
          ? [styles.headerTabButtonActive, { borderColor: colors.isDark ? 'rgba(255, 255, 255, 0.8)' : colors.primary }]
          : [styles.headerTabButtonInactive, { backgroundColor: colors.isDark ? '#2a2a2a' : colors.card, borderColor: colors.isDark ? '#2a2a2a' : colors.cardBorder }],
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      data-testid={`tab-${label.toLowerCase()}`}
    >
      <Text style={[
        styles.headerTabButtonText,
        isActive 
          ? { color: colors.isDark ? '#FFFFFF' : colors.primary }
          : { color: colors.isDark ? 'rgba(255, 255, 255, 0.9)' : colors.textSecondary },
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
      data-testid={`filter-${label.toLowerCase()}`}
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

const FilterTab = memo(function FilterTab({
  label,
  isActive,
  onPress,
  count,
  colors,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  count?: number;
  colors: any;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterTab,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
        isActive && { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder },
      ]}
      onPress={onPress}
      data-testid={`filter-${label.toLowerCase()}`}
    >
      <Text style={[
        styles.filterTabText,
        { color: colors.textSecondary },
        isActive && { color: colors.primary, fontWeight: '500' },
      ]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[
          styles.filterCount,
          { backgroundColor: colors.card },
          isActive && { backgroundColor: colors.primary },
        ]}>
          <Text style={[
            styles.filterCountText,
            { color: colors.textMuted },
            isActive && { color: '#FFFFFF' },
          ]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const InvoiceCard = memo(function InvoiceCard({
  invoice,
  colors,
  onDownload,
  onView,
}: {
  invoice: typeof mockInvoices[0];
  colors: any;
  onDownload: () => void;
  onView: () => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return { bg: colors.emeraldLight, text: colors.emerald, border: colors.emeraldBorder };
      case 'pending':
        return { bg: colors.amberLight, text: colors.amber, border: colors.amberBorder };
      case 'overdue':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { bg: colors.card, text: colors.textSecondary, border: colors.cardBorder };
    }
  };

  const statusColors = getStatusColor(invoice.status);

  return (
    <View style={[styles.invoiceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} data-testid={`invoice-${invoice.id}`}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <Text style={[styles.invoiceId, { color: colors.text }]}>{invoice.id}</Text>
          <Text style={[styles.invoiceBrand, { color: colors.textSecondary }]}>{invoice.brand}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Text>
        </View>
      </View>
      <Text style={[styles.invoiceCampaign, { color: colors.text }]} numberOfLines={1}>{invoice.campaign}</Text>
      <View style={styles.invoiceDetails}>
        <View style={styles.invoiceDetailItem}>
          <Feather name="calendar" size={12} color={colors.textMuted} />
          <Text style={[styles.invoiceDetailText, { color: colors.textMuted }]}>{invoice.date}</Text>
        </View>
        <View style={styles.invoiceDetailItem}>
          <Feather name="clock" size={12} color={colors.textMuted} />
          <Text style={[styles.invoiceDetailText, { color: colors.textMuted }]}>Due: {invoice.dueDate}</Text>
        </View>
      </View>
      <View style={styles.invoiceFooter}>
        <Text style={[styles.invoiceAmount, { color: colors.text }]}>{invoice.amount}</Text>
        <View style={styles.invoiceActions}>
          <TouchableOpacity style={[styles.invoiceBtn, { borderColor: colors.cardBorder }]} onPress={onView} data-testid={`view-invoice-${invoice.id}`}>
            <Feather name="eye" size={14} color={colors.text} />
            <Text style={[styles.invoiceBtnText, { color: colors.text }]}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.invoiceBtnPrimary, { backgroundColor: colors.primary }]} onPress={onDownload} data-testid={`download-invoice-${invoice.id}`}>
            <Feather name="download" size={14} color="#1a1a1a" />
            <Text style={styles.invoiceBtnPrimaryText}>Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const KYCStepCard = memo(function KYCStepCard({
  step,
  index,
  status,
  isActive,
  colors,
  onPress,
}: {
  step: typeof kycSteps[0];
  index: number;
  status: 'completed' | 'current' | 'pending' | 'rejected';
  isActive: boolean;
  colors: any;
  onPress: () => void;
}) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <Feather name="check-circle" size={20} color={colors.emerald} />;
      case 'current':
        return <Feather name="edit-3" size={20} color={colors.primary} />;
      case 'rejected':
        return <Feather name="alert-circle" size={20} color="#EF4444" />;
      default:
        return <Feather name="circle" size={20} color={colors.textMuted} />;
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'completed':
        return colors.emeraldBorder;
      case 'current':
        return colors.primaryBorder;
      case 'rejected':
        return 'rgba(239, 68, 68, 0.3)';
      default:
        return colors.cardBorder;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.kycStepCard,
        { backgroundColor: colors.card, borderColor: getBorderColor() },
        status === 'current' && { backgroundColor: colors.primaryLight },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      data-testid={`kyc-step-${step.id}`}
    >
      <View style={styles.kycStepLeft}>
        <View style={[styles.kycStepNumber, { backgroundColor: colors.isDark ? '#2a2a2a' : colors.background }]}>
          <Text style={[styles.kycStepNumberText, { color: colors.textSecondary }]}>{index + 1}</Text>
        </View>
        <View style={styles.kycStepInfo}>
          <Text style={[styles.kycStepTitle, { color: colors.text }]}>{step.label}</Text>
          <Text style={[styles.kycStepDescription, { color: colors.textSecondary }]}>{step.description}</Text>
        </View>
      </View>
      <View style={styles.kycStepRight}>
        {getStatusIcon()}
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
});

export default function MoneyScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const {
    wallet,
    transactions,
    walletLoading,
    walletError,
    transactionsLoading,
    transactionsError,
    fetchWalletSummary,
    fetchTransactions,
    refreshWalletAll,
  } = useApp();
  const { isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState('wallet');
  const [walletFilter, setWalletFilter] = useState<FilterType>('all');
  const [invoiceFilter, setInvoiceFilter] = useState('all');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (hasLoadedOnce) return;
    if (wallet || transactions.length > 0 || walletError || transactionsError) {
      setHasLoadedOnce(true);
    }
  }, [hasLoadedOnce, wallet, transactions.length, walletError, transactionsError]);

  const [kycStatus, setKycStatus] = useState({
    personal: 'completed' as const,
    identity: 'current' as const,
    address: 'pending' as const,
    bank: 'pending' as const,
  });

  const handleRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    await refreshWalletAll();
  }, [isAuthenticated, refreshWalletAll]);

  const { refreshing, handleRefresh: onRefresh } = useRefresh(handleRefresh);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (wallet == null) {
      refreshWalletAll();
    }
  }, [isAuthenticated, wallet, refreshWalletAll]);

  const filteredTransactions = useMemo(() => {
    if (walletFilter === 'all') return transactions;
    if (walletFilter === 'pending') {
      return transactions.filter((t) => t.status === 'PENDING');
    }
    if (walletFilter === 'credit') {
      return transactions.filter((t) => t.type === 'CREDIT');
    }
    return transactions.filter((t) => t.type === 'DEBIT');
  }, [transactions, walletFilter]);

  const filteredInvoices = useMemo(() => {
    if (invoiceFilter === 'all') return mockInvoices;
    return mockInvoices.filter((inv) => inv.status === invoiceFilter);
  }, [invoiceFilter]);

  const counts = useMemo(() => ({
    pending: transactions.filter((t) => t.status === 'PENDING').length,
    credit: transactions.filter((t) => t.type === 'CREDIT').length,
    debit: transactions.filter((t) => t.type === 'DEBIT').length,
  }), [transactions]);

  const invoiceCounts = useMemo(() => ({
    paid: mockInvoices.filter((inv) => inv.status === 'paid').length,
    pending: mockInvoices.filter((inv) => inv.status === 'pending').length,
    overdue: mockInvoices.filter((inv) => inv.status === 'overdue').length,
  }), []);

  const kycProgress = useMemo(() => {
    const total = kycSteps.length;
    const completed = Object.values(kycStatus).filter((s) => s === 'completed').length;
    return Math.round((completed / total) * 100);
  }, [kycStatus]);

  const colorsWithDark = { ...colors, isDark };
  const walletSummary = useMemo(
    () =>
      wallet ?? {
        balance: 0,
        availableBalance: 0,
        pendingBalance: 0,
        currency: 'INR',
      },
    [wallet]
  );
  const showWalletSkeleton = !hasLoadedOnce && walletLoading && !wallet && !walletError;
  const showTransactionsSkeleton =
    !hasLoadedOnce && transactionsLoading && filteredTransactions.length === 0 && !transactionsError;

  const handleSetFilterAll = useCallback(() => setWalletFilter('all'), []);
  const handleSetFilterCredit = useCallback(() => setWalletFilter('credit'), []);
  const handleSetFilterDebit = useCallback(() => setWalletFilter('debit'), []);
  const handleSetFilterPending = useCallback(() => setWalletFilter('pending'), []);
  const handleRetryAll = useCallback(() => {
    fetchWalletSummary();
    fetchTransactions({ page: 0, size: 20, refresh: true });
  }, [fetchWalletSummary, fetchTransactions]);

  const WalletListHeader = useMemo(() => {
    if (showWalletSkeleton && !walletError) {
      return (
        <>
          <View style={[styles.balanceCard, { borderColor: colors.primaryBorder }]}>
            <View style={styles.balanceGradient}>
              <Skeleton width={160} height={16} style={{ marginBottom: spacing.sm }} />
              <Skeleton width={200} height={32} style={{ marginBottom: spacing.sm }} />
              <Skeleton width={120} height={12} />
              <Skeleton width="100%" height={44} style={{ marginTop: spacing.lg }} />
            </View>
          </View>
          <View style={styles.statsRow}>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsScroll}>
              <FilterTab label="All" isActive={walletFilter === 'all'} onPress={handleSetFilterAll} colors={colorsWithDark} />
              <FilterTab label="Income" isActive={walletFilter === 'credit'} onPress={handleSetFilterCredit} count={counts.credit} colors={colorsWithDark} />
              <FilterTab label="Withdrawals" isActive={walletFilter === 'debit'} onPress={handleSetFilterDebit} count={counts.debit} colors={colorsWithDark} />
              <FilterTab label="Pending" isActive={walletFilter === 'pending'} onPress={handleSetFilterPending} count={counts.pending} colors={colorsWithDark} />
            </ScrollView>
          </View>
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>{filteredTransactions.length} transactions</Text>
          </View>
        </>
      );
    }

    return (
      <>
        <View style={[styles.balanceCard, { borderColor: colors.primaryBorder }]}>
          <LinearGradient
            colors={['rgba(19, 55, 236, 0.3)', 'rgba(19, 55, 236, 0.15)', 'rgba(19, 55, 236, 0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceHeader}>
              <View>
                <View style={styles.balanceLabelRow}>
                  <Feather name="credit-card" size={18} color={colors.primary} />
                  <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Available Balance</Text>
                </View>
                <Text style={[styles.balanceValue, { color: colors.text }]}>
                  {formatCurrencyAmount(walletSummary.availableBalance, walletSummary.currency)}
                </Text>
                <Text style={[styles.changeLabel, { color: colors.textMuted }]}>Available now</Text>
              </View>
              <View style={[styles.securedBadge, { backgroundColor: colors.emeraldLight, borderColor: colors.emeraldBorder }]}>
                <Feather name="shield" size={14} color={colors.emerald} />
                <Text style={[styles.securedText, { color: colors.emerald }]}>Secured</Text>
              </View>
            </View>

            <Button
              title="Withdraw (Coming soon)"
              onPress={() => {}}
              variant="primary"
              size="lg"
              icon={<Feather name="arrow-up-right" size={18} color={colors.text} />}
              fullWidth
              style={styles.withdrawBtn}
              disabled
            />
            <Text style={[styles.withdrawNote, { color: colors.textMuted }]}>
              Withdrawals will be enabled after payout setup.
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderColor: colors.amberBorder }]}>
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']}
              style={styles.statGradient}
            >
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
              <Text style={[styles.statValue, { color: colors.amber }]}>
                {formatCurrencyAmount(walletSummary.pendingBalance, walletSummary.currency)}
              </Text>
              <Text style={[styles.statSubtext, { color: colors.textMuted }]}>Under review</Text>
            </LinearGradient>
          </View>
          <View style={[styles.statCard, { borderColor: colors.emeraldBorder }]}>
            <LinearGradient
              colors={['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0.05)']}
              style={styles.statGradient}
            >
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Balance</Text>
              <Text style={[styles.statValue, { color: colors.emerald }]}>
                {formatCurrencyAmount(walletSummary.balance, walletSummary.currency)}
              </Text>
              <Text style={[styles.statSubtext, { color: colors.textMuted }]}>Total</Text>
            </LinearGradient>
          </View>
        </View>
        {walletError && !wallet ? (
          <View style={styles.section}>
            <ErrorView
              error={walletError}
              onRetry={handleRetryAll}
              compact
              showIcon={false}
              title="Wallet summary unavailable"
              hideRetry
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabsScroll}>
            <FilterTab label="All" isActive={walletFilter === 'all'} onPress={handleSetFilterAll} colors={colorsWithDark} />
            <FilterTab label="Income" isActive={walletFilter === 'credit'} onPress={handleSetFilterCredit} count={counts.credit} colors={colorsWithDark} />
            <FilterTab label="Withdrawals" isActive={walletFilter === 'debit'} onPress={handleSetFilterDebit} count={counts.debit} colors={colorsWithDark} />
            <FilterTab label="Pending" isActive={walletFilter === 'pending'} onPress={handleSetFilterPending} count={counts.pending} colors={colorsWithDark} />
          </ScrollView>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>{filteredTransactions.length} transactions</Text>
        </View>
      </>
    );
  }, [
    showWalletSkeleton,
    colors,
    walletSummary,
    walletFilter,
    counts,
    filteredTransactions.length,
    colorsWithDark,
    handleSetFilterAll,
    handleSetFilterCredit,
    handleSetFilterDebit,
    handleSetFilterPending,
  ]);

  const renderTransaction = useCallback(
    ({ item, index }: { item: TransactionDTO; index: number }) => (
      <TransactionItem
        transaction={item}
        isLast={index === filteredTransactions.length - 1}
      />
    ),
    [filteredTransactions.length]
  );

  const transactionKeyExtractor = useCallback((item: TransactionDTO) => item.id, []);

  const WalletListEmpty = useMemo(() => {
    if (transactionsError) {
      return (
        <ErrorView
          error={transactionsError}
          onRetry={handleRetryAll}
          compact
          showIcon={false}
          title="Transactions unavailable"
          hideRetry
        />
      );
    }
    return (
      <EmptyState
        icon="inbox"
        title="No transactions yet"
        subtitle={walletFilter === 'all' ? 'Your transactions will appear here' : `No ${walletFilter} transactions found`}
      />
    );
  }, [walletFilter, transactionsError, handleRetryAll]);

  const TransactionsSkeleton = useMemo(() => (
    <View style={styles.transactionsSkeleton}>
      {[0, 1, 2, 3].map((key) => (
        <TransactionItemSkeleton key={`transaction-skeleton-${key}`} />
      ))}
    </View>
  ), []);


  const renderWalletContent = () => {
    return (
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={transactionKeyExtractor}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={WalletListHeader}
        ListEmptyComponent={showTransactionsSkeleton ? TransactionsSkeleton : WalletListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
      />
    );
  };

  const renderInvoicesContent = () => (
    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.invoiceStats}>
        <View style={[styles.invoiceStatCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Feather name="file-text" size={24} color={colors.primary} />
          <Text style={[styles.invoiceStatValue, { color: colors.text }]}>{mockInvoices.length}</Text>
          <Text style={[styles.invoiceStatLabel, { color: colors.textSecondary }]}>Total Invoices</Text>
        </View>
        <View style={[styles.invoiceStatCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Feather name="check-circle" size={24} color={colors.emerald} />
          <Text style={[styles.invoiceStatValue, { color: colors.text }]}>{invoiceCounts.paid}</Text>
          <Text style={[styles.invoiceStatLabel, { color: colors.textSecondary }]}>Paid</Text>
        </View>
        <View style={[styles.invoiceStatCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Feather name="clock" size={24} color={colors.amber} />
          <Text style={[styles.invoiceStatValue, { color: colors.text }]}>{invoiceCounts.pending}</Text>
          <Text style={[styles.invoiceStatLabel, { color: colors.textSecondary }]}>Pending</Text>
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {invoiceFilters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              isActive={invoiceFilter === filter.id}
              onPress={() => setInvoiceFilter(filter.id)}
              colors={colorsWithDark}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>{filteredInvoices.length} invoices</Text>
      </View>

      <View style={styles.invoicesList}>
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              colors={colorsWithDark}
              onDownload={() => {}}
              onView={() => {}}
            />
          ))
        ) : (
          <EmptyState
            icon="file-text"
            title="No invoices"
            subtitle="Your invoices will appear here"
          />
        )}
      </View>
    </ScrollView>
  );

  const renderKYCContent = () => (
    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={[styles.kycProgressCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.kycProgressHeader}>
          <View>
            <Text style={[styles.kycProgressTitle, { color: colors.text }]}>Verification Progress</Text>
            <Text style={[styles.kycProgressSubtitle, { color: colors.textSecondary }]}>
              Complete all steps to start earning
            </Text>
          </View>
          <View style={[styles.kycProgressBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder }]}>
            <Text style={[styles.kycProgressPercent, { color: colors.primary }]}>{kycProgress}%</Text>
          </View>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.isDark ? '#2a2a2a' : colors.background }]}>
          <View style={[styles.progressFill, { width: `${kycProgress}%`, backgroundColor: colors.primary }]} />
        </View>
        <View style={styles.kycProgressSteps}>
          <Text style={[styles.kycProgressStepsText, { color: colors.textMuted }]}>
            {Object.values(kycStatus).filter((s) => s === 'completed').length} of {kycSteps.length} steps completed
          </Text>
        </View>
      </View>

      {kycStatus.identity === 'rejected' && (
        <View style={[styles.alertCard, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
          <Feather name="alert-triangle" size={20} color="#EF4444" />
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: '#EF4444' }]}>Resubmission Required</Text>
            <Text style={[styles.alertDescription, { color: colors.textSecondary }]}>
              Your identity document was not accepted. Please upload a clearer image.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.kycStepsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Verification Steps</Text>
        {kycSteps.map((step, index) => (
          <KYCStepCard
            key={step.id}
            step={step}
            index={index}
            status={kycStatus[step.id as keyof typeof kycStatus]}
            isActive={kycStatus[step.id as keyof typeof kycStatus] === 'current'}
            colors={colorsWithDark}
            onPress={() => router.push('/kyc')}
          />
        ))}
      </View>

      <View style={[styles.kycHelpCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Feather name="help-circle" size={20} color={colors.primary} />
        <View style={styles.kycHelpContent}>
          <Text style={[styles.kycHelpTitle, { color: colors.text }]}>Need help with verification?</Text>
          <Text style={[styles.kycHelpDescription, { color: colors.textSecondary }]}>
            Contact our support team for assistance with your documents.
          </Text>
        </View>
        <TouchableOpacity style={[styles.kycHelpBtn, { backgroundColor: colors.primaryLight }]} data-testid="button-contact-support">
          <Text style={[styles.kycHelpBtnText, { color: colors.primary }]}>Contact</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.stickyHeader, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7} data-testid="button-profile-avatar">
          <Avatar size={30} name="User" />
        </TouchableOpacity>
        <View style={styles.headerTabsContainer}>
          {headerTabs.map((tab) => (
            <HeaderTabButton
              key={tab.id}
              label={tab.label}
              isActive={selectedTab === tab.id}
              onPress={() => setSelectedTab(tab.id)}
              colors={colorsWithDark}
            />
          ))}
        </View>
      </View>

      {selectedTab === 'wallet' && renderWalletContent()}
      {selectedTab === 'invoices' && renderInvoicesContent()}
      {selectedTab === 'kyc' && renderKYCContent()}
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
  },
  headerTabButtonInactive: {
    borderWidth: 1.5,
  },
  headerTabButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  balanceCard: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  balanceGradient: {
    padding: spacing.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    fontSize: 13,
    marginLeft: spacing.sm,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '500',
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 2,
  },
  changeLabel: {
    fontSize: 11,
    marginLeft: spacing.sm,
  },
  securedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  securedText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  withdrawBtn: {
    marginTop: spacing.xl,
  },
  withdrawNote: {
    marginTop: spacing.sm,
    fontSize: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statGradient: {
    padding: spacing.lg,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '500',
  },
  statSubtext: {
    fontSize: 11,
    marginTop: 4,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  filterTabsScroll: {
    gap: spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 12,
  },
  filterCount: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.full,
    marginLeft: 4,
  },
  filterCountText: {
    fontSize: 10,
  },
  resultsHeader: {
    marginBottom: spacing.md,
  },
  resultsCount: {
    fontSize: 13,
  },
  transactionsSkeleton: {
    paddingTop: spacing.sm,
  },
  transactionsList: {
    gap: 0,
  },
  filtersContainer: {
    marginBottom: spacing.md,
  },
  filtersScroll: {
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
  invoiceStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  invoiceStatCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  invoiceStatValue: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  invoiceStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  invoicesList: {
    gap: spacing.md,
  },
  invoiceCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceId: {
    fontSize: 14,
    fontWeight: '600',
  },
  invoiceBrand: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  invoiceCampaign: {
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  invoiceDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  invoiceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  invoiceDetailText: {
    fontSize: 11,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  invoiceActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  invoiceBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  invoiceBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  invoiceBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  kycProgressCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  kycProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  kycProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  kycProgressSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  kycProgressBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  kycProgressPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  kycProgressSteps: {
    marginTop: spacing.sm,
  },
  kycProgressStepsText: {
    fontSize: 12,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  kycStepsContainer: {
    marginBottom: spacing.lg,
  },
  kycStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  kycStepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  kycStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  kycStepNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kycStepInfo: {
    flex: 1,
  },
  kycStepTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  kycStepDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  kycStepRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  kycHelpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  kycHelpContent: {
    flex: 1,
  },
  kycHelpTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  kycHelpDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  kycHelpBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  kycHelpBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
