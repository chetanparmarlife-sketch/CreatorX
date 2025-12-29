/**
 * Error view component for displaying API errors
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/src/hooks';

export interface ErrorViewProps {
  error: string | null;
  onRetry?: () => void;
  title?: string;
  showIcon?: boolean;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  error,
  onRetry,
  title = 'Something went wrong',
  showIcon = true,
}) => {
  const { colors, isDark } = useTheme();

  if (!error) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {showIcon && (
        <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
          <Feather name="alert-circle" size={48} color={colors.primary} />
        </View>
      )}

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{error}</Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Feather name="refresh-cw" size={16} color="#ffffff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

