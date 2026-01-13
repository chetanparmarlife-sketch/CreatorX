import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { colors } from '@/src/theme';
import { sendOTP, verifyOTP, formatPhoneNumber } from '@/src/services/supabasePhoneAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@onboarding_complete_creator',
};

const OTP_LENGTH = 6;

export default function LoginOTPScreen() {
  const router = useRouter();
  const { devLogin } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const otpInputRef = useRef<TextInput>(null);

  const handleSkipDev = () => {
    devLogin();
  };

  const handleSendOTP = async () => {
    if (!termsAccepted) {
      setError('Please accept Terms & Conditions');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await sendOTP(phoneNumber);
      if (result.success) {
        setMessage(result.message);
        setStep('otp');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await verifyOTP(phoneNumber, otp);
      if (result.success) {
        // Supabase session is automatically set via AuthContext's onAuthStateChange listener
        // which also handles token storage and backend linking
        const onboardingComplete = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);

        if (onboardingComplete === '1') {
          router.replace('/(app)/(tabs)/explore');
        } else {
          router.replace('/(auth)/onboarding-form');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setError('');
    } else {
      router.back();
    }
  };

  const handleClearPhone = () => {
    setPhoneNumber('');
  };

  const isPhoneValid = phoneNumber.length === 10;
  const canVerify = otp.length === OTP_LENGTH;

  const handleOtpChange = (value: string) => {
    const next = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(next);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0b0d1a', '#101322', '#0a0c16']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CreatorX</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Feather name="help-circle" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 'phone' ? (
            <>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Enter your phone number to access your creator dashboard.
              </Text>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <View style={styles.countrySelect}>
                    <Text style={styles.countryCode}>🇮🇳 +91</Text>
                    <Feather name="chevron-down" size={16} color={colors.textMuted} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="555 000-0000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    maxLength={10}
                    autoFocus
                  />
                  {phoneNumber.length > 0 && (
                    <TouchableOpacity onPress={handleClearPhone} style={styles.clearButton}>
                      <Feather name="x-circle" size={18} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryButton, !isPhoneValid && styles.primaryButtonDisabled]}
                onPress={handleSendOTP}
                disabled={loading || !isPhoneValid}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Get Code</Text>
                    <Feather name="arrow-right" size={18} color="#fff" />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                  {termsAccepted && <Feather name="check" size={12} color="#fff" />}
                </View>
                <Text style={styles.termsText}>
                  By continuing, you agree to CreatorX's{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>.
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Verify Account</Text>
              <Text style={styles.subtitle}>
                Enter the {OTP_LENGTH}-digit code sent to{'\n'}{formatPhoneNumber(phoneNumber)}
              </Text>

              {message ? (
                <View style={styles.successBox}>
                  <Feather name="check-circle" size={16} color={colors.emerald} />
                  <Text style={styles.successText}>{message}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.otpContainer}
                activeOpacity={0.9}
                onPress={() => otpInputRef.current?.focus()}
              >
                <TextInput
                  ref={otpInputRef}
                  style={styles.otpHiddenInput}
                  value={otp}
                  onChangeText={handleOtpChange}
                  keyboardType="number-pad"
                  maxLength={OTP_LENGTH}
                  autoFocus
                />
                <View style={styles.otpBoxes}>
                  {Array.from({ length: OTP_LENGTH }).map((_, index) => {
                    const digit = otp[index] || '';
                    const isActive = index === otp.length;
                    return (
                      <View
                        key={`otp-${index}`}
                        style={[
                          styles.otpBox,
                          digit ? styles.otpBoxFilled : null,
                          isActive ? styles.otpBoxActive : null,
                        ]}
                      >
                        <Text style={styles.otpDigit}>{digit}</Text>
                      </View>
                    );
                  })}
                </View>
              </TouchableOpacity>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity style={styles.resendButton} onPress={handleSendOTP} disabled={loading}>
                <Text style={styles.resendText}>
                  Didn't receive code? <Text style={styles.resendLink}>Resend</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, !canVerify && styles.primaryButtonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading || !canVerify}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipDev}>
            <Text style={styles.skipText}>Skip for Dev Preview</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0d1a',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  glowTop: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(19, 55, 236, 0.25)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -140,
    right: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  helpButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    flexGrow: 1,
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 36,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  countrySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    paddingVertical: 6,
  },
  clearButton: {
    padding: 4,
  },
  otpContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpHiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    color: colors.red,
    fontSize: 14,
    marginBottom: 16,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 24,
  },
  successText: {
    color: colors.emerald,
    fontSize: 14,
    marginLeft: 8,
  },
  otpBoxes: {
    flexDirection: 'row',
    gap: 10,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(19, 55, 236, 0.15)',
  },
  otpBoxActive: {
    borderColor: colors.primary,
  },
  otpDigit: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  resendButton: {
    alignItems: 'center',
    padding: 8,
  },
  resendText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  primaryButton: {
    marginTop: 6,
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 12,
  },
});
