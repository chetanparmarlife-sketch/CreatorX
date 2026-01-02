import { memo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { useApp } from '@/src/context';
import { useRefresh } from '@/src/hooks';
import { Notification } from '@/src/types';
import { EmptyState } from '@/src/components';

const NotificationIcon = memo(function NotificationIcon({ type }: { type: Notification['type'] }) {
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
}: {
  notification: Notification;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.notificationItem, !notification.read && styles.unreadItem]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <NotificationIcon type={notification.type} />
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.notificationTime}>{notification.time}</Text>
        </View>
        <Text style={styles.notificationDescription} numberOfLines={2}>
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
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotificationCount,
    fetchNotifications,
    fetchUnreadNotificationCount,
    notificationsError,
  } = useApp();
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
      />
    ),
    [handleNotificationPress]
  );

  const keyExtractor = useCallback((item: Notification) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Notifications</Text>
          {unreadNotificationCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadNotificationCount}</Text>
            </View>
          )}
        </View>
        {unreadNotificationCount > 0 && (
          <TouchableOpacity style={styles.markAllButton} onPress={markAllNotificationsRead}>
            <Feather name="check-circle" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
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
    color: colors.text,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  unreadBadgeText: {
    ...typography.xs,
    color: colors.text,
    fontWeight: '600',
  },
  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    position: 'relative',
  },
  unreadItem: {
    backgroundColor: 'rgba(19, 55, 236, 0.05)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  notificationTime: {
    ...typography.xs,
    color: colors.textMuted,
    fontSize: 9,
  },
  notificationDescription: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  actionText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
  },
  unreadDot: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginHorizontal: spacing.lg,
  },
});
