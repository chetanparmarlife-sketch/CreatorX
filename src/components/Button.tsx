import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius, spacing, typography } from '@/src/theme';
import { useTheme } from '@/src/hooks';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  style,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const getHeight = () => {
    switch (size) {
      case 'sm': return 36;
      case 'lg': return 52;
      default: return 44;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 13;
      case 'lg': return 16;
      default: return 14;
    }
  };

  const buttonStyle: ViewStyle = {
    height: getHeight(),
    paddingHorizontal: size === 'sm' ? spacing.md : spacing.lg,
    borderRadius: borderRadius.lg,
    opacity: disabled ? 0.5 : 1,
    ...(fullWidth && { width: '100%' }),
  };

  const textStyle: TextStyle = {
    fontSize: getFontSize(),
    fontWeight: '600',
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.primaryLight,
          borderWidth: 1,
          borderColor: colors.primaryBorder,
        };
      case 'outline':
        return {
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
        };
      case 'dark':
        return {
          backgroundColor: '#2a2a2a',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: borderRadius.full,
        };
      default:
        return {};
    }
  };

  const getTextColor = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return { color: '#ffffff' };
      case 'secondary':
        return { color: colors.primary };
      case 'outline':
      case 'ghost':
        return { color: colors.text };
      case 'dark':
        return { color: '#ffffff' };
      default:
        return { color: colors.text };
    }
  };

  const renderContent = () => (
    <View style={styles.content}>
      {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
      <Text style={[textStyle, getTextColor()]}>{title}</Text>
      {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[styles.shadowPrimary, buttonStyle, style]}
      >
        <LinearGradient
          colors={[colors.primary, colors.violet]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius: borderRadius.lg }]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.button, buttonStyle, getVariantStyle(), style]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  shadowPrimary: {
    elevation: 8,
  },
});
