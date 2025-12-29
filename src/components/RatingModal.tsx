import { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Modal } from './Modal';
import { Button } from './Button';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  brandName: string;
  onSubmit: (score: number, comment?: string) => void;
}

export const RatingModal = memo(function RatingModal({
  visible,
  onClose,
  brandName,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSubmit(rating, comment.trim() || undefined);
    setRating(0);
    setComment('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  };

  const renderFooter = () => (
    <View style={styles.footerActions}>
      <Button
        title="Skip"
        onPress={handleClose}
        variant="outline"
        size="lg"
        style={{ flex: 1 }}
        disabled={isSubmitting}
      />
      <Button
        title={isSubmitting ? "Submitting..." : "Submit Rating"}
        onPress={handleSubmit}
        variant="primary"
        size="lg"
        style={{ flex: 2 }}
        disabled={rating === 0 || isSubmitting}
        icon={<Feather name="check" size={18} color={colors.text} />}
        data-testid="button-submit-rating"
      />
    </View>
  );

  return (
    <Modal visible={visible} onClose={handleClose} footer={renderFooter()}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Feather name="star" size={24} color={colors.amber} />
        </View>
        <Text style={styles.title}>Rate Your Experience</Text>
        <Text style={styles.subtitle}>How was your collaboration with {brandName}?</Text>
      </View>

      <View style={styles.ratingSection}>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
              data-testid={`button-star-${star}`}
            >
              <Feather
                name={star <= rating ? 'star' : 'star'}
                size={40}
                color={star <= rating ? colors.amber : colors.textMuted}
                style={{ opacity: star <= rating ? 1 : 0.3 }}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {rating === 1 ? 'Poor' :
             rating === 2 ? 'Fair' :
             rating === 3 ? 'Good' :
             rating === 4 ? 'Very Good' :
             'Excellent'}
          </Text>
        )}
      </View>

      <View style={styles.commentSection}>
        <Text style={styles.commentLabel}>Additional Comments (Optional)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Share your experience working with this brand..."
          placeholderTextColor={colors.textMuted}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          data-testid="input-rating-comment"
        />
      </View>

      <View style={styles.infoCard}>
        <Feather name="info" size={16} color={colors.blue} />
        <Text style={styles.infoText}>
          Your rating helps other creators make informed decisions and helps brands improve their collaboration process.
        </Text>
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
    backgroundColor: colors.amberLight,
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
  ratingSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  starButton: {
    padding: spacing.xs,
  },
  ratingLabel: {
    ...typography.bodyMedium,
    color: colors.amber,
    marginTop: spacing.md,
  },
  commentSection: {
    marginBottom: spacing.lg,
  },
  commentLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  commentInput: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    minHeight: 100,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.blueLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  infoText: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  footerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
