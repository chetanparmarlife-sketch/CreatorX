import { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Button, Badge } from '@/src/components';
import { useApp } from '@/src/context';

interface KYCDocument {
  id: string;
  type: 'aadhaar' | 'pan' | 'passport' | 'selfie' | 'bank';
  title: string;
  description: string;
  status: 'not_uploaded' | 'pending' | 'verified' | 'rejected';
  uploadedAt?: string;
  rejectionReason?: string;
}

const initialDocuments: KYCDocument[] = [
  {
    id: '1',
    type: 'aadhaar',
    title: 'Aadhaar Card',
    description: 'Front and back of your Aadhaar card',
    status: 'verified',
    uploadedAt: 'Oct 15, 2024',
  },
  {
    id: '2',
    type: 'pan',
    title: 'PAN Card',
    description: 'Your PAN card for tax purposes',
    status: 'verified',
    uploadedAt: 'Oct 15, 2024',
  },
  {
    id: '3',
    type: 'selfie',
    title: 'Selfie Verification',
    description: 'A clear selfie holding your ID',
    status: 'pending',
    uploadedAt: 'Dec 1, 2024',
  },
  {
    id: '4',
    type: 'bank',
    title: 'Bank Account Details',
    description: 'Cancelled cheque or bank statement',
    status: 'not_uploaded',
  },
  {
    id: '5',
    type: 'passport',
    title: 'Passport (Optional)',
    description: 'For international campaigns',
    status: 'not_uploaded',
  },
];

