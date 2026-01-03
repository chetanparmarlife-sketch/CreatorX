import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing } from '@/src/theme';
import { Avatar } from '@/src/components';
import { useApp } from '@/src/context';

export default function NewMessageScreen() {
  const router = useRouter();
  const { chats } = useApp();
  const params = useLocalSearchParams<{ name?: string }>();
  const [message, setMessage] = useState('');

  const recipient = useMemo(() => {
    if (params.name) return params.name;
    return chats[0]?.name || 'Nike';
  }, [params.name, chats]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Message</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.recipientRow}>
        <Text style={styles.recipientLabel}>To:</Text>
        <View style={styles.recipientChip}>
          <Avatar size={22} name={recipient} />
          <Text style={styles.recipientName}>{recipient}</Text>
          <TouchableOpacity>
            <Feather name="x" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <TextInput
          style={styles.messageInput}
          placeholder="Start a conversation about a campaign..."
          placeholderTextColor={colors.textMuted}
          value={message}
          onChangeText={setMessage}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.composer}>
        <View style={styles.composerRow}>
          <View style={styles.toolsRow}>
            <TouchableOpacity style={styles.toolButton}>
              <Feather name="image" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton}>
              <Feather name="paperclip" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton}>
              <Feather name="zap" size={18} color={colors.primary} />
              <View style={styles.toolDot} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendText}>Send</Text>
            <Feather name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: {
    width: 50,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  recipientLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(19,55,236,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(19,55,236,0.2)',
  },
  recipientName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: spacing.lg,
  },
  messageInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: '#121212',
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  toolDot: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  sendText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
