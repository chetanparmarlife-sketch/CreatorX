import { View, Text } from 'react-native';
import { borderRadius, spacing } from '@/src/theme';
import { useTheme } from '@/src/hooks';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export function Badge({ label, variant = 'default', size = 'sm', icon }: BadgeProps) {
  const { colors, isDark } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.emeraldLight, text: colors.emerald, border: colors.emeraldBorder };
      case 'warning':
        return { bg: colors.amberLight, text: colors.amber, border: colors.amberBorder };
      case 'error':
        return { bg: colors.redLight, text: colors.red, border: 'rgba(239, 68, 68, 0.3)' };
      case 'primary':
        return { bg: colors.primaryLight, text: colors.primary, border: colors.primaryBorder };
      default:
        return { 
          bg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)', 
          text: colors.textSecondary, 
          border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' 
        };
    }
  };

  const badgeColors = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColors.bg,
          borderColor: badgeColors.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? spacing.sm : spacing.md,
        },
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, { color: badgeColors.text, fontSize: isSm ? 9 : 11 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = {
  badge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '500' as const,
  },
};