const DocumentUploadCard = memo(function DocumentUploadCard({
  document,
  onUpload,
  onView,
}: {
  document: KYCDocument;
  onUpload: () => void;
  onView: () => void;
}) {
  const getIcon = () => {
    switch (document.type) {
      case 'aadhaar':
        return 'credit-card';
      case 'pan':
        return 'file-text';
      case 'passport':
        return 'globe';
      case 'selfie':
        return 'camera';
      case 'bank':
        return 'briefcase';
      default:
        return 'file';
    }
  };

  const getStatusBadge = () => {
    switch (document.status) {
      case 'verified':
        return <Badge label="Verified" variant="success" />;
      case 'pending':
        return <Badge label="Under Review" variant="warning" />;
      case 'rejected':
        return <Badge label="Rejected" variant="error" />;
      default:
        return <Badge label="Required" variant="default" />;
    }
  };

  const getStatusColor = () => {
    switch (document.status) {
      case 'verified':
        return colors.emeraldLight;
      case 'pending':
        return colors.amberLight;
      case 'rejected':
        return colors.redLight;
      default:
        return colors.card;
    }
  };

  const getBorderColor = () => {
    switch (document.status) {
      case 'verified':
        return colors.emeraldBorder;
      case 'pending':
        return colors.amberBorder;
      case 'rejected':
        return 'rgba(239, 68, 68, 0.3)';
      default:
        return colors.cardBorder;
    }
  };

  return (
    <View style={[styles.documentCard, { borderColor: getBorderColor() }]}>
      <View style={styles.documentHeader}>
        <View style={[styles.documentIcon, { backgroundColor: getStatusColor() }]}>
          <Feather
            name={getIcon() as any}
            size={20}
            color={document.status === 'verified' ? colors.emerald : document.status === 'pending' ? colors.amber : document.status === 'rejected' ? colors.red : colors.textSecondary}
          />
        </View>
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{document.title}</Text>
          <Text style={styles.documentDescription}>{document.description}</Text>
          {document.uploadedAt && (
            <Text style={styles.documentDate}>Uploaded: {document.uploadedAt}</Text>
          )}
        </View>
        {getStatusBadge()}
      </View>

      {document.rejectionReason && (
        <View style={styles.rejectionBox}>
          <Feather name="alert-circle" size={14} color={colors.red} />
          <Text style={styles.rejectionText}>{document.rejectionReason}</Text>
        </View>
      )}

      <View style={styles.documentActions}>
        {document.status === 'not_uploaded' || document.status === 'rejected' ? (
          <Button
            title="Upload Document"
            onPress={onUpload}
            variant="primary"
            size="sm"
            icon={<Feather name="upload" size={16} color={colors.text} />}
            fullWidth
          />
        ) : document.status === 'pending' ? (
          <View style={styles.pendingMessage}>
            <Feather name="clock" size={14} color={colors.amber} />
            <Text style={styles.pendingText}>Verification in progress (24-48 hrs)</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.viewButton} onPress={onView}>
            <Feather name="eye" size={16} color={colors.primary} />
            <Text style={styles.viewButtonText}>View Document</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

export default function KYCScreen() {
  const router = useRouter();
  const { user, addNotification } = useApp();
  const [documents, setDocuments] = useState(initialDocuments);

  const verifiedCount = documents.filter((d) => d.status === 'verified').length;
  const totalRequired = documents.filter((d) => d.type !== 'passport').length;
  const progress = Math.round((verifiedCount / totalRequired) * 100);

  const handleUpload = useCallback(async (doc: KYCDocument) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos to upload documents.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? {
                ...d,
                status: 'pending',
                uploadedAt: new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
              }
            : d
        )
      );

      addNotification({
        type: 'system',
        title: 'Document Uploaded',
        description: `Your ${doc.title} has been submitted for verification`,
        time: 'Just now',
        read: false,
      });

      Alert.alert(
        'Document Uploaded',
        `Your ${doc.title} has been submitted for verification. This typically takes 24-48 hours.`
      );
    }
  }, [addNotification]);

  const handleView = useCallback((doc: KYCDocument) => {
    Alert.alert(
      doc.title,
      `Status: Verified\nUploaded: ${doc.uploadedAt}\n\nThis document has been verified and is on file.`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Re-upload',
          onPress: () => handleUpload(doc),
        },
      ]
    );
  }, [handleUpload]);

  const handleCaptureWithCamera = useCallback(async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow camera access to take a selfie.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDocuments((prev) =>
        prev.map((d) =>
          d.type === 'selfie'
            ? {
                ...d,
                status: 'pending',
                uploadedAt: new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
              }
            : d
        )
      );

      addNotification({
        type: 'system',
        title: 'Selfie Uploaded',
        description: 'Your selfie verification photo has been submitted',
        time: 'Just now',
        read: false,
      });

      Alert.alert('Selfie Captured', 'Your verification selfie has been submitted for review.');
    }
  }, [addNotification]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>KYC Verification</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressCard}>
          <LinearGradient
            colors={user.kycVerified 
              ? ['rgba(52, 211, 153, 0.2)', 'rgba(52, 211, 153, 0.05)']
              : ['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressGradient}
          >
            <View style={styles.progressHeader}>
              <View style={[styles.progressIcon, { backgroundColor: user.kycVerified ? colors.emeraldLight : colors.amberLight }]}>
                <Feather
                  name={user.kycVerified ? 'check-circle' : 'clock'}
                  size={28}
                  color={user.kycVerified ? colors.emerald : colors.amber}
                />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>
                  {user.kycVerified ? 'KYC Verified' : 'Verification In Progress'}
                </Text>
                <Text style={styles.progressSubtitle}>
                  {verifiedCount} of {totalRequired} documents verified
                </Text>
              </View>
              <View style={styles.progressBadge}>
                <Text style={[styles.progressPercent, { color: user.kycVerified ? colors.emerald : colors.amber }]}>
                  {progress}%
                </Text>
              </View>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: user.kycVerified ? colors.emerald : colors.amber,
                    },
                  ]}
                />
              </View>
            </View>

            {!user.kycVerified && (
              <View style={styles.infoBox}>
                <Feather name="info" size={14} color={colors.amber} />
                <Text style={styles.infoText}>
                  Complete all required documents to unlock full earning potential
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Why Complete KYC?</Text>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.emeraldLight }]}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.emerald }}>₹</Text>
              </View>
              <Text style={styles.benefitText}>Faster Payments</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.primaryLight }]}>
                <Feather name="briefcase" size={16} color={colors.primary} />
              </View>
              <Text style={styles.benefitText}>Premium Campaigns</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.amberLight }]}>
                <Feather name="shield" size={16} color={colors.amber} />
              </View>
              <Text style={styles.benefitText}>Verified Badge</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: colors.blueLight }]}>
                <Feather name="trending-up" size={16} color={colors.blue} />
              </View>
              <Text style={styles.benefitText}>Higher Limits</Text>
            </View>
          </View>
        </View>

        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          
          {documents.map((doc) => (
            <DocumentUploadCard
              key={doc.id}
              document={doc}
              onUpload={() => doc.type === 'selfie' ? handleCaptureWithCamera() : handleUpload(doc)}
              onView={() => handleView(doc)}
            />
          ))}
        </View>

        <View style={styles.securityNote}>
          <Feather name="lock" size={16} color={colors.textSecondary} />
          <Text style={styles.securityText}>
            Your documents are encrypted and stored securely. We never share your personal information with third parties.
          </Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  progressCard: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  progressGradient: {
    padding: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  progressTitle: {
    ...typography.h4,
    color: colors.text,
  },
  progressSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  progressPercent: {
    ...typography.h4,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginBottom: spacing.md,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  infoText: {
    ...typography.small,
    color: colors.amber,
    marginLeft: spacing.sm,
    flex: 1,
  },
  benefitsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    width: '48%',
  },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  benefitText: {
    ...typography.small,
    color: colors.text,
  },
  documentsSection: {
    marginBottom: spacing.xl,
  },
  documentCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  documentTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: 2,
  },
  documentDescription: {
    ...typography.xs,
    color: colors.textSecondary,
  },
  documentDate: {
    ...typography.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.redLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  rejectionText: {
    ...typography.small,
    color: colors.red,
    marginLeft: spacing.sm,
    flex: 1,
  },
  documentActions: {
    marginTop: spacing.lg,
  },
  pendingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amberLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  pendingText: {
    ...typography.small,
    color: colors.amber,
    marginLeft: spacing.sm,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    padding: spacing.md,
  },
  viewButtonText: {
    ...typography.bodyMedium,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
  },
  securityText: {
    ...typography.small,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
});
