import { memo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  balance: number;
  onWithdraw: (amount: number, method: string) => void;
}

const quickAmounts = [1000, 5000, 10000, 20000];
const paymentMethods = [
  { id: 'bank', name: 'Bank Transfer', icon: 'credit-card', subtitle: 'HDFC Bank ****1234' },
  { id: 'upi', name: 'UPI', icon: 'smartphone', subtitle: 'rahul@upi' },
];

export const WithdrawModal = memo(function WithdrawModal({
  visible,
  onClose,
  balance,
  onWithdraw,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [isProcessing, setIsProcessing] = useState(false);

  const numericAmount = parseInt(amount.replace(/,/g, ''), 10) || 0;
  const isValidAmount = numericAmount >= 100 && numericAmount <= balance;

  const formatAmount = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleAmountChange = (value: string) => {
    setAmount(formatAmount(value));
  };

  const handleQuickAmount = (value: number) => {
    setAmount(formatAmount(value.toString()));
  };

  const handleWithdraw = async () => {
    if (!isValidAmount) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onWithdraw(numericAmount, selectedMethod);
    setIsProcessing(false);
    setAmount('');
    onClose();
  };

  const handleClose = () => {
    setAmount('');
    setIsProcessing(false);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={handleClose} title="Withdraw Funds">
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>₹{balance.toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Enter Amount</Text>
        <View style={styles.amountInput}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={handleAmountChange}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>
        {amount && !isValidAmount && (
          <Text style={styles.errorText}>
            {numericAmount < 100 ? 'Minimum ₹100' : 'Exceeds balance'}
          </Text>
        )}
      </View>

      <View style={styles.quickAmounts}>
        {quickAmounts.map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.quickAmountBtn,
              numericAmount === value && styles.quickAmountBtnActive,
            ]}
            onPress={() => handleQuickAmount(value)}
            disabled={value > balance}
          >
            <Text
              style={[
                styles.quickAmountText,
                numericAmount === value && styles.quickAmountTextActive,
                value > balance && styles.quickAmountDisabled,
              ]}
            >
              ₹{value.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Payment Method</Text>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.methodCardActive,
            ]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <View style={styles.methodIcon}>
              <Feather
                name={method.icon as any}
                size={18}
                color={selectedMethod === method.id ? colors.primary : colors.textSecondary}
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
            </View>
            <View
              style={[
                styles.radio,
                selectedMethod === method.id && styles.radioActive,
              ]}
            >
              {selectedMethod === method.id && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>₹{numericAmount.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Processing Fee</Text>
          <Text style={[styles.summaryValue, { color: colors.emerald }]}>Free</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.totalLabel}>You'll Receive</Text>
          <Text style={styles.totalValue}>₹{numericAmount.toLocaleString()}</Text>
        </View>
      </View>

      <Button
        title={isProcessing ? 'Processing...' : 'Withdraw Now'}
        onPress={handleWithdraw}
        variant="primary"
        size="lg"
        fullWidth
        disabled={!isValidAmount || isProcessing}
        icon={<Feather name="arrow-up-right" size={18} color={colors.text} />}
      />
    </Modal>
  );
});

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  balanceLabel: {
    ...typography.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  errorText: {
    ...typography.xs,
    color: colors.red,
    marginTop: spacing.sm,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  quickAmountBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  quickAmountText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  quickAmountTextActive: {
    color: colors.primary,
    fontWeight: '500',
  },
  quickAmountDisabled: {
    color: colors.textMuted,
    opacity: 0.5,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  methodCardActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  methodSubtitle: {
    ...typography.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  summary: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.small,
    color: colors.text,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  totalLabel: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.emerald,
  },
});
