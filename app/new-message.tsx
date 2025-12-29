import { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Avatar } from '@/src/components';
import { useApp } from '@/src/context';
import { useDebounce } from '@/src/hooks';

interface Contact {
  id: string;
  name: string;
  subtitle: string;
  online: boolean;
}

const ContactItem = memo(function ContactItem({
  contact,
  onPress,
}: {
  contact: Contact;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity 
      style={styles.contactItem} 
      onPress={onPress}
      data-testid={`contact-${contact.id}`}
    >
      <Avatar size={44} name={contact.name} showBadge={contact.online} badgeColor={colors.emerald} />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactSubtitle}>{contact.subtitle}</Text>
      </View>
      <Feather name="message-circle" size={20} color={colors.primary} />
    </TouchableOpacity>
  );
});

export default function NewMessageScreen() {
  const router = useRouter();
  const { chats } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const contacts: Contact[] = useMemo(() => {
    const existingContacts = chats.map(chat => ({
      id: chat.id,
      name: chat.name,
      subtitle: chat.lastMessage || 'Start a conversation',
      online: chat.online,
    }));

    const suggestedContacts: Contact[] = [
      { id: 'brand-1', name: 'Nike Brand Team', subtitle: 'Brand Partner', online: true },
      { id: 'brand-2', name: 'Adidas Marketing', subtitle: 'Brand Partner', online: false },
      { id: 'brand-3', name: 'CreatorX Support', subtitle: 'Support Team', online: true },
    ];

    return [...existingContacts, ...suggestedContacts];
  }, [chats]);

  const filteredContacts = useMemo(() => {
    if (!debouncedSearch) return contacts;
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [contacts, debouncedSearch]);

  const handleContactPress = useCallback((contact: Contact) => {
    router.push({
      pathname: '/conversation',
      params: { name: contact.name, online: String(contact.online), chatId: contact.id },
    });
  }, [router]);

  const renderContact = useCallback(
    ({ item }: { item: Contact }) => (
      <ContactItem contact={item} onPress={() => handleContactPress(item)} />
    ),
    [handleContactPress]
  );

  const keyExtractor = useCallback((item: Contact) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          data-testid="button-back"
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>New Message</Text>
          <Text style={styles.subtitle}>Start a conversation</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            data-testid="input-search-contacts"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? 'Search Results' : 'Contacts'}
        </Text>
        <Text style={styles.sectionCount}>{filteredContacts.length}</Text>
      </View>

      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="users" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No contacts found</Text>
            <Text style={styles.emptySubtitle}>Try a different search</Text>
          </View>
        }
        initialNumToRender={15}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.text,
    fontSize: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  sectionCount: {
    ...typography.small,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  contactInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  contactName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  contactSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
