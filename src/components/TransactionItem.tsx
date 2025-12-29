import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { spacing, typography } from '@/src/theme';
import { Transaction } from '@/src/types';
import { useTheme } from '@/src/hooks';

interface TransactionItemProps {
  transaction: Transaction;
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
        type: transaction.type,
        title: transaction.title,
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        status: transaction.status,
      },
    });
  };

  const getIcon = () => {
    switch (transaction.type) {
      case 'credit':
        return (
          <View style={[styles.iconContainer, { backgroundColor: colors.emeraldLight }]}>
            <Feather name="arrow-down-left" size={16} color={colors.emerald} />
          </View>
        );
      case 'debit':
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
    switch (transaction.type) {
      case 'credit':
        return colors.emerald;
      case 'debit':
        return colors.text;
      default:
        return colors.amber;
    }
  };

  const getAmountPrefix = () => {
    switch (transaction.type) {
      case 'credit':
        return '+';
      case 'debit':
        return '-';
      default:
        return '';
    }
  };

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
        <Text style={[styles.title, { color: colors.text }]}>{transaction.title}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{transaction.description}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: getAmountColor() }]}>
          {getAmountPrefix()}{transaction.amount}
        </Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>{transaction.date}</Text>
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
