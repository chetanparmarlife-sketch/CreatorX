import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks';

const recentUploads = [
  { id: '1', name: 'Nike Campaign Contract', time: '2 min ago', icon: 'file-text' as const },
  { id: '2', name: 'Media Kit v2.4', time: '1h ago', icon: 'image' as const },
  { id: '3', name: 'Q3 Invoice - Sephora', time: 'Yesterday', icon: 'file' as const },
];

const folders = [
  { id: '1', title: 'Legal & Contracts', count: '12 files', icon: 'folder', color: '#1337ec' },
  { id: '2', title: 'Invoices & Earnings', count: '8 files', icon: 'folder', color: '#a855f7' },
];

const documents = [
  { id: '1', name: 'Summer Campaign Agreement', size: '2.4 MB', date: 'Oct 24, 2023', status: 'SIGNED' },
  { id: '2', name: 'Updated Media Kit 2024', size: '5.1 MB', date: 'Oct 20, 2023', status: null },
  { id: '3', name: 'Brand Guidelines - Sony', size: '14.2 MB', date: 'Oct 18, 2023', status: null },
  { id: '4', name: 'NDA - Project Alpha', size: '1.1 MB', date: 'Sep 29, 2023', status: 'PENDING' },
];

export default function DocumentsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleUpload = useCallback(() => {
    Alert.alert('Upload', 'Document upload coming soon.');
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Docs</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/notifications')}>
              <Feather name="bell" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/profile')}>
              <View style={[styles.profileAvatar, { backgroundColor: isDark ? '#1a1d2d' : '#e2e8f0' }]} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search contracts, invoices..."
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity>
            <Feather name="sliders" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {['All', 'Contracts', 'Invoices', 'Media Kits'].map((label, index) => (
            <View key={label} style={[styles.filterChip, index === 0 && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, index === 0 && styles.filterChipTextActive]}>{label}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Uploads</Text>
            <Text style={styles.sectionLink}>View All</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {recentUploads.map((item) => (
              <View key={item.id} style={styles.recentCard}>
                <View style={styles.recentThumb}>
                  <Feather name={item.icon} size={16} color="#fff" />
                </View>
                <Text style={styles.recentTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.recentTime}>{item.time}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Folders</Text>
          <View style={styles.folderGrid}>
            {folders.map((folder) => (
              <View key={folder.id} style={styles.folderCard}>
                <View style={[styles.folderIcon, { backgroundColor: `${folder.color}22` }]}>
                  <Feather name="folder" size={18} color={folder.color} />
                </View>
                <Text style={styles.folderTitle}>{folder.title}</Text>
                <Text style={styles.folderCount}>{folder.count}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Documents</Text>
          {documents.map((doc) => (
            <View key={doc.id} style={styles.docRow}>
              <View style={styles.docIcon}>
                <Feather name="file-text" size={16} color={colors.primary} />
              </View>
              <View style={styles.docContent}>
                <Text style={styles.docTitle} numberOfLines={1}>{doc.name}</Text>
                <View style={styles.docMeta}>
                  <Text style={styles.docMetaText}>{doc.size}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.docMetaText}>{doc.date}</Text>
                  {doc.status && (
                    <View style={[styles.statusBadge, doc.status === 'SIGNED' ? styles.statusSigned : styles.statusPending]}>
                      <Text style={styles.statusText}>{doc.status}</Text>
                    </View>
                  )}
                </View>
              </View>
              <TouchableOpacity>
                <Feather name="more-vertical" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.storage}>
          <View style={styles.storageBar}>
            <View style={styles.storageFill} />
          </View>
          <Text style={styles.storageText}>1.2GB of 5GB used</Text>
          <View style={styles.secureBadge}>
            <Feather name="lock" size={12} color="#22c55e" />
            <Text style={styles.secureText}>Encrypted & Secure</Text>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleUpload}>
        <Feather name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101322',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1d2d',
  },
  profileAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d2d',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filtersRow: {
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1d2d',
  },
  filterChipActive: {
    backgroundColor: '#1337ec',
  },
  filterChipText: {
    color: '#9da1b9',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionLink: {
    color: '#1337ec',
    fontSize: 12,
    fontWeight: '700',
  },
  recentRow: {
    gap: 12,
  },
  recentCard: {
    width: 140,
    borderRadius: 12,
    backgroundColor: '#1a1d2d',
    padding: 12,
    gap: 6,
  },
  recentThumb: {
    width: '100%',
    height: 70,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  recentTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  recentTime: {
    color: '#9da1b9',
    fontSize: 10,
  },
  folderGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  folderCard: {
    flex: 1,
    backgroundColor: '#1a1d2d',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  folderIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  folderCount: {
    color: '#9da1b9',
    fontSize: 10,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1a1d2d',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(19,55,236,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docContent: {
    flex: 1,
    gap: 4,
  },
  docTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  docMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  docMetaText: {
    color: '#9da1b9',
    fontSize: 10,
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  statusSigned: {
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  statusPending: {
    backgroundColor: 'rgba(234,179,8,0.15)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#22c55e',
  },
  storage: {
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  storageBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1f2937',
    overflow: 'hidden',
  },
  storageFill: {
    width: '24%',
    height: '100%',
    backgroundColor: '#1337ec',
  },
  storageText: {
    color: '#9da1b9',
    fontSize: 11,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34,197,94,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  secureText: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1337ec',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1337ec',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
});
