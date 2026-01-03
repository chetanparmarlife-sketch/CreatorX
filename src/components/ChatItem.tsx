import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { spacing, typography } from '@/src/theme';
import { Avatar } from './Avatar';
import { ChatPreview } from '@/src/types';
import { useTheme } from '@/src/hooks';

interface ChatItemProps {
  chat: ChatPreview;
  onPress: () => void;
  isLast?: boolean;
}

export function ChatItem({ chat, onPress, isLast = false }: ChatItemProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderBottomColor: colors.cardBorder },
        isLast && styles.lastItem,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarWrap, { borderColor: colors.cardBorder }]}>
        <Avatar 
          size={56} 
          name={chat.name} 
          showBadge={false}
        />
        {chat.online && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{chat.name}</Text>
          <View style={styles.metaColumn}>
            <Text style={[styles.time, { color: chat.unread > 0 ? colors.primary : colors.textMuted }]}>
              {chat.time}
            </Text>
            {chat.unread > 0 && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
          </View>
        </View>
        <Text style={[styles.message, { color: chat.unread > 0 ? colors.text : colors.textSecondary }]} numberOfLines={1}>
          {chat.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  avatarWrap: {
    borderWidth: 2,
    borderRadius: 999,
    padding: 2,
    position: 'relative',
  },
  onlineBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#101322',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    ...typography.bodyMedium,
    flex: 1,
    marginRight: spacing.sm,
  },
  metaColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  time: {
    ...typography.xs,
  },
  message: {
    ...typography.small,
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
