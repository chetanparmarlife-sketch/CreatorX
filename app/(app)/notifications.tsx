import { memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { spacing, borderRadius, typography, colors as themeColors } from '@/src/theme';
import { useApp } from '@/src/context';
import { useRefresh, useTheme } from '@/src/hooks';
import { Notification } from '@/src/types';
import { EmptyState } from '@/src/components';

const NotificationIcon = memo(function NotificationIcon({
  type,
  colors,
}: {
  type: Notification['type'];
  colors: any;
}) {
  const config = {
    payment: { icon: null, bg: colors.emeraldLight, color: colors.emerald, isRupee: true },
    campaign: { icon: 'briefcase' as const, bg: colors.primaryLight, color: colors.primary, isRupee: false },
    message: { icon: 'message-circle' as const, bg: colors.blueLight, color: colors.blue, isRupee: false },
    referral: { icon: 'gift' as const, bg: colors.amberLight, color: colors.amber, isRupee: false },
    system: { icon: 'bell' as const, bg: 'rgba(255, 255, 255, 0.1)', color: colors.textSecondary, isRupee: false },
    application: { icon: 'file-text' as const, bg: colors.primaryLight, color: colors.primary, isRupee: false },
  };

  const { icon, bg, color, isRupee } = config[type] || config.system;

  return (
    <View style={[styles.iconContainer, { backgroundColor: bg }]}>
      {isRupee ? (
        <Text style={{ fontSize: 18, fontWeight: '700', color }}>₹</Text>
      ) : (
        <Feather name={icon!} size={18} color={color} />
      )}
    </View>
  );
});

const NotificationItem = memo(function NotificationItem({
  notification,
  onPress,
  colors,
  palette,
}: {
  notification: Notification;
  onPress: () => void;
  colors: any;
  palette: {
    cardColor: string;
    borderColor: string;
    mutedText: string;
    secondaryText: string;
  };
}) {
  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: palette.cardColor, borderColor: palette.borderColor },
        !notification.read && styles.unreadItem,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <NotificationIcon type={notification.type} colors={colors} />
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={[styles.notificationTime, { color: palette.mutedText }]}>{notification.time}</Text>
        </View>
        <Text style={[styles.notificationDescription, { color: palette.secondaryText }]} numberOfLines={2}>
          {notification.description}
        </Text>
        {notification.action && (
          <View style={styles.actionRow}>
            <Text style={styles.actionText}>{notification.action.label}</Text>
            <Feather name="chevron-right" size={14} color={colors.primary} />
          </View>
        )}
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
});

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors: theme, isDark } = useTheme();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotificationCount,
    fetchNotifications,
    fetchUnreadNotificationCount,
    notificationsError,
  } = useApp();
  const backgroundColor = isDark ? '#101322' : theme.background;
  const cardColor = isDark ? '#1c1f2e' : theme.card;
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : theme.cardBorder;
  const mutedText = isDark ? '#94a3b8' : theme.textMuted;
  const secondaryText = isDark ? '#9ca3af' : theme.textSecondary;
  const { refreshing, handleRefresh } = useRefresh(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadNotificationCount()]);
  });

  const handleNotificationPress = useCallback((notification: Notification) => {
    markNotificationRead(notification.id);
    if (notification.action?.path) {
      router.push(notification.action.path as any);
    }
  }, [markNotificationRead, router]);

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationItem
        notification={item}
        onPress={() => handleNotificationPress(item)}
        colors={theme}
        palette={{
          cardColor,
          borderColor,
          mutedText,
          secondaryText,
        }}
      />
    ),
    [handleNotificationPress, theme, cardColor, borderColor, mutedText, secondaryText]
  );

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: borderColor, backgroundColor: backgroundColor }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: cardColor, borderColor: borderColor }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
          {unreadNotificationCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.unreadBadgeText}>{unreadNotificationCount}</Text>
            </View>
          )}
        </View>
        {unreadNotificationCount > 0 && (
          <TouchableOpacity style={[styles.markAllButton, { backgroundColor: cardColor, borderColor: borderColor }]} onPress={markAllNotificationsRead}>
            <Feather name="check-circle" size={20} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[styles.listContent, { backgroundColor: backgroundColor }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          notificationsError ? (
            <EmptyState
              icon="alert-circle"
              title="Failed to load notifications"
              subtitle="Pull to retry."
            />
          ) : (
            <EmptyState
              icon="bell-off"
              title="No notifications yet"
              subtitle="You'll see updates about your campaigns and payments here"
            />
          )
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: themeColors.cardBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: themeColors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  title: {
    ...typography.h4,
    color: themeColors.text,
  },
  unreadBadge: {
    backgroundColor: themeColors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  unreadBadgeText: {
    ...typography.xs,
    color: themeColors.text,
    fontWeight: '600',
  },
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: themeColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
  },
  unreadItem: {
    backgroundColor: 'rgba(19, 55, 236, 0.08)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    ...typography.bodyMedium,
    color: themeColors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  notificationTime: {
    ...typography.xs,
    color: themeColors.textMuted,
    fontSize: 9,
  },
  notificationDescription: {
    ...typography.small,
    color: themeColors.textSecondary,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  actionText: {
    ...typography.small,
    color: themeColors.primary,
    fontWeight: '600',
  },
  unreadDot: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: themeColors.primary,
  },
  separator: {
    height: 0,
  },
});
