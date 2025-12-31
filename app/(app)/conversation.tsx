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
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Avatar } from '@/src/components';
import { Message } from '@/src/types';
import { useApp } from '@/src/context';

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
  const { getConversation, sendMessage, markChatRead, chats, loadMessages } = useApp();
  
  const chatId = paramChatId || '1';
  const messages = getConversation(chatId);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const chat = chats.find(c => c.id === chatId);
  const chatName = name || chat?.name || 'Chat';
  const isOnline = online === 'true' || chat?.online || false;

  useEffect(() => {
    loadMessages(chatId);
  }, [chatId, loadMessages]);

  useEffect(() => {
    markChatRead(chatId);
  }, [chatId, markChatRead]);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    sendMessage(chatId, inputText.trim());
    setInputText('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
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
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Avatar size={40} name={chatName} showBadge={isOnline} badgeColor={colors.emerald} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>{chatName}</Text>
          <Text style={styles.headerStatus}>
            {isTyping ? 'Typing...' : isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="phone" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="more-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachment}>
            <Feather name="paperclip" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim() && styles.sendButtonActive]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Feather name="send" size={18} color={inputText.trim() ? colors.text : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: colors.card,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  headerName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  headerStatus: {
    ...typography.xs,
    color: colors.textSecondary,
    fontSize: 9,
  },
  headerAction: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  messageList: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  messageBubbleContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  messageBubbleContainerUser: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  messageBubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  messageTextUser: {
    color: colors.text,
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
    ...typography.xs,
    color: colors.textMuted,
    fontSize: 9,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    backgroundColor: colors.card,
    gap: spacing.sm,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 120,
  },
  input: {
    ...typography.body,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
});
