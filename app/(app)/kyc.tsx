import { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Button, Badge } from '@/src/components';
import { useApp } from '@/src/context';
import { kycService, KYCStatusResponse } from '@/src/api/services/kycService';
import { KYCDocument, DocumentType, DocumentStatus } from '@/src/api/types';

// ==================== Types ====================

interface LocalDocument {
  id: string;
  type: DocumentType;
  title: string;
  description: string;
  status: DocumentStatus | 'NOT_UPLOADED';
  uploadedAt?: string;
  rejectionReason?: string;
  backendId?: string; // ID from backend if uploaded
}

// ==================== Constants ====================

const DOCUMENT_CONFIG: Omit<LocalDocument, 'status' | 'backendId'>[] = [
  {
    id: '1',
    type: 'AADHAAR',
    title: 'Aadhaar Card',
    description: 'Front and back of your Aadhaar card',
  },
  {
    id: '2',
    type: 'PAN',
    title: 'PAN Card',
    description: 'Your PAN card for tax purposes',
  },
  {
    id: '3',
    type: 'PASSPORT',
    title: 'Passport (Optional)',
    description: 'For international campaigns',
  },
  {
    id: '4',
    type: 'DRIVING_LICENSE',
    title: 'Driving License (Optional)',
    description: 'Valid driving license',
  },
  {
    id: '5',
    type: 'GST',
    title: 'GST Certificate (Optional)',
    description: 'For business accounts',
  },
];
const MAX_KYC_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// ==================== Document Card Component ====================

