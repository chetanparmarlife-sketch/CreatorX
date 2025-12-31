import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/src/theme';
import { useTheme } from '@/src/hooks';

interface TransactionData {
  id: string;
  type: 'credit' | 'debit' | 'pending';
  title: string;
  description: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();

  const transaction: TransactionData = {
    id: params.id as string || '1',
    type: (params.type as 'credit' | 'debit' | 'pending') || 'credit',
    title: params.title as string || 'Transaction',
    description: params.description as string || '',
    amount: params.amount as string || '₹0',
    date: params.date as string || '',
    status: (params.status as 'completed' | 'pending' | 'failed') || 'completed',
  };

  const getStatusConfig = () => {
    switch (transaction.status) {
      case 'completed':
        return {
          icon: 'check-circle' as const,
          label: 'Completed',
          color: colors.emerald,
          bgColor: colors.emeraldLight,
          borderColor: colors.emeraldBorder,
        };
      case 'pending':
        return {
          icon: 'clock' as const,
          label: 'Pending',
          color: colors.amber,
          bgColor: colors.amberLight,
          borderColor: colors.amberBorder,
        };
      case 'failed':
        return {
          icon: 'x-circle' as const,
          label: 'Failed',
          color: colors.red,
          bgColor: colors.redLight,
          borderColor: 'rgba(239, 68, 68, 0.3)',
        };
    }
  };

  const getTypeConfig = () => {
    switch (transaction.type) {
      case 'credit':
        return {
          icon: 'arrow-down-left' as const,
          label: 'Income',
          color: colors.emerald,
          bgColor: colors.emeraldLight,
          prefix: '+',
        };
      case 'debit':
        return {
          icon: 'arrow-up-right' as const,
          label: 'Withdrawal',
          color: colors.red,
          bgColor: colors.redLight,
          prefix: '-',
        };
      case 'pending':
        return {
          icon: 'clock' as const,
          label: 'Pending Payment',
          color: colors.amber,
          bgColor: colors.amberLight,
          prefix: '',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const typeConfig = getTypeConfig();

  const referenceId = `TXN${transaction.id.padStart(8, '0')}`;

  const InfoRow = ({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor || colors.text }]}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card }]}
          data-testid="button-back"
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction Details</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.typeIconContainer, { backgroundColor: typeConfig.bgColor }]}>
            <Feather name={typeConfig.icon} size={28} color={typeConfig.color} />
          </View>

          <Text style={[styles.transactionTitle, { color: colors.text }]}>{transaction.title}</Text>
          <Text style={[styles.transactionDescription, { color: colors.textSecondary }]}>
            {transaction.description}
          </Text>

          <Text style={[styles.amount, { color: typeConfig.color }]}>
            {typeConfig.prefix}{transaction.amount}
          </Text>

          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor, borderColor: statusConfig.borderColor }]}>
            <Feather name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction Information</Text>
          
          <InfoRow label="Transaction ID" value={referenceId} />
          <InfoRow label="Type" value={typeConfig.label} valueColor={typeConfig.color} />
          <InfoRow label="Date" value={transaction.date} />
          <InfoRow label="Status" value={statusConfig.label} valueColor={statusConfig.color} />
          
          {transaction.type === 'debit' && (
            <InfoRow 
              label="Transfer Method" 
              value={transaction.description.includes('UPI') ? 'UPI Transfer' : 'Bank Transfer'} 
            />
          )}
          
          {transaction.type === 'credit' && (
            <InfoRow label="Source" value="Campaign Payment" />
          )}
        </View>

        {transaction.status === 'pending' && (
          <View style={[styles.noteCard, { backgroundColor: colors.amberLight, borderColor: colors.amberBorder }]}>
            <Feather name="info" size={18} color={colors.amber} />
            <View style={styles.noteContent}>
              <Text style={[styles.noteTitle, { color: colors.amber }]}>Payment Processing</Text>
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                This payment is currently under review. It will be credited to your wallet once approved.
              </Text>
            </View>
          </View>
        )}

        {transaction.status === 'completed' && transaction.type === 'debit' && (
          <View style={[styles.noteCard, { backgroundColor: colors.emeraldLight, borderColor: colors.emeraldBorder }]}>
            <Feather name="check-circle" size={18} color={colors.emerald} />
            <View style={styles.noteContent}>
              <Text style={[styles.noteTitle, { color: colors.emerald }]}>Transfer Complete</Text>
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                The funds have been successfully transferred to your account.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.supportButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          data-testid="button-support"
        >
          <Feather name="help-circle" size={20} color={colors.primary} />
          <Text style={[styles.supportButtonText, { color: colors.primary }]}>Need help with this transaction?</Text>
          <Feather name="chevron-right" size={18} color={colors.primary} />
        </TouchableOpacity>
      </ScrollView>
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  mainCard: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  typeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  transactionTitle: {
    ...typography.h4,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  transactionDescription: {
    ...typography.small,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.small,
    fontWeight: '600',
  },
  detailsCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  infoLabel: {
    ...typography.small,
  },
  infoValue: {
    ...typography.small,
    fontWeight: '600',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    ...typography.small,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  noteText: {
    ...typography.small,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  supportButtonText: {
    ...typography.small,
    fontWeight: '500',
    flex: 1,
  },
});
