/**
 * Skeleton loader component for loading states
 */

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/src/hooks';

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  style?: any;
  borderRadius?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  style,
  borderRadius = 4,
}) => {
  const { colors, isDark } = useTheme();
  const [opacity] = React.useState(new Animated.Value(0.3));

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
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
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? colors.cardElevated : colors.cardBorder,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const CampaignCardSkeleton: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <SkeletonLoader width="100%" height={120} borderRadius={8} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="60%" height={16} style={styles.marginBottom} />
        <SkeletonLoader width="40%" height={14} style={styles.marginBottom} />
        <SkeletonLoader width="80%" height={12} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  cardContent: {
    marginTop: 12,
  },
  marginBottom: {
    marginBottom: 8,
  },
});


