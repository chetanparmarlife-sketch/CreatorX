import { memo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing } from '@/src/theme';
import { Avatar } from '@/src/components';
import { Message } from '@/src/types';
import { useApp } from '@/src/context';
import { useAuth } from '@/src/context/AuthContext';
import { API_BASE_URL_READY } from '@/src/config/env';

const MessageBubble = memo(function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === 'user';

  return (
    <View style={[styles.messageBubbleContainer, isUser && styles.messageBubbleContainerUser]}>
      <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleOther]}>
        <Text style={[styles.messageText, isUser && styles.messageTextUser]}>{message.text}</Text>
      </View>
      <View style={[styles.messageFooter, isUser && styles.messageFooterUser]}>
        <Text style={styles.messageTime}>{message.time}</Text>
        {isUser && (
          <Feather
            name={message.status === 'read' ? 'check-circle' : message.status === 'delivered' ? 'check' : 'clock'}
            size={12}
            color={message.status === 'read' ? colors.primary : colors.textMuted}
            style={{ marginLeft: 4 }}
          />
        )}
      </View>
    </View>
  );
});

export default function ConversationScreen() {
  const router = useRouter();
  const { name, online, chatId: paramChatId } = useLocalSearchParams<{ name: string; online: string; chatId: string }>();
  const {
    getConversation,
    sendMessage,
    markChatRead,
    chats,
    loadMessages,
    startConversationPolling,
    stopConversationPolling,
    messagingError,
    messagingConnectionState,
  } = useApp();
  const { isAuthenticated } = useAuth();
  
  const chatId = paramChatId || '1';
  const messages = getConversation(chatId);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const isAtBottomRef = useRef(true);

  const chat = chats.find(c => c.id === chatId);
  const chatName = name || chat?.name || 'Chat';
  const isOnline = online === 'true' || chat?.online || false;

  useEffect(() => {
    loadMessages(chatId);
  }, [chatId, loadMessages]);

  useFocusEffect(
    useCallback(() => {
      startConversationPolling(chatId);
      return () => {
        stopConversationPolling();
      };
    }, [chatId, startConversationPolling, stopConversationPolling])
  );

  useEffect(() => {
    markChatRead(chatId);
  }, [chatId, markChatRead]);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    sendMessage(chatId, inputText.trim());
    setInputText('');
    isAtBottomRef.current = true;

    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsTyping(false);
      }
    }, 2500);
  }, [inputText, chatId, sendMessage]);

  const handleAttachment = useCallback(async () => {
    Alert.alert(
      'Attach File',
      'Choose attachment type',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Photo',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.granted) {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.8,
              });
              if (!result.canceled) {
                Alert.alert('Photo Selected', 'Photo attachments will be available soon!');
              }
            }
          },
        },
        {
          text: 'Document',
          onPress: () => {
            Alert.alert('Coming Soon', 'Document sharing will be available in the next update!');
          },
        },
      ]
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <MessageBubble message={item} />,
    []
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  useEffect(() => {
    if (messages.length > 0) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (isAtBottomRef.current) {
        scrollTimeoutRef.current = setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }
  }, [messages.length]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatarWrap}>
            <Avatar size={40} name={chatName} showBadge={false} />
            {isOnline && <View style={styles.onlineDot} />}
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName} numberOfLines={1}>{chatName}</Text>
              <Feather name="check-circle" size={14} color="#3b82f6" />
            </View>
            <Text style={styles.headerStatus}>
              {isTyping ? 'Typing...' : isOnline ? 'Active now' : 'Offline'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="more-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.campaignBanner}>
        <Text style={styles.campaignBannerText}>Campaign Active</Text>
      </View>
      {(!API_BASE_URL_READY || !isAuthenticated || messagingError || messagingConnectionState === 'offline' || messagingConnectionState === 'reconnecting') ? (
        <View style={styles.noticeBanner}>
          <Text style={styles.noticeText}>
            {!API_BASE_URL_READY
              ? 'Messaging unavailable in degraded mode.'
              : !isAuthenticated
                ? 'Login required to view messages.'
                : messagingConnectionState === 'offline'
                  ? "You're offline — messages will send when reconnected"
                  : messagingConnectionState === 'reconnecting'
                    ? 'Reconnecting...'
                    : messagingError}
          </Text>
        </View>
      ) : null}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
          const paddingToBottom = 40;
          isAtBottomRef.current =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
        }}
        scrollEventThrottle={16}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickChip}>
            <Feather name="upload" size={14} color={colors.primary} />
            <Text style={styles.quickChipText}>Submit Deliverable</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickChipMuted}>
            <Feather name="calendar" size={14} color={colors.textSecondary} />
            <Text style={styles.quickChipMutedText}>Schedule Post</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachment}>
            <Feather name="plus" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={`Message ${chatName}...`}
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Feather name="smile" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Feather name="send" size={18} color={inputText.trim() ? '#fff' : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101322',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(16, 19, 34, 0.9)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatarWrap: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#101322',
  },
  headerInfo: {
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  headerStatus: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  headerAction: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignBanner: {
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: 'rgba(19,55,236,0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(19,55,236,0.2)',
  },
  campaignBannerText: {
    color: '#1337ec',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
  messageList: {
    padding: spacing.lg,
    paddingBottom: 140,
  },
  messageBubbleContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  messageBubbleContainerUser: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  messageBubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  messageBubbleOther: {
    backgroundColor: '#282b39',
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    color: '#e5e7eb',
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#fff',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageFooterUser: {
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(19,55,236,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(19,55,236,0.25)',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  quickChipMuted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1c1f2e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  quickChipMutedText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#101322',
    gap: spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1c1f2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#1c1f2e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#e5e7eb',
    maxHeight: 100,
  },
  emojiButton: {
    padding: 4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1c1f2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
});
