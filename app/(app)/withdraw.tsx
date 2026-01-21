import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
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

const MIN_WITHDRAWAL = 100;
const MAX_WITHDRAWAL = 100000;

export default function WithdrawScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { wallet, refreshWalletAll } = useApp();
  const { isAuthenticated } = useAuth();
  const { user } = useApp();

  // State
  const [amount, setAmount] = useState('');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankAccountsLoading, setBankAccountsLoading] = useState(false);
  const [bankAccountsLoaded, setBankAccountsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const alertShownRef = useRef(false);

  // Feature flag check
  const withdrawalsEnabled = featureFlags.isEnabled('USE_WITHDRAWALS_UI');

  const walletSummary = useMemo(
    () =>
      wallet ?? {
        availableBalance: 0,
        currency: 'INR',
      },
    [wallet]
  );

  const verifiedBankAccounts = useMemo(
    () => bankAccounts.filter((account) => account.verified),
    [bankAccounts]
  );

  const hasVerifiedBankAccount = verifiedBankAccounts.length > 0;
  const isKycApproved = Boolean(user?.kycVerified);

  // Validation
  const amountNum = parseFloat(amount) || 0;
  const isAmountValid = amountNum >= MIN_WITHDRAWAL && amountNum <= MAX_WITHDRAWAL && amountNum <= walletSummary.availableBalance;
  const canSubmit = withdrawalsEnabled && isKycApproved && hasVerifiedBankAccount && isAmountValid && selectedBankAccountId && !isSubmitting;

  // Load bank accounts on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    const loadBankAccounts = async () => {
      setBankAccountsLoading(true);
      try {
        const accounts = await walletService.getBankAccounts();
        if (isMounted) {
          setBankAccounts(accounts);
          // Auto-select first verified account
          const firstVerified = accounts.find(a => a.verified);
          if (firstVerified) {
            setSelectedBankAccountId(firstVerified.id);
          }
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

  // Show eligibility alert
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

  // Quick amount buttons
  const quickAmounts = useMemo(() => {
    const available = walletSummary.availableBalance;
    return [
      { label: '₹500', value: 500 },
      { label: '₹1,000', value: 1000 },
      { label: '₹5,000', value: 5000 },
      { label: 'Max', value: Math.min(available, MAX_WITHDRAWAL) },
    ].filter(q => q.value <= available && q.value >= MIN_WITHDRAWAL);
  }, [walletSummary.availableBalance]);

  // Handle withdrawal submission
  const handleWithdraw = useCallback(async () => {
    if (!canSubmit || !selectedBankAccountId) return;

    setIsSubmitting(true);
    try {
      await walletService.withdrawFunds({
        amount: amountNum,
        bankAccountId: selectedBankAccountId,
      });

      Alert.alert(
        'Withdrawal Requested',
        `Your withdrawal of ₹${amountNum.toLocaleString()} has been submitted. It will be processed within 2-3 business days.`,
        [
          {
            text: 'OK',
            onPress: () => {
              refreshWalletAll();
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[Withdraw] Failed:', error);
      let errorMessage = 'Failed to process withdrawal. Please try again.';

      if (error.status === 400) {
        errorMessage = error.message || 'Invalid withdrawal request.';
      } else if (error.status === 403) {
        errorMessage = 'You are not eligible for withdrawals. Please complete KYC.';
      } else if (error.status === 422) {
        errorMessage = 'Insufficient balance or invalid amount.';
      }

      Alert.alert('Withdrawal Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, selectedBankAccountId, amountNum, refreshWalletAll, router]);

  const getValidationMessage = () => {
    if (!withdrawalsEnabled) return 'Withdrawals are currently disabled.';
    if (!isKycApproved) return 'Complete KYC verification to withdraw.';
    if (!hasVerifiedBankAccount) return 'Add a verified bank account.';
    if (!amount) return 'Enter an amount.';
    if (amountNum < MIN_WITHDRAWAL) return `Minimum withdrawal: ₹${MIN_WITHDRAWAL}`;
    if (amountNum > walletSummary.availableBalance) return 'Insufficient balance.';
    if (amountNum > MAX_WITHDRAWAL) return `Maximum withdrawal: ₹${MAX_WITHDRAWAL.toLocaleString()}`;
    if (!selectedBankAccountId) return 'Select a bank account.';
    return null;
  };

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
        {/* Available Balance */}
        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          <Text style={styles.balanceValue}>
            {formatCurrencyAmount(walletSummary.availableBalance, walletSummary.currency)}
          </Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="#4b5563"
              keyboardType="numeric"
              maxLength={7}
            />
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            {quickAmounts.map((q) => (
              <TouchableOpacity
                key={q.label}
                style={[
                  styles.quickAmountBtn,
                  amountNum === q.value && styles.quickAmountBtnActive,
                ]}
                onPress={() => setAmount(q.value.toString())}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    amountNum === q.value && styles.quickAmountTextActive,
                  ]}
                >
                  {q.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bank Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdraw To</Text>
          {bankAccountsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Loading bank accounts...</Text>
            </View>
          ) : verifiedBankAccounts.length === 0 ? (
            <TouchableOpacity
              style={styles.addBankCard}
              onPress={() => router.push('/add-bank-account')}
            >
              <View style={styles.addBankIcon}>
                <Feather name="plus" size={20} color="#9ca3af" />
              </View>
              <Text style={styles.addBankText}>Add Bank Account</Text>
              <Feather name="chevron-right" size={18} color="#4b5563" />
            </TouchableOpacity>
          ) : (
            <View style={styles.bankList}>
              {verifiedBankAccounts.map((account) => {
                const isSelected = account.id === selectedBankAccountId;
                return (
                  <TouchableOpacity
                    key={account.id}
                    style={[styles.bankCard, isSelected && styles.bankCardSelected]}
                    onPress={() => setSelectedBankAccountId(account.id)}
                  >
                    <View style={styles.bankIcon}>
                      <Feather name="credit-card" size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.bankInfo}>
                      <Text style={styles.bankName}>{account.bankName}</Text>
                      <Text style={styles.bankNumber}>
                        ••••{account.accountNumber.slice(-4)}
                      </Text>
                    </View>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Fee Info */}
        <View style={styles.feeCard}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Transfer Fee</Text>
            <Text style={styles.feeValue}>Free</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Processing Time</Text>
            <Text style={styles.feeValue}>2-3 Business Days</Text>
          </View>
          <View style={[styles.feeRow, styles.feeRowLast]}>
            <Text style={styles.feeLabel}>You'll receive</Text>
            <Text style={styles.feeValueHighlight}>
              {amountNum > 0 ? `₹${amountNum.toLocaleString()}` : '—'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {getValidationMessage() && (
          <Text style={styles.validationMessage}>{getValidationMessage()}</Text>
        )}
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: canSubmit ? colors.primary : '#1f2430' },
          ]}
          activeOpacity={0.85}
          disabled={!canSubmit}
          onPress={handleWithdraw}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueText}>Withdraw</Text>
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
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
    fontSize: 36,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151515',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  currencySymbol: {
    color: '#9ca3af',
    fontSize: 32,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    padding: 0,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
  },
  quickAmountBtnActive: {
    backgroundColor: '#1337ec',
  },
  quickAmountText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  quickAmountTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  bankList: {
    gap: spacing.md,
  },
  bankCard: {
    backgroundColor: '#151515',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bankCardSelected: {
    borderColor: '#1337ec',
  },
  bankIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bankNumber: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 2,
  },
  addBankCard: {
    backgroundColor: '#151515',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#1f2937',
    borderStyle: 'dashed',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  addBankIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBankText: {
    flex: 1,
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '600',
  },
  feeCard: {
    backgroundColor: '#151515',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: spacing.lg,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  feeRowLast: {
    marginBottom: 0,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  feeLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  feeValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  feeValueHighlight: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: 'rgba(5, 5, 5, 0.98)',
  },
  validationMessage: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.sm,
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
});
