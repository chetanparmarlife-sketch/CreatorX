import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { spacing, typography } from '@/src/theme';
import { TransactionDTO } from '@/src/api/services/walletService';
import { useTheme } from '@/src/hooks';
import {
  formatCurrencyAmount,
  formatShortDate,
  getTransactionTypeLabel,
  getTransactionStatusLabel,
} from '@/src/utils/walletFormatting';

interface TransactionItemProps {
  transaction: TransactionDTO;
  isLast?: boolean;
}

export function TransactionItem({ transaction, isLast = false }: TransactionItemProps) {
  const { colors } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/transaction-detail',
      params: {
        id: transaction.id,
      },
    });
  };

  const isPending = transaction.status === 'PENDING';

  const getIcon = () => {
    if (isPending) {
      return (
        <View style={[styles.iconContainer, { backgroundColor: colors.amberLight }]}>
          <Feather name="clock" size={16} color={colors.amber} />
        </View>
      );
    }

    switch (transaction.type) {
      case 'CREDIT':
        return (
          <View style={[styles.iconContainer, { backgroundColor: colors.emeraldLight }]}>
            <Feather name="arrow-down-left" size={16} color={colors.emerald} />
          </View>
        );
      case 'DEBIT':
        return (
          <View style={[styles.iconContainer, { backgroundColor: colors.redLight }]}>
            <Feather name="arrow-up-right" size={16} color={colors.red} />
          </View>
        );
      default:
        return (
          <View style={[styles.iconContainer, { backgroundColor: colors.amberLight }]}>
            <Feather name="clock" size={16} color={colors.amber} />
          </View>
        );
    }
  };

  const getAmountColor = () => {
    if (isPending) return colors.amber;
    switch (transaction.type) {
      case 'CREDIT':
        return colors.emerald;
      case 'DEBIT':
        return colors.text;
      default:
        return colors.amber;
    }
  };

  const getAmountPrefix = () => {
    switch (transaction.type) {
      case 'CREDIT':
        return '+';
      case 'DEBIT':
        return '-';
      default:
        return '';
    }
  };

  const title = getTransactionTypeLabel(transaction.type);
  const description = transaction.description || getTransactionStatusLabel(transaction.status);
  const formattedAmount = formatCurrencyAmount(transaction.amount, transaction.currency);
  const formattedDate = formatShortDate(transaction.createdAt);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.container,
        { borderBottomColor: colors.cardBorder },
        isLast && styles.lastItem,
      ]}
      data-testid={`transaction-item-${transaction.id}`}
    >
      {getIcon()}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: getAmountColor() }]}>
          {getAmountPrefix()}{formattedAmount}
        </Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>{formattedDate}</Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.textMuted} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
    marginBottom: 2,
  },
  description: {
    ...typography.small,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.bodyMedium,
    marginBottom: 2,
  },
  date: {
    ...typography.xs,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});
