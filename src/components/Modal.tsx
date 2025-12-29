import { memo, ReactNode } from 'react';
import {
  View,
  Text,
  Modal as RNModal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '@/src/theme';
import { useTheme } from '@/src/hooks';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  fullHeight?: boolean;
}

export const Modal = memo(function Modal({
  visible,
  onClose,
  title,
  children,
  footer,
  showCloseButton = true,
  fullHeight = false,
}: ModalProps) {
  const { colors, isDark } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
            <TouchableWithoutFeedback>
              <View style={[
                styles.content, 
                fullHeight && styles.fullHeight,
                { backgroundColor: colors.card, borderColor: colors.cardBorder }
              ]}>
                {(title || showCloseButton) && (
                  <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
                    {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
                    {showCloseButton && (
                      <TouchableOpacity 
                        style={[styles.closeButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]} 
                        onPress={onClose}
                      >
                        <Feather name="x" size={20} color={colors.text} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                <ScrollView
                  style={styles.body}
                  contentContainerStyle={[
                    styles.bodyContent,
                    !footer && styles.bodyContentNoFooter,
                  ]}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {children}
                </ScrollView>
                {footer && (
                  <View style={[styles.footer, { borderTopColor: colors.cardBorder, backgroundColor: colors.card }]}>
                    {footer}
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </RNModal>
  );
});

const styles = {
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
  },
  content: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '90%' as const,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  fullHeight: {
    height: '90%' as const,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    ...typography.h4,
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  body: {
    flexGrow: 0,
    flexShrink: 1,
  },
  bodyContent: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  bodyContentNoFooter: {
    paddingBottom: spacing.xxxl,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    borderTopWidth: 1,
  },
};
