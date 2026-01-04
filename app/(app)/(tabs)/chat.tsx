import { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { spacing, borderRadius } from '@/src/theme';
import { ChatItem, ChatItemSkeleton } from '@/src/components';
import { ChatPreview } from '@/src/types';
import { useDebounce, useRefresh, useTheme } from '@/src/hooks';
import { useApp } from '@/src/context';
import { useAuth } from '@/src/context/AuthContext';
import { API_BASE_URL_READY } from '@/src/config/env';

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

export default function MessagesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    chats,
    markChatRead,
    refreshData,
    startMessagesPolling,
    stopMessagesPolling,
    messagingError,
  } = useApp();
  const { isAuthenticated } = useAuth();
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

  const filteredChats = useMemo(() => {
    if (!debouncedSearch) return chats;
    return chats.filter(
      (chat) =>
        chat.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [chats, debouncedSearch]);

  const renderChat = useCallback(
    ({ item }: { item: ChatPreview }) => (
      <MemoizedChatItem chat={item} onPress={() => handleChatPress(item)} />
    ),
    [handleChatPress]
  );
  const chatKeyExtractor = useCallback((item: ChatPreview) => item.id, []);

  const renderEmptyState = useCallback(
    (icon: keyof typeof Feather.glyphMap, title: string, subtitle: string) => (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconWrap}>
          <Feather name={icon} size={28} color={colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptySubtitle}>{subtitle}</Text>
      </View>
    ),
    [colors.textMuted]
  );

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
        renderEmptyState(
          'message-circle',
          searchQuery ? 'No conversations found' : 'No messages yet',
          searchQuery ? 'Try a different search' : 'Start a conversation with brands'
        )
      ),
    [isLoading, searchQuery, colors, renderEmptyState]
  );

  const messagingNotice = useMemo(() => {
    if (!API_BASE_URL_READY) {
      return 'Messaging unavailable in degraded mode.';
    }
    if (!isAuthenticated) {
      return 'Login required to view messages.';
    }
    return messagingError;
  }, [isAuthenticated, messagingError]);

  const ListHeader = useMemo(() => (
    <>
      {messagingNotice ? (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>{messagingNotice}</Text>
        </View>
      ) : null}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          {
            backgroundColor: isDark ? '#1c1c1e' : '#ffffff',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.08)',
          },
        ]}>
          <View style={styles.searchIconWrap}>
            <Feather name="search" size={18} color={colors.textMuted} />
          </View>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search messages"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} data-testid="button-clear-search">
              <Feather name="x" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  ), [colors, isDark, searchQuery, messagingNotice]);

  const renderMessagesTab = () => (
    <FlatList
      data={filteredChats}
      renderItem={renderChat}
      keyExtractor={chatKeyExtractor}
      contentContainerStyle={styles.content}
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
      ItemSeparatorComponent={undefined}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#101322' : colors.background }]} edges={['top']}>
      <View style={[styles.stickyHeader, { backgroundColor: isDark ? 'rgba(16, 19, 34, 0.9)' : colors.background, borderBottomColor: colors.cardBorder }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        <TouchableOpacity
          style={[styles.composeButton, { backgroundColor: isDark ? '#1c1c1e' : '#ffffff' }]}
          onPress={() => router.push('/new-message')}
        >
          <Feather name="edit-2" size={18} color={colors.text} />
        </TouchableOpacity>
      </View>

      {renderMessagesTab()}
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    zIndex: 100,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  composeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c1c1e',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  noticeBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1337ec',
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 48,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
    fontWeight: '400',
  },
  searchIconWrap: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 100,
    paddingHorizontal: spacing.lg,
  },
  chatList: {
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 6,
  },
});
