import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks';
import {
  TransactionItem,
  EmptyState,
  ErrorView,
  Skeleton,
  StatCardSkeleton,
  TransactionItemSkeleton,
} from '@/src/components';
import { TransactionDTO, WithdrawalDTO } from '@/src/api/services/walletService';
import { kycService, KYCStatusResponse } from '@/src/api/services/kycService';
import { invoiceService, FormattedInvoice, InvoiceCountsDTO } from '@/src/api/services/invoiceService';
import { useApp } from '@/src/context';
import { useAuth } from '@/src/context/AuthContext';
import { useRefresh } from '@/src/hooks';
import { spacing, borderRadius } from '@/src/theme';
import { formatCurrencyAmount, formatDateTime } from '@/src/utils/walletFormatting';

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
  invoice: FormattedInvoice;
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
  const insets = useSafeAreaInsets();
  const lastRequestedTransactionsPageRef = useRef(-1);
  const lastRequestedWithdrawalsPageRef = useRef(-1);
  const {
    wallet,
    transactions,
    withdrawals,
    walletLoading,
    walletError,
    transactionsLoading,
    transactionsError,
    withdrawalsLoading,
    withdrawalsError,
    fetchWalletSummary,
    fetchTransactions,
    fetchWithdrawals,
    refreshWalletAll,
    transactionsHasMore,
    transactionsPage,
    withdrawalsHasMore,
    withdrawalsPage,
  } = useApp();
  const { isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState('wallet');
  const [walletFilter, setWalletFilter] = useState<FilterType>('all');
  const [invoiceFilter, setInvoiceFilter] = useState('all');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [listMode, setListMode] = useState<'transactions' | 'withdrawals'>('transactions');

  useEffect(() => {
    if (hasLoadedOnce) return;
    if (wallet || transactions.length > 0 || withdrawals.length > 0 || walletError || transactionsError || withdrawalsError) {
      setHasLoadedOnce(true);
    }
  }, [hasLoadedOnce, wallet, transactions.length, withdrawals.length, walletError, transactionsError, withdrawalsError]);

  const [kycStatus, setKycStatus] = useState<{
    personal: 'completed' | 'current' | 'pending' | 'rejected';
    identity: 'completed' | 'current' | 'pending' | 'rejected';
    address: 'completed' | 'current' | 'pending' | 'rejected';
    bank: 'completed' | 'current' | 'pending' | 'rejected';
  }>({
    personal: 'pending',
    identity: 'pending',
    address: 'pending',
    bank: 'pending',
  });
  const [kycLoading, setKycLoading] = useState(false);

  // Invoice state
  const [invoices, setInvoices] = useState<FormattedInvoice[]>([]);
  const [invoiceCounts, setInvoiceCounts] = useState<InvoiceCountsDTO>({ paid: 0, pending: 0, overdue: 0 });
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState<string | null>(null);

  // Fetch invoices from API
  const fetchInvoices = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setInvoicesLoading(true);
      setInvoicesError(null);
      const [invoicesResponse, countsResponse] = await Promise.all([
        invoiceService.getFormattedInvoices(0, 50, invoiceFilter === 'all' ? undefined : invoiceFilter),
        invoiceService.getInvoiceCounts(),
      ]);
      setInvoices(invoicesResponse.invoices);
      setInvoiceCounts(countsResponse);
    } catch (err) {
      console.warn('[Wallet] Failed to fetch invoices:', err);
      setInvoicesError('Failed to load invoices');
    } finally {
      setInvoicesLoading(false);
    }
  }, [isAuthenticated, invoiceFilter]);

  // Fetch invoices when invoices tab is selected or filter changes
  useEffect(() => {
    if (selectedTab === 'invoices') {
      fetchInvoices();
    }
  }, [selectedTab, invoiceFilter, fetchInvoices]);

  // Fetch KYC status from API
  const fetchKycStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setKycLoading(true);
      const response = await kycService.getKYCStatus();
      // Map KYC documents to step statuses
      const newStatus = {
        personal: 'pending' as const,
        identity: 'pending' as const,
        address: 'pending' as const,
        bank: 'pending' as const,
      };

      response.documents.forEach(doc => {
        const statusMap: Record<string, 'completed' | 'current' | 'pending' | 'rejected'> = {
          'APPROVED': 'completed',
          'PENDING': 'current',
          'REJECTED': 'rejected',
        };
        const mappedStatus = statusMap[doc.status] || 'pending';

        if (doc.documentType === 'PAN' || doc.documentType === 'AADHAAR') {
          newStatus.identity = mappedStatus;
        } else if (doc.documentType === 'PASSPORT' || doc.documentType === 'DRIVING_LICENSE') {
          newStatus.address = mappedStatus;
        } else if (doc.documentType === 'GST') {
          newStatus.bank = mappedStatus;
        }
      });

      // Personal is considered complete if user is authenticated
      newStatus.personal = 'completed';

      setKycStatus(newStatus);
    } catch (err) {
      console.warn('[Wallet] Failed to fetch KYC status:', err);
    } finally {
      setKycLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch KYC status on mount when KYC tab is selected
  useEffect(() => {
    if (selectedTab === 'kyc') {
      fetchKycStatus();
    }
  }, [selectedTab, fetchKycStatus]);

  const handleRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    lastRequestedTransactionsPageRef.current = -1;
    lastRequestedWithdrawalsPageRef.current = -1;
    await refreshWalletAll();
  }, [isAuthenticated, refreshWalletAll]);

  const { refreshing, handleRefresh: onRefresh } = useRefresh(handleRefresh);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!hasLoadedOnce) {
      refreshWalletAll();
    }
  }, [isAuthenticated, hasLoadedOnce, refreshWalletAll]);

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
    if (invoiceFilter === 'all') return invoices;
    return invoices.filter((inv) => inv.status === invoiceFilter);
  }, [invoiceFilter, invoices]);

  const counts = useMemo(() => ({
    pending: transactions.filter((t) => t.status === 'PENDING').length,
    credit: transactions.filter((t) => t.type === 'CREDIT').length,
    debit: transactions.filter((t) => t.type === 'DEBIT').length,
  }), [transactions]);

  const kycProgress = useMemo(() => {
    const total = kycSteps.length;
    const completed = Object.values(kycStatus).filter((s) => s === 'completed').length;
    return Math.round((completed / total) * 100);
  }, [kycStatus]);

  const colorsWithDark = { ...colors, isDark };
  const backgroundColor = isDark ? '#050505' : colors.background;
  const surfaceColor = isDark ? '#121212' : colors.card;
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : colors.cardBorder;
  const mutedText = isDark ? '#9da1b9' : colors.textMuted;
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
  const chartBars = useMemo(
    () => [0.3, 0.5, 0.4, 0.7, 0.45, 0.6, 0.3, 0.8, 0.55, 0.4, 0.9, 0.65, 0.4, 0.75],
    []
  );
  const showWalletSkeleton = !hasLoadedOnce && walletLoading && !wallet && !walletError;
  const showTransactionsSkeleton =
    !hasLoadedOnce && transactionsLoading && filteredTransactions.length === 0 && !transactionsError;
  const showWithdrawalsSkeleton =
    !hasLoadedOnce && withdrawalsLoading && withdrawals.length === 0 && !withdrawalsError;

  const handleSetFilterAll = useCallback(() => setWalletFilter('all'), []);
  const handleSetFilterCredit = useCallback(() => setWalletFilter('credit'), []);
  const handleSetFilterDebit = useCallback(() => setWalletFilter('debit'), []);
  const handleSetFilterPending = useCallback(() => setWalletFilter('pending'), []);
  const handleRetryAll = useCallback(() => {
    lastRequestedTransactionsPageRef.current = -1;
    lastRequestedWithdrawalsPageRef.current = -1;
    refreshWalletAll();
  }, [refreshWalletAll]);

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
        {walletError ? (
          <View style={styles.errorBlock}>
            <ErrorView
              error={walletError}
              onRetry={refreshWalletAll}
              compact
              showIcon={false}
              title="Wallet unavailable"
            />
          </View>
        ) : null}
        <View style={styles.balanceSection}>
          <View style={styles.balanceLabelRow}>
            <Text style={[styles.balanceLabelText, { color: mutedText }]}>Available Balance</Text>
            <TouchableOpacity style={styles.balanceIconButton} activeOpacity={0.7}>
              <Feather name="eye" size={16} color={mutedText} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.balanceValueLarge, { color: colors.text }]}>
            {formatCurrencyAmount(walletSummary.availableBalance, walletSummary.currency)}
          </Text>
          <View style={styles.walletStatsRow}>
            <View style={[styles.walletStatCard, { backgroundColor: surfaceColor, borderColor: borderColor }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                <Feather name="clock" size={16} color="#f59e0b" />
              </View>
              <Text style={[styles.statValueText, { color: colors.text }]}>
                {formatCurrencyAmount(walletSummary.pendingBalance, walletSummary.currency)}
              </Text>
              <Text style={[styles.statLabelText, { color: mutedText }]}>Pending</Text>
            </View>
            <View style={[styles.walletStatCard, { backgroundColor: surfaceColor, borderColor: borderColor }]}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Feather name="dollar-sign" size={16} color="#10b981" />
              </View>
              <Text style={[styles.statValueText, { color: colors.text }]}>
                {formatCurrencyAmount(walletSummary.balance, walletSummary.currency)}
              </Text>
              <Text style={[styles.statLabelText, { color: mutedText }]}>Total Earned</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Earnings</Text>
            <Text style={[styles.chartCaption, { color: mutedText }]}>Last 30 Days</Text>
          </View>
          <View style={[styles.chartCard, { backgroundColor: surfaceColor, borderColor: borderColor }]}>
            <View style={styles.chartBars}>
              {chartBars.map((height, index) => (
                <View
                  key={`chart-bar-${index}`}
                  style={[
                    styles.chartBar,
                    { height: `${height * 100}%`, backgroundColor: index === chartBars.length - 1 ? colors.primary : 'rgba(19, 55, 236, 0.2)' },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.transactionsHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {listMode === 'transactions' ? 'Recent Transactions' : 'Recent Withdrawals'}
          </Text>
          <View style={styles.segmentControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                listMode === 'transactions' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setListMode('transactions')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.segmentText,
                { color: listMode === 'transactions' ? '#ffffff' : mutedText },
              ]}>
                Transactions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                listMode === 'withdrawals' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setListMode('withdrawals')}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.segmentText,
                { color: listMode === 'withdrawals' ? '#ffffff' : mutedText },
              ]}>
                Withdrawals
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {null}
      </>
    );
  }, [
    showWalletSkeleton,
    colors,
    walletSummary,
    walletFilter,
    counts,
    colorsWithDark,
    surfaceColor,
    borderColor,
    mutedText,
    chartBars,
    handleSetFilterAll,
    handleSetFilterCredit,
    handleSetFilterDebit,
    handleSetFilterPending,
    listMode,
    walletError,
    refreshWalletAll,
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
  const withdrawalKeyExtractor = useCallback((item: WithdrawalDTO) => item.id, []);

  const renderWithdrawal = useCallback(
    ({ item, index }: { item: WithdrawalDTO; index: number }) => {
      const statusColor =
        item.status === 'PAID'
          ? colors.emerald
          : item.status === 'FAILED'
            ? colors.red
            : colors.amber;
      const statusLabel = item.status.charAt(0) + item.status.slice(1).toLowerCase();
      return (
        <View
          style={[
            styles.withdrawalItem,
            { borderBottomColor: colors.cardBorder },
            index === withdrawals.length - 1 && styles.lastItem,
          ]}
        >
          <View style={[styles.withdrawalIcon, { backgroundColor: colors.primaryLight }]}>
            <Feather name="arrow-up-right" size={16} color={colors.primary} />
          </View>
          <View style={styles.withdrawalContent}>
            <Text style={[styles.withdrawalTitle, { color: colors.text }]}>Withdrawal</Text>
            <Text style={[styles.withdrawalMeta, { color: colors.textMuted }]}>
              {formatCurrencyAmount(item.amount, item.currency)}
            </Text>
          </View>
          <View style={styles.withdrawalRight}>
            <Text style={[styles.withdrawalStatus, { color: statusColor }]}>{statusLabel}</Text>
            <Text style={[styles.withdrawalDate, { color: colors.textMuted }]}>
              {formatDateTime(item.createdAt)}
            </Text>
          </View>
        </View>
      );
    },
    [colors, withdrawals.length]
  );

  const WalletListEmpty = useMemo(() => {
    if (listMode === 'transactions' && transactionsError) {
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
    if (listMode === 'withdrawals' && withdrawalsError) {
      return (
        <ErrorView
          error={withdrawalsError}
          onRetry={() => {
            lastRequestedWithdrawalsPageRef.current = -1;
            fetchWithdrawals({ page: 0, size: 20, refresh: true });
          }}
          compact
          showIcon={false}
          title="Withdrawals unavailable"
          hideRetry
        />
      );
    }
    return (
      <EmptyState
        icon="inbox"
        title={listMode === 'transactions' ? 'No transactions yet' : 'No withdrawals yet'}
        subtitle={
          listMode === 'transactions'
            ? walletFilter === 'all'
              ? 'Your transactions will appear here'
              : `No ${walletFilter} transactions found`
            : 'Your withdrawals will appear here'
        }
      />
    );
  }, [walletFilter, transactionsError, withdrawalsError, handleRetryAll, listMode, fetchWithdrawals]);

  const TransactionsSkeleton = useMemo(() => (
    <View style={styles.transactionsSkeleton}>
      {[0, 1, 2, 3].map((key) => (
        <TransactionItemSkeleton key={`transaction-skeleton-${key}`} />
      ))}
    </View>
  ), []);

  const handleTransactionsEndReached = useCallback(() => {
    const nextPage = transactionsPage + 1;
    if (transactionsLoading || !transactionsHasMore || filteredTransactions.length === 0) return;
    if (lastRequestedTransactionsPageRef.current === nextPage) return;
    lastRequestedTransactionsPageRef.current = nextPage;
    fetchTransactions({ page: nextPage, size: 20 });
  }, [transactionsPage, transactionsLoading, transactionsHasMore, filteredTransactions.length, fetchTransactions]);

  const handleWithdrawalsEndReached = useCallback(() => {
    const nextPage = withdrawalsPage + 1;
    if (withdrawalsLoading || !withdrawalsHasMore || withdrawals.length === 0) return;
    if (lastRequestedWithdrawalsPageRef.current === nextPage) return;
    lastRequestedWithdrawalsPageRef.current = nextPage;
    fetchWithdrawals({ page: nextPage, size: 20 });
  }, [withdrawalsPage, withdrawalsLoading, withdrawalsHasMore, withdrawals.length, fetchWithdrawals]);

  const renderWalletContent = () => {
    const data = listMode === 'transactions' ? filteredTransactions : withdrawals;
    const renderItem = listMode === 'transactions' ? renderTransaction : renderWithdrawal;
    const keyExtractor = listMode === 'transactions' ? transactionKeyExtractor : withdrawalKeyExtractor;
    const onEndReached = listMode === 'transactions' ? handleTransactionsEndReached : handleWithdrawalsEndReached;
    const showSkeleton = listMode === 'transactions' ? showTransactionsSkeleton : showWithdrawalsSkeleton;
    return (
      <FlatList
        data={data}
        renderItem={renderItem as any}
        keyExtractor={keyExtractor as any}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 200 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={WalletListHeader}
        ListEmptyComponent={showSkeleton ? TransactionsSkeleton : WalletListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
      />
    );
  };

  const handleDownloadInvoice = useCallback(async (invoiceId: string) => {
    try {
      const blob = await invoiceService.downloadInvoicePdf(invoiceId);
      // In React Native, we'd use a file system library to save/share the PDF
      // For now, just log success
      console.log('[Wallet] Invoice PDF downloaded:', invoiceId);
    } catch (err) {
      console.error('[Wallet] Failed to download invoice:', err);
    }
  }, []);

  const handleViewInvoice = useCallback((invoiceId: string) => {
    // Navigate to invoice detail view
    router.push(`/invoice/${invoiceId}`);
  }, [router]);

  const renderInvoicesContent = () => {
    if (invoicesLoading && invoices.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading invoices...</Text>
        </View>
      );
    }

    if (invoicesError && invoices.length === 0) {
      return (
        <ErrorView
          title="Failed to load invoices"
          message={invoicesError}
          onRetry={fetchInvoices}
        />
      );
    }

    if (invoices.length === 0) {
      return (
        <View style={styles.comingSoonContainer}>
          <View style={[styles.comingSoonIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
            <Feather name="file-text" size={48} color={colors.textMuted} />
          </View>
          <Text style={[styles.comingSoonTitle, { color: colors.text }]}>No Invoices Yet</Text>
          <Text style={[styles.comingSoonSubtitle, { color: colors.textMuted }]}>
            Invoices for your completed campaigns will appear here
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={invoicesLoading}
            onRefresh={fetchInvoices}
            tintColor={colors.primary}
          />
        }
      >
        {/* Invoice Stats */}
        <View style={styles.invoiceStatsRow}>
          <View style={[styles.invoiceStatCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.invoiceStatValue, { color: colors.emerald }]}>{invoiceCounts.paid}</Text>
            <Text style={[styles.invoiceStatLabel, { color: colors.textMuted }]}>Paid</Text>
          </View>
          <View style={[styles.invoiceStatCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.invoiceStatValue, { color: colors.amber }]}>{invoiceCounts.pending}</Text>
            <Text style={[styles.invoiceStatLabel, { color: colors.textMuted }]}>Pending</Text>
          </View>
          <View style={[styles.invoiceStatCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.invoiceStatValue, { color: '#EF4444' }]}>{invoiceCounts.overdue}</Text>
            <Text style={[styles.invoiceStatLabel, { color: colors.textMuted }]}>Overdue</Text>
          </View>
        </View>

        {/* Invoice Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
          style={styles.filterScroll}
        >
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

        {/* Invoice List */}
        <View style={styles.invoicesList}>
          {filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              colors={colorsWithDark}
              onDownload={() => handleDownloadInvoice(invoice.id)}
              onView={() => handleViewInvoice(invoice.id)}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]} edges={['top']}>
      <View style={[styles.walletHeader, { backgroundColor: backgroundColor }]}>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.walletTitle, { color: colors.text }]}>Wallet</Text>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => { }} activeOpacity={0.7}>
          <Feather name="settings" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {renderWalletContent()}

      <View style={[styles.withdrawFooter, { bottom: 84 + insets.bottom, paddingBottom: spacing.lg + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.withdrawButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={() => router.push('/withdraw')}
        >
          <Feather name="credit-card" size={18} color="#ffffff" />
          <Text style={styles.withdrawButtonText}>
            Withdraw Funds
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  balanceSection: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceLabelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  balanceIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceValueLarge: {
    fontSize: 36,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  walletStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  walletStatCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValueText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabelText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  chartSection: {
    marginTop: spacing.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  chartCaption: {
    fontSize: 11,
    fontWeight: '500',
  },
  chartCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: spacing.md,
    height: 160,
    overflow: 'hidden',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: '100%',
  },
  chartBar: {
    flex: 1,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipNew: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    shadowColor: '#1337ec',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  filterChipTextNew: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBlock: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.lg,
  },
  withdrawalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  withdrawalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  withdrawalContent: {
    flex: 1,
  },
  withdrawalTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  withdrawalMeta: {
    fontSize: 12,
  },
  withdrawalRight: {
    alignItems: 'flex-end',
  },
  withdrawalStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  withdrawalDate: {
    fontSize: 11,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  withdrawFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 20,
    elevation: 12,
  },
  withdrawButton: {
    height: 54,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  withdrawButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 3,
  },
  comingSoonIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  comingSoonSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    fontSize: 14,
    marginTop: spacing.md,
  },
  invoiceStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  filterScroll: {
    marginBottom: spacing.lg,
  },
  filterScrollContent: {
    paddingRight: spacing.lg,
  },
});
