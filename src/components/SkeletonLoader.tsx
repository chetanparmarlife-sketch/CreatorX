/**
 * Skeleton loader component for loading states
 */

import React from 'react';
import { StyleSheet, Animated } from 'react-native';
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

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
  },
});


