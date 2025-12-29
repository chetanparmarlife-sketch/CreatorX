import { memo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '@/src/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton = memo(function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.md,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: typeof width === 'number' ? width : width,
          height,
          borderRadius: radius,
          backgroundColor: colors.card,
          opacity,
        },
        style,
      ]}
    />
  );
});

export const CampaignCardSkeleton = memo(function CampaignCardSkeleton() {
  return (
    <View style={styles.campaignCard}>
      <View style={styles.campaignHeader}>
        <View style={styles.campaignHeaderLeft}>
          <Skeleton width="80%" height={18} style={{ marginBottom: spacing.sm }} />
          <Skeleton width="50%" height={14} />
        </View>
        <Skeleton width={70} height={22} borderRadius={borderRadius.full} />
      </View>
      <View style={styles.campaignDetails}>
        <Skeleton width={80} height={14} />
        <Skeleton width={70} height={14} />
        <Skeleton width={90} height={14} />
      </View>
      <Skeleton width="100%" height={36} style={{ marginTop: spacing.lg }} />
    </View>
  );
});

export const TransactionItemSkeleton = memo(function TransactionItemSkeleton() {
  return (
    <View style={styles.transactionItem}>
      <Skeleton width={40} height={40} borderRadius={12} />
      <View style={styles.transactionContent}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 4 }} />
        <Skeleton width="40%" height={12} />
      </View>
      <View style={styles.transactionRight}>
        <Skeleton width={60} height={16} style={{ marginBottom: 4 }} />
        <Skeleton width={40} height={12} />
      </View>
    </View>
  );
});

export const ChatItemSkeleton = memo(function ChatItemSkeleton() {
  return (
    <View style={styles.chatItem}>
      <Skeleton width={52} height={52} borderRadius={26} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Skeleton width="50%" height={16} />
          <Skeleton width={40} height={12} />
        </View>
        <Skeleton width="70%" height={14} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
});

export const StatCardSkeleton = memo(function StatCardSkeleton() {
  return (
    <View style={styles.statCard}>
      <Skeleton width={32} height={32} borderRadius={8} style={{ marginBottom: spacing.sm }} />
      <Skeleton width="60%" height={20} style={{ marginBottom: 4 }} />
      <Skeleton width="40%" height={12} />
    </View>
  );
});

const styles = StyleSheet.create({
  campaignCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  campaignHeaderLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  campaignDetails: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  transactionContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  chatContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
  },
});