const DocumentUploadCard = memo(function DocumentUploadCard({
  document,
  onUpload,
  onView,
  isUploading,
}: {
  document: LocalDocument;
  onUpload: () => void;
  onView: () => void;
  isUploading: boolean;
}) {
  const getIcon = () => {
    switch (document.type) {
      case 'AADHAAR':
        return 'credit-card';
      case 'PAN':
        return 'file-text';
      case 'PASSPORT':
        return 'globe';
      case 'DRIVING_LICENSE':
        return 'truck';
      case 'GST':
        return 'briefcase';
      default:
        return 'file';
    }
  };

  const getStatusBadge = () => {
    switch (document.status) {
      case 'APPROVED':
        return <Badge label="Verified" variant="success" />;
      case 'PENDING':
        return <Badge label="Under Review" variant="warning" />;
      case 'REJECTED':
        return <Badge label="Rejected" variant="error" />;
      default:
        return <Badge label="Required" variant="default" />;
    }
  };

  const getStatusColor = () => {
    switch (document.status) {
      case 'APPROVED':
        return colors.emeraldLight;
      case 'PENDING':
        return colors.amberLight;
      case 'REJECTED':
        return colors.redLight;
      default:
        return colors.card;
    }
  };

  const getBorderColor = () => {
    switch (document.status) {
      case 'APPROVED':
        return colors.emeraldBorder;
      case 'PENDING':
        return colors.amberBorder;
      case 'REJECTED':
        return 'rgba(239, 68, 68, 0.3)';
      default:
        return colors.cardBorder;
    }
  };

  const getIconColor = () => {
    switch (document.status) {
      case 'APPROVED':
        return colors.emerald;
      case 'PENDING':
        return colors.amber;
      case 'REJECTED':
        return colors.red;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.documentCard, { borderColor: getBorderColor() }]}>
      <View style={styles.documentHeader}>
        <View style={[styles.documentIcon, { backgroundColor: getStatusColor() }]}>
          <Feather name={getIcon() as any} size={20} color={getIconColor()} />
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
        {document.status === 'NOT_UPLOADED' || document.status === 'REJECTED' ? (
          <Button
            title={isUploading ? 'Uploading...' : 'Upload Document'}
            onPress={onUpload}
            variant="primary"
            size="sm"
            icon={
              isUploading ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Feather name="upload" size={16} color={colors.text} />
              )
            }
            fullWidth
            disabled={isUploading}
          />
        ) : document.status === 'PENDING' ? (
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

// ==================== Main Screen Component ====================

export default function KYCScreen() {
  const router = useRouter();
  const { user, addNotification, setUser } = useApp();

  // State
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatusResponse | null>(null);

  // Document number modal
  const [showDocNumberModal, setShowDocNumberModal] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{
    docType: DocumentType;
    docId: string;
    imageResult: ImagePicker.ImagePickerAsset;
    backImageResult?: ImagePicker.ImagePickerAsset;
  } | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');

  // ==================== Load KYC Status ====================

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await kycService.getKYCStatus();
      setKycStatus(response);

      // Merge backend documents with local config
      const mergedDocs = DOCUMENT_CONFIG.map((config) => {
        const backendDoc = response.documents?.find((d) => d.documentType === config.type);

        if (backendDoc) {
          return {
            ...config,
            status: backendDoc.status,
            uploadedAt: (backendDoc.submittedAt ?? backendDoc.createdAt)
              ? new Date(backendDoc.submittedAt ?? backendDoc.createdAt ?? '').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
              : undefined,
            rejectionReason: backendDoc.rejectionReason,
            backendId: backendDoc.id,
          } as LocalDocument;
        }

        return {
          ...config,
          status: 'NOT_UPLOADED' as const,
        } as LocalDocument;
      });

      setDocuments(mergedDocs);

      // Update user KYC status in context
      if (response.isVerified !== user.kycVerified) {
        setUser({ ...user, kycVerified: response.isVerified });
      }
    } catch (err: any) {
      console.error('[KYC] Failed to load status:', err);
      setError(err.message || 'Failed to load KYC status');

      // Use default documents on error
      setDocuments(
        DOCUMENT_CONFIG.map((config) => ({
          ...config,
          status: 'NOT_UPLOADED' as const,
        }))
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== Calculate Progress ====================

  const verifiedCount = documents.filter((d) => d.status === 'APPROVED').length;
  const requiredDocs = documents.filter((d) =>
    d.type === 'AADHAAR' || d.type === 'PAN'
  );
  const requiredVerified = requiredDocs.filter((d) => d.status === 'APPROVED').length;
  const progress = requiredDocs.length > 0
    ? Math.round((requiredVerified / requiredDocs.length) * 100)
    : 0;

  // ==================== Handle Upload ====================

  const handleUpload = useCallback(async (doc: LocalDocument) => {
    if (doc.status === 'PENDING' || doc.status === 'APPROVED') {
      // Pending/approved documents already exist on the backend, so the old resubmit-anytime mock path is blocked.
      Alert.alert('Already Submitted', 'This document is already submitted or approved.');
      return;
    }

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
      if (result.assets[0].fileSize && result.assets[0].fileSize > MAX_KYC_IMAGE_SIZE_BYTES) {
        // Real backend uploads reject oversized files; show the creator the required 5MB limit before upload.
        Alert.alert('Image too large', 'Image must be under 5MB');
        return;
      }

      // Front image opens the existing submit modal so creators can optionally add a backend backImage too.
      setPendingUpload({
        docType: doc.type,
        docId: doc.id,
        imageResult: result.assets[0],
      });
      setDocumentNumber('');
      setShowDocNumberModal(true);
    }
  }, []);

  const handleBackImagePick = useCallback(async () => {
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
      if (result.assets[0].fileSize && result.assets[0].fileSize > MAX_KYC_IMAGE_SIZE_BYTES) {
        // Real backend uploads reject oversized back images too, so the same 5MB limit applies here.
        Alert.alert('Image too large', 'Image must be under 5MB');
        return;
      }

      setPendingUpload((prev) => prev ? { ...prev, backImageResult: result.assets[0] } : prev);
    }
  }, []);

  // ==================== Submit Document ====================

  const submitDocument = async (
    docId: string,
    docType: DocumentType,
    imageAsset: ImagePicker.ImagePickerAsset,
    docNumber?: string,
    backImageAsset?: ImagePicker.ImagePickerAsset
  ) => {
    setUploadingDocId(docId);
    setShowDocNumberModal(false);

    try {
      // Submit KYC documents to backend instead of showing a fake local success state.
      const response = await kycService.submitKYC({
        documentType: docType,
        documentNumber: docNumber,
        file: {
          uri: imageAsset.uri,
          type: imageAsset.mimeType || 'image/jpeg',
          name: imageAsset.fileName || `kyc_${docType}_${Date.now()}.jpg`,
        },
        backFile: backImageAsset
          ? {
            uri: backImageAsset.uri,
            type: backImageAsset.mimeType || 'image/jpeg',
            name: backImageAsset.fileName || `kyc_${docType}_back_${Date.now()}.jpg`,
          }
          : undefined,
      });

      // Update local state
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
              ...d,
              status: 'PENDING' as const,
              uploadedAt: new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
              backendId: response.id,
              rejectionReason: undefined,
            }
            : d
        )
      );

      addNotification({
        type: 'system',
        title: 'Document Uploaded',
        description: `Your ${getDocTitle(docType)} has been submitted for verification`,
        time: 'Just now',
        read: false,
      });

      Alert.alert(
        'Document Uploaded',
        `Your ${getDocTitle(docType)} has been submitted for verification. This typically takes 24-48 hours.`
      );
      // Refresh the real backend status so the confirmation state reflects PENDING from the server.
      await loadKYCStatus();
    } catch (err: any) {
      console.error('[KYC] Upload failed:', err);

      let errorMessage = 'Failed to upload document. Please try again.';
      if (err.status === 400) {
        errorMessage = err.message || 'Invalid document format or details.';
      } else if (err.status === 413) {
        errorMessage = 'Image must be under 5MB';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and retry.';
      }

      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setUploadingDocId(null);
      setPendingUpload(null);
    }
  };

  const getDocTitle = (type: DocumentType): string => {
    const doc = DOCUMENT_CONFIG.find((d) => d.type === type);
    return doc?.title || type;
  };

  // ==================== Handle Document Number Submit ====================

  const handleDocNumberSubmit = () => {
    if (!pendingUpload) return;

    const { docType, docId, imageResult, backImageResult } = pendingUpload;

    // Validate document number format
    if (docType === 'AADHAAR' && !/^\d{12}$/.test(documentNumber.replace(/\s/g, ''))) {
      Alert.alert('Invalid Aadhaar', 'Please enter a valid 12-digit Aadhaar number.');
      return;
    }

    if (docType === 'PAN' && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(documentNumber.toUpperCase())) {
      Alert.alert('Invalid PAN', 'Please enter a valid PAN number (e.g., ABCDE1234F).');
      return;
    }

    submitDocument(docId, docType, imageResult, documentNumber, backImageResult);
  };

  // ==================== Handle View ====================

  const handleView = useCallback((doc: LocalDocument) => {
    Alert.alert(
      doc.title,
      `Status: ${doc.status === 'APPROVED' ? 'Verified' : doc.status}\nUploaded: ${doc.uploadedAt}\n\nThis document is on file.`,
      [
        { text: 'Close', style: 'cancel' },
        doc.status === 'REJECTED' ? {
          text: 'Re-upload',
          onPress: () => handleUpload(doc),
        } : undefined,
      ]
        .filter(Boolean) as any
    );
  }, [handleUpload]);

  // ==================== Render ====================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading KYC status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>KYC Verification</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadKYCStatus}>
          <Feather name="refresh-cw" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Feather name="alert-triangle" size={16} color={colors.red} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadKYCStatus}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <LinearGradient
            colors={
              kycStatus?.isVerified
                ? ['rgba(52, 211, 153, 0.2)', 'rgba(52, 211, 153, 0.05)']
                : ['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.05)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.progressGradient}
          >
            <View style={styles.progressHeader}>
              <View
                style={[
                  styles.progressIcon,
                  { backgroundColor: kycStatus?.isVerified ? colors.emeraldLight : colors.amberLight },
                ]}
              >
                <Feather
                  name={kycStatus?.isVerified ? 'check-circle' : 'clock'}
                  size={28}
                  color={kycStatus?.isVerified ? colors.emerald : colors.amber}
                />
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>
                  {kycStatus?.isVerified ? 'KYC Verified' : 'Verification In Progress'}
                </Text>
                <Text style={styles.progressSubtitle}>
                  {verifiedCount} of {documents.length} documents verified
                </Text>
              </View>
              <View style={styles.progressBadge}>
                <Text
                  style={[
                    styles.progressPercent,
                    { color: kycStatus?.isVerified ? colors.emerald : colors.amber },
                  ]}
                >
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
                      backgroundColor: kycStatus?.isVerified ? colors.emerald : colors.amber,
                    },
                  ]}
                />
              </View>
            </View>

            {!kycStatus?.isVerified && (
              <View style={styles.infoBox}>
                <Feather name="info" size={14} color={colors.amber} />
                <Text style={styles.infoText}>
                  Complete Aadhaar and PAN verification to unlock full earning potential
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Benefits Section */}
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

        {/* Documents Section */}
        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Required Documents</Text>

          {documents.map((doc) => (
            <DocumentUploadCard
              key={doc.id}
              document={doc}
              onUpload={() => handleUpload(doc)}
              onView={() => handleView(doc)}
              isUploading={uploadingDocId === doc.id}
            />
          ))}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Feather name="lock" size={16} color={colors.textSecondary} />
          <Text style={styles.securityText}>
            Your documents are encrypted and stored securely. We never share your personal
            information with third parties.
          </Text>
        </View>
      </ScrollView>

      {/* Document Number Modal */}
      <Modal
        visible={showDocNumberModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDocNumberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Upload {pendingUpload ? getDocTitle(pendingUpload.docType) : 'Document'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Add the front image and optionally add the back image before submitting to the backend.
            </Text>

            {pendingUpload && (
              <View style={styles.documentPreviewRow}>
                <View style={styles.documentPreviewBlock}>
                  <Text style={styles.previewLabel}>Front of document</Text>
                  <Image source={{ uri: pendingUpload.imageResult.uri }} style={styles.documentPreviewImage} />
                </View>
                <TouchableOpacity style={styles.documentPreviewBlock} onPress={handleBackImagePick}>
                  <Text style={styles.previewLabel}>Back of document (optional)</Text>
                  {pendingUpload.backImageResult ? (
                    <Image source={{ uri: pendingUpload.backImageResult.uri }} style={styles.documentPreviewImage} />
                  ) : (
                    <View style={styles.backImagePlaceholder}>
                      <Feather name="plus" size={20} color={colors.textSecondary} />
                      <Text style={styles.backImagePlaceholderText}>Add back</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {(pendingUpload?.docType === 'AADHAAR' || pendingUpload?.docType === 'PAN') && (
              <TextInput
                style={styles.modalInput}
                value={documentNumber}
                onChangeText={setDocumentNumber}
                placeholder={pendingUpload?.docType === 'AADHAAR' ? '1234 5678 9012' : 'ABCDE1234F'}
                placeholderTextColor={colors.textMuted}
                keyboardType={pendingUpload?.docType === 'AADHAAR' ? 'numeric' : 'default'}
                autoCapitalize="characters"
                maxLength={pendingUpload?.docType === 'AADHAAR' ? 14 : 10}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowDocNumberModal(false);
                  setPendingUpload(null);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitButton} onPress={handleDocNumberSubmit}>
                <Text style={styles.modalSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==================== Styles ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
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
  refreshButton: {
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.redLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  errorText: {
    ...typography.small,
    color: colors.red,
    flex: 1,
    marginLeft: spacing.sm,
  },
  retryText: {
    ...typography.smallMedium,
    color: colors.primary,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  documentPreviewRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  documentPreviewBlock: {
    flex: 1,
  },
  previewLabel: {
    ...typography.smallMedium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  documentPreviewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  backImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backImagePlaceholderText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalSubmitText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
});
