import { memo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { Campaign } from '@/src/types';

interface CampaignApplicationModalProps {
  visible: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onSubmit: (data: ApplicationFormData) => void;
  isSubmitting?: boolean;
}

export interface ApplicationFormData {
  pitch: string;
  expectedTimeline: string;
  extraDetails: string;
}

const timelineOptions = [
  { label: '1 Week', value: '1_week' },
  { label: '2 Weeks', value: '2_weeks' },
  { label: '3 Weeks', value: '3_weeks' },
  { label: '1 Month', value: '1_month' },
  { label: 'Custom', value: 'custom' },
];

export const CampaignApplicationModal = memo(function CampaignApplicationModal({
  visible,
  onClose,
  campaign,
  onSubmit,
  isSubmitting = false,
}: CampaignApplicationModalProps) {
  const [pitch, setPitch] = useState('');
  const [selectedTimeline, setSelectedTimeline] = useState('');
  const [customTimeline, setCustomTimeline] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!campaign) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!pitch.trim()) {
      newErrors.pitch = 'Please write your pitch';
    } else if (pitch.trim().length < 50) {
      newErrors.pitch = 'Pitch should be at least 50 characters';
    }
    
    if (!selectedTimeline) {
      newErrors.timeline = 'Please select a timeline';
    } else if (selectedTimeline === 'custom' && !customTimeline.trim()) {
      newErrors.timeline = 'Please specify your custom timeline';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setPitch('');
    setSelectedTimeline('');
    setCustomTimeline('');
    setExtraDetails('');
    setErrors({});
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const timeline = selectedTimeline === 'custom' 
        ? customTimeline 
        : timelineOptions.find(t => t.value === selectedTimeline)?.label || selectedTimeline;
      
      try {
        await onSubmit({
          pitch: pitch.trim(),
          expectedTimeline: timeline,
          extraDetails: extraDetails.trim(),
        });
        resetForm();
      } catch (error) {
        setErrors({ submit: 'Failed to submit application. Please try again.' });
      }
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderFooter = () => (
    <View style={styles.footerActions}>
      <Button
        title="Cancel"
        onPress={handleClose}
        variant="outline"
        size="lg"
        style={{ flex: 1 }}
      />
      <Button
        title={isSubmitting ? "Submitting..." : "Submit Application"}
        onPress={handleSubmit}
        variant="primary"
        size="lg"
        style={{ flex: 2 }}
        disabled={isSubmitting}
        icon={<Feather name="send" size={18} color={colors.text} />}
        data-testid="button-submit-application"
      />
    </View>
  );

  return (
    <Modal visible={visible} onClose={handleClose} fullHeight footer={renderFooter()}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Feather name="edit-3" size={24} color={colors.primary} />
        </View>
        <Text style={styles.title}>Apply for Campaign</Text>
        <Text style={styles.subtitle}>Submit your application for {campaign.brand}'s campaign</Text>
      </View>

      <View style={styles.campaignPreview}>
        <Text style={styles.campaignTitle} data-testid="text-application-campaign-title">{campaign.title}</Text>
        <View style={styles.campaignMeta}>
          <Badge label={campaign.budget} variant="success" size="sm" />
          <Text style={styles.campaignDeadline}>
            <Feather name="calendar" size={12} color={colors.textMuted} /> {campaign.deadline}
          </Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <View style={styles.fieldHeader}>
          <Feather name="message-square" size={16} color={colors.primary} />
          <Text style={styles.fieldLabel}>Your Pitch</Text>
          <Text style={styles.requiredBadge}>Required</Text>
        </View>
        <Text style={styles.fieldHint}>
          Tell the brand why you're the perfect fit for this campaign. Highlight your experience, audience, and creative ideas.
        </Text>
        <TextInput
          style={[styles.textArea, errors.pitch && styles.inputError]}
          placeholder="I'm excited about this campaign because..."
          placeholderTextColor={colors.textMuted}
          value={pitch}
          onChangeText={setPitch}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          data-testid="input-pitch"
        />
        <View style={styles.charCount}>
          <Text style={[styles.charCountText, pitch.length < 50 && styles.charCountWarning]}>
            {pitch.length}/50 min characters
          </Text>
        </View>
        {errors.pitch && (
          <View style={styles.errorRow}>
            <Feather name="alert-circle" size={14} color={colors.red} />
            <Text style={styles.errorText}>{errors.pitch}</Text>
          </View>
        )}
      </View>

      <View style={styles.formSection}>
        <View style={styles.fieldHeader}>
          <Feather name="clock" size={16} color={colors.primary} />
          <Text style={styles.fieldLabel}>Expected Timeline</Text>
          <Text style={styles.requiredBadge}>Required</Text>
        </View>
        <Text style={styles.fieldHint}>
          How long will you need to deliver all content?
        </Text>
        <View style={styles.timelineGrid}>
          {timelineOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timelineOption,
                selectedTimeline === option.value && styles.timelineOptionActive,
              ]}
              onPress={() => setSelectedTimeline(option.value)}
              data-testid={`button-timeline-${option.value}`}
            >
              <Text style={[
                styles.timelineOptionText,
                selectedTimeline === option.value && styles.timelineOptionTextActive,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedTimeline === 'custom' && (
          <TextInput
            style={[styles.input, errors.timeline && styles.inputError]}
            placeholder="e.g., 6 weeks, 45 days"
            placeholderTextColor={colors.textMuted}
            value={customTimeline}
            onChangeText={setCustomTimeline}
            data-testid="input-custom-timeline"
          />
        )}
        {errors.timeline && (
          <View style={styles.errorRow}>
            <Feather name="alert-circle" size={14} color={colors.red} />
            <Text style={styles.errorText}>{errors.timeline}</Text>
          </View>
        )}
      </View>

      <View style={styles.formSection}>
        <View style={styles.fieldHeader}>
          <Feather name="file-plus" size={16} color={colors.primary} />
          <Text style={styles.fieldLabel}>Additional Details</Text>
          <Text style={styles.optionalBadge}>Optional</Text>
        </View>
        <Text style={styles.fieldHint}>
          Any questions, special requirements, or additional information for the brand.
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="Add any additional information here..."
          placeholderTextColor={colors.textMuted}
          value={extraDetails}
          onChangeText={setExtraDetails}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          data-testid="input-extra-details"
        />
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <Feather name="zap" size={16} color={colors.amber} />
          <Text style={styles.tipTitle}>Pro Tips</Text>
        </View>
        <View style={styles.tipList}>
          <Text style={styles.tipItem}>Mention your relevant past collaborations</Text>
          <Text style={styles.tipItem}>Include engagement stats from similar content</Text>
          <Text style={styles.tipItem}>Share your creative vision for the campaign</Text>
        </View>
      </View>

      {errors.submit && (
        <View style={styles.submitErrorCard}>
          <Feather name="alert-circle" size={16} color={colors.red} />
          <Text style={styles.submitErrorText}>{errors.submit}</Text>
        </View>
      )}
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
  campaignPreview: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  campaignTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  campaignMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  campaignDeadline: {
    ...typography.xs,
    color: colors.textMuted,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  requiredBadge: {
    ...typography.xs,
    color: colors.amber,
    backgroundColor: colors.amberLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  optionalBadge: {
    ...typography.xs,
    color: colors.textMuted,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  fieldHint: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  textArea: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 120,
  },
  inputError: {
    borderColor: colors.red,
  },
  charCount: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  charCountText: {
    ...typography.xs,
    color: colors.textMuted,
  },
  charCountWarning: {
    color: colors.amber,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.xs,
    color: colors.red,
  },
  timelineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timelineOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  timelineOptionActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  timelineOptionText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  timelineOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: colors.amberLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  tipList: {
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
  submitErrorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.redLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  submitErrorText: {
    ...typography.small,
    color: colors.red,
    flex: 1,
  },
});
