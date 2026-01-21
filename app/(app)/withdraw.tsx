import { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks';
import { useApp } from '@/src/context';
import { useAuth } from '@/src/context/AuthContext';
import { walletService } from '@/src/api/services';
import { BankAccount } from '@/src/api/types';
import { spacing, borderRadius } from '@/src/theme';
import { formatCurrencyAmount } from '@/src/utils/walletFormatting';
import { featureFlags } from '@/src/config/featureFlags';

const withdrawalMethods = [
  {
    id: 'bank',
    title: 'Bank Account',
    subtitle: '2-3 Business Days • Free',
    icon: 'credit-card' as const,
    badge: 'LAST USED',
  },
  {
    id: 'instant',
    title: 'Instant Transfer',
    subtitle: 'Instant • 1.5% Fee',
    icon: 'zap' as const,
    badge: 'NEW',
  },
  {
    id: 'paypal',
    title: 'PayPal',
    subtitle: 'Instant • 1% Fee',
    icon: 'dollar-sign' as const,
  },
  {
    id: 'payoneer',
    title: 'Payoneer',
    subtitle: '1-2 Business Days • Free',
    icon: 'globe' as const,
  },
];

export default function WithdrawScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { wallet, user } = useApp();
  const { isAuthenticated } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);
  const [bankAccountsLoaded, setBankAccountsLoaded] = useState(false);
  const alertShownRef = useRef(false);

  // Controlled by feature flag - disabled until Phase 4
  const withdrawalsEnabled = featureFlags.isEnabled('USE_WITHDRAWALS_UI');

  const walletSummary = useMemo(
    () =>
      wallet ?? {
        availableBalance: 0,
        currency: 'INR',
      },
    [wallet]
  );

  const hasVerifiedBankAccount = useMemo(
    () => bankAccounts.some((account) => account.verified),
    [bankAccounts]
  );
  const isKycApproved = Boolean(user?.kycVerified);
  const canSubmit = withdrawalsEnabled && isKycApproved && hasVerifiedBankAccount;

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    const loadBankAccounts = async () => {
      setBankAccountsLoading(true);
      try {
        const accounts = await walletService.getBankAccounts();
        if (isMounted) {
          setBankAccounts(accounts);
        }
      } catch (error) {
        console.warn('[Withdraw] Failed to load bank accounts', error);
      } finally {
        if (isMounted) {
          setBankAccountsLoading(false);
          setBankAccountsLoaded(true);
        }
      }
    };

    loadBankAccounts();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!withdrawalsEnabled || !isAuthenticated || bankAccountsLoading || !bankAccountsLoaded) return;
    if (alertShownRef.current) return;

    if (!isKycApproved || !hasVerifiedBankAccount) {
      alertShownRef.current = true;
      const message = !isKycApproved && !hasVerifiedBankAccount
        ? 'Complete KYC and add a verified bank account to withdraw.'
        : !isKycApproved
          ? 'Complete KYC verification to enable withdrawals.'
          : 'Add a verified bank account to enable withdrawals.';
      Alert.alert('Withdrawals unavailable', message);
    }
  }, [
    withdrawalsEnabled,
    isAuthenticated,
    bankAccountsLoading,
    bankAccountsLoaded,
    isKycApproved,
    hasVerifiedBankAccount,
  ]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#050505' }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={styles.balanceValue}>
            {formatCurrencyAmount(walletSummary.availableBalance, walletSummary.currency)}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Withdrawal Method</Text>
          <Text style={styles.sectionSubtitle}>Choose where you want to send your funds.</Text>
        </View>

        <View style={styles.methodList}>
          {withdrawalMethods.map((method) => {
            const isSelected = method.id === selectedMethod;
            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  isSelected && styles.methodCardSelected,
                ]}
                activeOpacity={0.85}
                onPress={() => setSelectedMethod(method.id)}
              >
                {method.badge && (
                  <View style={[
                    styles.methodBadge,
                    method.badge === 'NEW' ? styles.methodBadgeNew : styles.methodBadgeLast,
                  ]}>
                    <Text style={styles.methodBadgeText}>{method.badge}</Text>
                  </View>
                )}
                <View style={styles.methodIcon}>
                  <Feather name={method.icon} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodTitle}>{method.title}</Text>
                  <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
                </View>
                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.addMethod} activeOpacity={0.8}>
          <View style={styles.addIcon}>
            <Feather name="plus" size={16} color="#9ca3af" />
          </View>
          <Text style={styles.addText}>Add Payment Method</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: canSubmit ? colors.primary : '#1f2430' },
          ]}
          activeOpacity={0.85}
          disabled={!canSubmit}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        {!withdrawalsEnabled && (
          <Text style={styles.disabledNote}>Withdrawals coming soon.</Text>
        )}
        <View style={styles.secureRow}>
          <Feather name="lock" size={12} color="#9ca3af" />
          <Text style={styles.secureText}>Secure 256-bit SSL Encrypted</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 200,
  },
  balanceBlock: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  balanceLabel: {
    color: '#9ca3af',
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: '600',
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 6,
  },
  methodList: {
    gap: spacing.md,
  },
  methodCard: {
    backgroundColor: '#151515',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  methodCardSelected: {
    borderColor: '#1337ec',
  },
  methodBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  methodBadgeLast: {
    backgroundColor: '#1d4ed8',
  },
  methodBadgeNew: {
    backgroundColor: '#16a34a',
  },
  methodBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  methodSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#1337ec',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1337ec',
  },
  addMethod: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#374151',
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  addIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  addText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(5, 5, 5, 0.95)',
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secureRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  secureText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
  disabledNote: {
    color: '#6b7280',
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
