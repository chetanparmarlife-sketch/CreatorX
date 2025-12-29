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
      <Avatar 
        size={52} 
        name={chat.name} 
        showBadge={chat.online}
        badgeColor={colors.emerald}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{chat.name}</Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>{chat.time}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={1}>{chat.lastMessage}</Text>
          {chat.unread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.unreadText, { color: '#ffffff' }]}>{chat.unread}</Text>
            </View>
          )}
        </View>
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
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...typography.bodyMedium,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    ...typography.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    ...typography.small,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    ...typography.xs,
    fontWeight: '600',
  },
});
