import { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { spacing, borderRadius } from '@/src/theme';
import { useTheme, useRefresh } from '@/src/hooks';
import { Avatar, EmptyState } from '@/src/components';

const filterChips = [
  { id: 'all', label: 'All' },
  { id: 'contracts', label: 'Contracts' },
  { id: 'invoices', label: 'Invoices' },
  { id: 'media_kits', label: 'Media Kits' },
];

const recentUploads = [
  { id: '1', name: 'Nike Campaign Contract', type: 'pdf', time: '2 min ago' },
  { id: '2', name: 'Media Kit v2.4', type: 'image', time: '1h ago' },
  { id: '3', name: 'Q3 Invoice - Sephora', type: 'doc', time: 'Yesterday' },
];

const folders = [
  { id: '1', name: 'Legal & Contracts', files: 12, color: '#3b82f6' },
  { id: '2', name: 'Invoices & Earnings', files: 8, color: '#a855f7' },
];

const allDocuments = [
  { id: '1', name: 'Summer Campaign Agreement', type: 'pdf', size: '2.4 MB', date: 'Oct 24, 2023', status: 'signed' },
  { id: '2', name: 'Updated Media Kit 2024', type: 'image', size: '5.1 MB', date: 'Oct 20, 2023', status: null },
  { id: '3', name: 'Brand Guidelines - Sony', type: 'doc', size: '14.2 MB', date: 'Oct 18, 2023', status: null },
  { id: '4', name: 'NDA - Project Alpha', type: 'pdf', size: '1.1 MB', date: 'Sep 29, 2023', status: 'pending' },
];

const getDocIcon = (type: string) => {
  switch (type) {
    case 'pdf': return 'file-text';
    case 'image': return 'image';
    case 'doc': return 'file';
    default: return 'file';
  }
};

const getDocColor = (type: string) => {
  switch (type) {
    case 'pdf': return '#ef4444';
    case 'image': return '#3b82f6';
    case 'doc': return '#6b7280';
    default: return '#6b7280';
  }
};

interface DocumentItemProps {
  doc: typeof allDocuments[0];
  colors: any;
  isDark: boolean;
}

const DocumentItem = memo(function DocumentItem({ doc, colors, isDark }: DocumentItemProps) {
  const iconColor = getDocColor(doc.type);
  
  return (
    <TouchableOpacity
      style={[styles.documentItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      activeOpacity={0.7}
    >
      <View style={[styles.docIcon, { backgroundColor: `${iconColor}15` }]}>
        <Feather name={getDocIcon(doc.type) as any} size={20} color={iconColor} />
      </View>
      <View style={styles.docInfo}>
        <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>{doc.name}</Text>
        <View style={styles.docMeta}>
          <Text style={[styles.docMetaText, { color: colors.textMuted }]}>{doc.size}</Text>
          <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
          <Text style={[styles.docMetaText, { color: colors.textMuted }]}>{doc.date}</Text>
          {doc.status && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: doc.status === 'signed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: doc.status === 'signed' ? '#10b981' : '#f59e0b' }
              ]}>
                {doc.status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Feather name="more-vertical" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default function MyDocsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const { refreshing, handleRefresh: onRefresh } = useRefresh(handleRefresh);

  const filteredDocs = useMemo(() => {
    let docs = allDocuments;
    if (selectedFilter !== 'all') {
      docs = docs.filter(d => {
        if (selectedFilter === 'contracts') return d.type === 'pdf';
        if (selectedFilter === 'invoices') return d.name.toLowerCase().includes('invoice');
        if (selectedFilter === 'media_kits') return d.name.toLowerCase().includes('media');
        return true;
      });
    }
    if (searchQuery) {
      docs = docs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return docs;
  }, [selectedFilter, searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent' }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>My Docs</Text>
        <TouchableOpacity style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent' }]}>
          <Feather name="bell" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search contracts, invoices..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <Feather name="sliders" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterChips.map(chip => (
            <TouchableOpacity
              key={chip.id}
              style={[
                styles.filterChip,
                selectedFilter === chip.id
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.cardBorder }
              ]}
              onPress={() => setSelectedFilter(chip.id)}
            >
              <Text style={[
                styles.filterChipText,
                { color: selectedFilter === chip.id ? '#ffffff' : colors.textSecondary }
              ]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Uploads</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
            {recentUploads.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.recentCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                activeOpacity={0.7}
              >
                <View style={[styles.recentThumb, { backgroundColor: isDark ? '#1e1e1e' : '#f3f4f6' }]}>
                  <Feather name={getDocIcon(item.type) as any} size={24} color={getDocColor(item.type)} />
                  <View style={[styles.typeBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Feather name={getDocIcon(item.type) as any} size={10} color="#ffffff" />
                  </View>
                </View>
                <Text style={[styles.recentName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                <Text style={[styles.recentTime, { color: colors.textMuted }]}>{item.time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Folders</Text>
          <View style={styles.foldersGrid}>
            {folders.map(folder => (
              <TouchableOpacity
                key={folder.id}
                style={[styles.folderCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                activeOpacity={0.7}
              >
                <View style={styles.folderHeader}>
                  <View style={[styles.folderIcon, { backgroundColor: `${folder.color}20` }]}>
                    <Feather name="folder" size={20} color={folder.color} />
                  </View>
                  <Feather name="more-vertical" size={16} color={colors.textMuted} />
                </View>
                <Text style={[styles.folderName, { color: colors.text }]}>{folder.name}</Text>
                <Text style={[styles.folderCount, { color: colors.textMuted }]}>{folder.files} files</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>All Documents</Text>
          {filteredDocs.map(doc => (
            <DocumentItem key={doc.id} doc={doc} colors={colors} isDark={isDark} />
          ))}
        </View>

        <View style={styles.storageSection}>
          <View style={[styles.storageBar, { backgroundColor: isDark ? '#333' : '#e5e7eb' }]}>
            <View style={[styles.storageProgress, { backgroundColor: colors.primary, width: '24%' }]} />
          </View>
          <Text style={[styles.storageText, { color: colors.textMuted }]}>1.2GB of 5GB used</Text>
          <View style={[styles.encryptedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Feather name="lock" size={12} color="#10b981" />
            <Text style={styles.encryptedText}>ENCRYPTED & SECURE</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Feather name="plus" size={24} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentScroll: {
    gap: 12,
  },
  recentCard: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recentThumb: {
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 4,
  },
  recentName: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  recentTime: {
    fontSize: 11,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 2,
  },
  foldersGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  folderCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  folderIcon: {
    padding: 8,
    borderRadius: 8,
  },
  folderName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  folderCount: {
    fontSize: 11,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.xs,
    gap: 12,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  docMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docMetaText: {
    fontSize: 11,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  moreButton: {
    padding: 4,
  },
  storageSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  storageBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  storageProgress: {
    height: '100%',
    borderRadius: 3,
  },
  storageText: {
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  encryptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  encryptedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1337ec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
