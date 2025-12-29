import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing } from '@/src/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: string[];
  borderColor?: string;
}

export function GlassCard({ children, style, gradient, borderColor }: GlassCardProps) {
  const gradientColors = gradient || [colors.card, colors.card];
  
  return (
    <View style={[styles.container, { borderColor: borderColor || colors.cardBorder }, style]}>
      <LinearGradient
        colors={gradientColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.lg,
  },
});
