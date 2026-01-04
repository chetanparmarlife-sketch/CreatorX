import { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { Deliverable } from '@/src/types';

interface DraftSubmissionModalProps {
  visible: boolean;
  onClose: () => void;
  deliverable: Deliverable | null;
  onSubmit: (
    deliverableId: string,
    file: { name: string; type: 'video' | 'image'; uri: string },
    description?: string
  ) => Promise<void>;
}

export const DraftSubmissionModal = memo(function DraftSubmissionModal({
  visible,
  onClose,
  deliverable,
  onSubmit,
}: DraftSubmissionModalProps) {
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: 'video' | 'image'; uri: string } | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!deliverable) return null;

  const handlePickMedia = async (mediaType: 'video' | 'image') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your media library to upload content.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `draft_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
        setSelectedFile({
          name: fileName,
          type: mediaType,
          uri: asset.uri,
        });
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to select media. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a video or image to upload.');
      return;
    }
    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 0 && (trimmedDescription.length < 20 || trimmedDescription.length > 500)) {
      Alert.alert('Description Required', 'Description must be 20–500 characters if provided.');
      return;
    }

    setIsUploading(true);
    try {
      await onSubmit(deliverable.id, selectedFile, trimmedDescription || undefined);
      setSelectedFile(null);
      setDescription('');
    } catch (error) {
      console.error('Deliverable submission failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDescription('');
    onClose();
  };

  const isRevision = deliverable.status === 'changes_requested' || deliverable.status === 'revision';

  const renderFooter = () => (
    <View style={styles.footerActions}>
      <Button
        title="Cancel"
        onPress={handleClose}
        variant="outline"
        size="lg"
        style={{ flex: 1 }}
        disabled={isUploading}
      />
      <Button
        title={isUploading ? "Submitting..." : "Submit for Review"}
        onPress={handleSubmit}
        variant="primary"
        size="lg"
        style={{ flex: 2 }}
        disabled={!selectedFile || isUploading}
        icon={isUploading ? undefined : <Feather name="send" size={18} color={colors.text} />}
        data-testid="button-submit-draft"
      />
    </View>
  );

  return (
    <Modal visible={visible} onClose={handleClose} footer={renderFooter()}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Feather name="upload-cloud" size={24} color={colors.primary} />
        </View>
        <Text style={styles.title}>{isRevision ? 'Re-upload Draft' : 'Submit Draft'}</Text>
        <Text style={styles.subtitle}>Upload your content for brand review</Text>
      </View>

      <View style={styles.deliverableInfo}>
        <Text style={styles.deliverableTitle} data-testid="text-deliverable-title">{deliverable.title}</Text>
        <View style={styles.deliverableMeta}>
          <Badge label={deliverable.type.replace('_', ' ')} variant="default" size="sm" />
          <Text style={styles.deliverableDue}>Due: {deliverable.dueDate}</Text>
        </View>
      </View>

      {isRevision && deliverable.feedback && (
        <View style={styles.feedbackCard}>
          <View style={styles.feedbackHeader}>
            <Feather name="alert-circle" size={16} color={colors.amber} />
            <Text style={styles.feedbackTitle}>Brand Feedback</Text>
          </View>
          <Text style={styles.feedbackText}>{deliverable.feedback}</Text>
        </View>
      )}

      <View style={styles.uploadSection}>
        <Text style={styles.uploadLabel}>Select Content Type</Text>
        <View style={styles.uploadOptions}>
          <TouchableOpacity
            style={styles.uploadOption}
            onPress={() => handlePickMedia('video')}
            disabled={isUploading}
            data-testid="button-upload-video"
          >
            <View style={[styles.uploadIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="video" size={24} color={colors.primary} />
            </View>
            <Text style={styles.uploadOptionText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadOption}
            onPress={() => handlePickMedia('image')}
            disabled={isUploading}
            data-testid="button-upload-image"
          >
            <View style={[styles.uploadIcon, { backgroundColor: colors.emeraldLight }]}>
              <Feather name="image" size={24} color={colors.emerald} />
            </View>
            <Text style={styles.uploadOptionText}>Image</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedFile && (
        <View style={styles.selectedFileCard}>
          <View style={styles.selectedFileIcon}>
            <Feather name={selectedFile.type === 'video' ? 'video' : 'image'} size={20} color={colors.primary} />
          </View>
          <View style={styles.selectedFileInfo}>
            <Text style={styles.selectedFileName} numberOfLines={1}>{selectedFile.name}</Text>
            <Text style={styles.selectedFileType}>{selectedFile.type.toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedFile(null)} disabled={isUploading}>
            <Feather name="x" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionLabel}>Description (optional)</Text>
        <TextInput
          style={styles.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Add brief context for the brand (20-500 chars)"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />
      </View>

      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.uploadingText}>Uploading your content...</Text>
        </View>
      )}

      <View style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Feather name="info" size={16} color={colors.blue} />
          <Text style={styles.tipsTitle}>Submission Guidelines</Text>
        </View>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>Ensure content meets brand requirements</Text>
          <Text style={styles.tipItem}>Use high resolution media (1080p or higher)</Text>
          <Text style={styles.tipItem}>Review audio quality for videos</Text>
          <Text style={styles.tipItem}>Brand will review within 24-48 hours</Text>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  deliverableInfo: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  deliverableTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  deliverableMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  deliverableDue: {
    ...typography.xs,
    color: colors.textMuted,
  },
  feedbackCard: {
    backgroundColor: colors.amberLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.amberBorder,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  feedbackTitle: {
    ...typography.bodyMedium,
    color: colors.amber,
  },
  feedbackText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  uploadSection: {
    marginBottom: spacing.lg,
  },
  uploadLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  uploadOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  uploadOptionText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  selectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  selectedFileIcon: {
    marginRight: spacing.md,
  },
  selectedFileInfo: {
    flex: 1,
  },
  selectedFileName: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  selectedFileType: {
    ...typography.xs,
    color: colors.textMuted,
  },
  descriptionCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  descriptionLabel: {
    ...typography.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  descriptionInput: {
    minHeight: 90,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    color: colors.text,
    backgroundColor: colors.card,
    fontSize: 14,
  },
  uploadingOverlay: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  uploadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  tipsCard: {
    backgroundColor: colors.blueLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipsTitle: {
    ...typography.bodyMedium,
    color: colors.blue,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    ...typography.small,
    color: colors.textSecondary,
    paddingLeft: spacing.lg,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
