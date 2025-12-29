import { memo } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/src/theme';
import { useTheme } from '@/src/hooks';

interface BackButtonProps {
  title?: string;
  onBack?: () => void;
}

export const BackButton = memo(function BackButton({ title, onBack }: BackButtonProps) {
  const router = useRouter();
  const { colors } = useTheme();

  const handlePress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.cardBorder }]}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: colors.card }]}
        onPress={handlePress}
        data-testid="button-back"
      >
        <Feather name="arrow-left" size={20} color={colors.text} />
      </TouchableOpacity>
      {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
      <View style={styles.placeholder} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
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
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h5,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
});
