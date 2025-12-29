import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius, spacing, typography } from '@/src/theme';
import { useTheme } from '@/src/hooks';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  iconBgColor?: string;
}

export function StatCard({ icon, value, label, iconBgColor }: StatCardProps) {
  const { colors, isDark } = useTheme();
  const bgColor = iconBgColor || colors.primaryLight;

  const gradientColors = isDark
    ? ['#1a1a1a', '#141414'] as const
    : ['#ffffff', '#f8f8f8'] as const;

  return (
    <View style={[styles.container, { borderColor: colors.cardBorder }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          {icon}
        </View>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden' as const,
  },
  gradient: {
    padding: spacing.lg,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.md,
  },
  value: {
    ...typography.h4,
    marginBottom: 2,
  },
  label: {
    ...typography.xs,
  },
};
