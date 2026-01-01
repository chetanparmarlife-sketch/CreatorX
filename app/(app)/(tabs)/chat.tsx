import { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, borderRadius, typography } from '@/src/theme';
import { ChatItem, ChatItemSkeleton, EmptyState, Avatar } from '@/src/components';
import { ChatPreview, Notification } from '@/src/types';
import { useDebounce, useRefresh, useTheme } from '@/src/hooks';
import { useApp } from '@/src/context';

const headerTabs = [
  { id: 'messages', label: 'Messages' },
  { id: 'notifications', label: 'Notifications' },
];

const HeaderTabButton = memo(function HeaderTabButton({
  label,
  isActive,
  onPress,
  count,
  colors,
  isDark,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  count?: number;
  colors: any;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.headerTabButton,
        isActive 
          ? [styles.headerTabButtonActive, { borderColor: isDark ? 'rgba(255, 255, 255, 0.8)' : colors.primary }]
          : [styles.headerTabButtonInactive, { backgroundColor: isDark ? '#2a2a2a' : colors.card, borderColor: isDark ? '#2a2a2a' : colors.cardBorder }],
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      data-testid={`tab-${label.toLowerCase()}`}
    >
      <Text style={[
        styles.headerTabButtonText,
        isActive 
          ? { color: isDark ? '#FFFFFF' : colors.primary }
          : { color: isDark ? 'rgba(255, 255, 255, 0.9)' : colors.textSecondary },
      ]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.tabBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.tabBadgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const NotificationItem = memo(function NotificationItem({
  notification,
  colors,
  onPress,
}: {
  notification: Notification;
  colors: any;
  onPress: () => void;
}) {
  const getIconColor = () => {
    switch (notification.type) {
      case 'campaign':
      case 'application':
        return '#10b981';
      case 'payment':
        return colors.primary;
      case 'referral':
        return '#f59e0b';
      case 'message':
        return '#3b82f6';
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.read && { backgroundColor: colors.isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.05)' },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      data-testid={`notification-${notification.id}`}
    >
      <View style={[styles.notificationIconContainer, { backgroundColor: `${getIconColor()}15` }]}>
        {notification.type === 'payment' ? (
          <FontAwesome5 name="rupee-sign" size={16} color={getIconColor()} />
        ) : (
          <Feather name="bell" size={18} color={getIconColor()} />
        )}
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: colors.text }]} numberOfLines={1}>
            {notification.title}
          </Text>
          {!notification.read && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
        </View>
        <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
          {notification.description}
        </Text>
        <Text style={[styles.notificationTime, { color: colors.textMuted }]}>
          {notification.time}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
});

const MemoizedChatItem = memo(function MemoizedChatItem({
  chat,
  onPress,
  isLast = false,
}: {
  chat: ChatPreview;
  onPress: () => void;
  isLast?: boolean;
}) {
  return <ChatItem chat={chat} onPress={onPress} isLast={isLast} />;
});

export default function UpdatesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    chats,
    notifications,
    markChatRead,
    markNotificationRead,
    unreadNotificationCount,
    refreshData,
    startMessagesPolling,
    stopMessagesPolling,
  } = useApp();
  const [selectedTab, setSelectedTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await refreshData();
    setIsLoading(false);
  }, [refreshData]);

  const { refreshing, handleRefresh: onRefresh } = useRefresh(handleRefresh);

  useFocusEffect(
    useCallback(() => {
      startMessagesPolling();
      return () => {
        stopMessagesPolling();
      };
    }, [startMessagesPolling, stopMessagesPolling])
  );

  const handleChatPress = useCallback((chat: ChatPreview) => {
    markChatRead(chat.id);
    router.push({
      pathname: '/conversation',
      params: { name: chat.name, online: String(chat.online), chatId: chat.id },
    });
  }, [router, markChatRead]);

  const handleNotificationPress = useCallback((notification: Notification) => {
    markNotificationRead(notification.id);
    if (notification.action?.path) {
      router.push(notification.action.path as any);
    }
  }, [markNotificationRead, router]);

  const filteredChats = useMemo(() => {
    if (!debouncedSearch) return chats;
    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [chats, debouncedSearch]);

  const filteredNotifications = useMemo(() => {
    if (!debouncedSearch) return notifications;
    return notifications.filter(
      (n) =>
        n.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        n.description.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [notifications, debouncedSearch]);

  const totalUnread = useMemo(
    () => chats.reduce((sum, chat) => sum + chat.unread, 0),
    [chats]
  );

  const unreadNotifications = unreadNotificationCount;

  const renderChat = useCallback(
    ({ item }: { item: ChatPreview }) => (
      <MemoizedChatItem chat={item} onPress={() => handleChatPress(item)} />
    ),
    [handleChatPress]
  );

  const renderNotification = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationItem 
        notification={item} 
        colors={{ ...colors, isDark }} 
        onPress={() => handleNotificationPress(item)} 
      />
    ),
    [colors, isDark, handleNotificationPress]
  );

  const chatKeyExtractor = useCallback((item: ChatPreview) => item.id, []);
  const notificationKeyExtractor = useCallback((item: Notification) => item.id, []);

  const MessagesEmptyComponent = useMemo(
    () =>
      isLoading ? (
        <View style={[styles.chatList, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <ChatItemSkeleton />
          <ChatItemSkeleton />
          <ChatItemSkeleton />
          <ChatItemSkeleton />
        </View>
      ) : (
        <EmptyState
          icon="message-circle"
          title={searchQuery ? 'No conversations found' : 'No messages yet'}
          subtitle={searchQuery ? 'Try a different search' : 'Start a conversation with brands'}
        />
      ),
    [isLoading, searchQuery, colors]
  );

  const NotificationsEmptyComponent = useMemo(
    () => (
      <EmptyState
        icon="bell"
        title={searchQuery ? 'No notifications found' : 'No notifications yet'}
        subtitle={searchQuery ? 'Try a different search' : 'You\'ll see updates about campaigns, payments and more here'}
      />
    ),
    [searchQuery]
  );

  const ListHeader = useMemo(() => (
    <>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
          <Feather name="search" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : '#1a1a1a'} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#ffffff' : '#1a1a1a' }]}
            placeholder={selectedTab === 'messages' ? 'Search conversations...' : 'Search notifications...'}
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} data-testid="button-clear-search">
              <Feather name="x" size={18} color={isDark ? 'rgba(255,255,255,0.5)' : '#1a1a1a'} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {selectedTab === 'messages' 
            ? `${filteredChats.length} conversations`
            : `${filteredNotifications.length} notifications`
          }
        </Text>
      </View>
    </>
  ), [colors, selectedTab, searchQuery, filteredChats.length, filteredNotifications.length]);

  const renderMessagesTab = () => (
    <FlatList
      data={filteredChats}
      renderItem={renderChat}
      keyExtractor={chatKeyExtractor}
      contentContainerStyle={[styles.content, filteredChats.length > 0 && [styles.chatListContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeader}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListEmptyComponent={MessagesEmptyComponent}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews
      ItemSeparatorComponent={() => <View style={[styles.chatSeparator, { backgroundColor: colors.cardBorder }]} />}
    />
  );

  const renderNotificationsTab = () => (
    <FlatList
      data={filteredNotifications}
      renderItem={renderNotification}
      keyExtractor={notificationKeyExtractor}
      contentContainerStyle={[styles.content, filteredNotifications.length > 0 && [styles.notificationListContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeader}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      ListEmptyComponent={NotificationsEmptyComponent}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews
      ItemSeparatorComponent={() => <View style={[styles.notificationSeparator, { backgroundColor: colors.cardBorder }]} />}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.stickyHeader, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
          <Avatar size={30} name="User" />
        </TouchableOpacity>
        <View style={styles.headerTabsContainer}>
          {headerTabs.map((tab) => (
            <HeaderTabButton
              key={tab.id}
              label={tab.label}
              isActive={selectedTab === tab.id}
              onPress={() => setSelectedTab(tab.id)}
              count={tab.id === 'messages' ? totalUnread : unreadNotifications}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </View>
      </View>

      {selectedTab === 'messages' ? renderMessagesTab() : renderNotificationsTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    zIndex: 100,
  },
  headerTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    gap: 6,
  },
  headerTabButtonActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerTabButtonInactive: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
  },
  headerTabButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  headerTabButtonTextActive: {
    color: '#FFFFFF',
  },
  headerTabButtonTextInactive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    backgroundColor: '#8B5CF6',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
    fontWeight: '400',
  },
  resultsHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    paddingBottom: 100,
  },
  chatList: {
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chatListContainer: {
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  chatSeparator: {
    height: 1,
  },
  notificationListContainer: {
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  notificationSeparator: {
    height: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 12,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationMessage: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
    marginTop: 4,
  },
});
