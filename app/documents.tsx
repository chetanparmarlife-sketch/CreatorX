import { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Button, Badge, EmptyState } from '@/src/components';
import { useRefresh } from '@/src/hooks';
import { useApp } from '@/src/context';

interface Document {
  id: string;
  name: string;
  type: 'contract' | 'invoice' | 'identity' | 'other';
  size: string;
  date: string;
  status: 'verified' | 'pending' | 'expired';
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Brand Agreement - StyleCo',
    type: 'contract',
    size: '2.4 MB',
    date: 'Dec 1, 2024',
    status: 'verified',
  },
  {
    id: '2',
    name: 'Invoice #INV-2024-001',
    type: 'invoice',
    size: '156 KB',
    date: 'Nov 28, 2024',
    status: 'verified',
  },
  {
    id: '3',
    name: 'PAN Card',
    type: 'identity',
    size: '1.2 MB',
    date: 'Oct 15, 2024',
    status: 'verified',
  },
  {
    id: '4',
    name: 'Campaign Contract - TechBrand',
    type: 'contract',
    size: '3.1 MB',
    date: 'Nov 20, 2024',
    status: 'pending',
  },
  {
    id: '5',
    name: 'Aadhaar Card',
    type: 'identity',
    size: '890 KB',
    date: 'Oct 15, 2024',
    status: 'expired',
  },
];

const DocumentIcon = memo(function DocumentIcon({ type }: { type: Document['type'] }) {
  const config = {
    contract: { icon: 'file-text' as const, bg: colors.primaryLight, color: colors.primary },
    invoice: { icon: 'file' as const, bg: colors.emeraldLight, color: colors.emerald },
    identity: { icon: 'user' as const, bg: colors.amberLight, color: colors.amber },
    other: { icon: 'folder' as const, bg: colors.blueLight, color: colors.blue },
  };

  const { icon, bg, color } = config[type];

  return (
    <View style={[styles.docIcon, { backgroundColor: bg }]}>
      <Feather name={icon} size={18} color={color} />
    </View>
  );
});

const DocumentItem = memo(function DocumentItem({
  document,
  onPress,
}: {
  document: Document;
  onPress: () => void;
}) {
  const getStatusBadge = () => {
    switch (document.status) {
      case 'verified':
        return <Badge label="Verified" variant="success" />;
      case 'pending':
        return <Badge label="Pending" variant="warning" />;
      case 'expired':
        return <Badge label="Expired" variant="error" />;
    }
  };

  return (
    <TouchableOpacity style={styles.documentItem} onPress={onPress} activeOpacity={0.7}>
      <DocumentIcon type={document.type} />
      <View style={styles.documentContent}>
        <Text style={styles.documentName} numberOfLines={1}>
          {document.name}
        </Text>
        <View style={styles.documentMeta}>
          <Text style={styles.documentSize}>{document.size}</Text>
          <View style={styles.dot} />
          <Text style={styles.documentDate}>{document.date}</Text>
        </View>
      </View>
      {getStatusBadge()}
    </TouchableOpacity>
  );
});

export default function DocumentsScreen() {
  const router = useRouter();
  const { addNotification } = useApp();
  const [documents, setDocuments] = useState(mockDocuments);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'contract' | 'invoice' | 'identity'>('all');

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const { refreshing, handleRefresh: onRefresh } = useRefresh(handleRefresh);

  const handleUpload = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your files to upload documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileName = asset.fileName || `Document_${Date.now()}.pdf`;

      const newDoc: Document = {
        id: Date.now().toString(),
        name: fileName,
        type: 'other',
        size: '1.5 MB',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'pending',
      };

      setDocuments((prev) => [newDoc, ...prev]);

      addNotification({
        type: 'system',
        title: 'Document Uploaded',
        description: `${fileName} has been uploaded and is pending verification.`,
        time: 'Just now',
        read: false,
      });

      Alert.alert('Success', 'Document uploaded successfully! It will be verified within 24 hours.');
    }
  }, [addNotification]);

  const handleDocumentPress = useCallback((doc: Document) => {
    Alert.alert(
      doc.name,
      `Type: ${doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}\nSize: ${doc.size}\nDate: ${doc.date}\nStatus: ${doc.status}`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
            addNotification({
              type: 'system',
              title: 'Document Deleted',
              description: `${doc.name} has been removed.`,
              time: 'Just now',
              read: true,
            });
          },
        },
      ]
    );
  }, [addNotification]);

  const filteredDocuments = documents.filter((doc) => {
    if (selectedFilter === 'all') return true;
    return doc.type === selectedFilter;
  });

  const filters = [
    { key: 'all' as const, label: 'All' },
    { key: 'contract' as const, label: 'Contracts' },
    { key: 'invoice' as const, label: 'Invoices' },
    { key: 'identity' as const, label: 'Identity' },
  ];

  const renderDocument = useCallback(
    ({ item }: { item: Document }) => (
      <DocumentItem document={item} onPress={() => handleDocumentPress(item)} />
    ),
    [handleDocumentPress]
  );

  const keyExtractor = useCallback((item: Document) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>My Documents</Text>
        </View>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Feather name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterChip, selectedFilter === filter.key && styles.filterChipActive]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text style={[styles.filterChipText, selectedFilter === filter.key && styles.filterChipTextActive]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: colors.emeraldBorder }]}>
          <LinearGradient
            colors={['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0.05)']}
            style={styles.statGradient}
          >
            <Text style={styles.statValue}>{documents.filter((d) => d.status === 'verified').length}</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </LinearGradient>
        </View>
        <View style={[styles.statCard, { borderColor: colors.amberBorder }]}>
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']}
            style={styles.statGradient}
          >
            <Text style={styles.statValue}>{documents.filter((d) => d.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </LinearGradient>
        </View>
        <View style={[styles.statCard, { borderColor: colors.primaryBorder }]}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
            style={styles.statGradient}
          >
            <Text style={styles.statValue}>{documents.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </LinearGradient>
        </View>
      </View>

      <FlatList
        data={filteredDocuments}
        renderItem={renderDocument}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder"
            title="No documents found"
            subtitle="Upload your documents to keep them organized"
            actionLabel="Upload Document"
            onAction={handleUpload}
          />
        }
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text,
  },
  uploadButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  filterChipText: {
    ...typography.small,
    color: colors.textSecondary,
    fontSize: 10,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statGradient: {
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    color: colors.text,
  },
  statLabel: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentContent: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  documentName: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentSize: {
    ...typography.xs,
    color: colors.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textMuted,
    marginHorizontal: spacing.sm,
  },
  documentDate: {
    ...typography.xs,
    color: colors.textMuted,
  },
});
