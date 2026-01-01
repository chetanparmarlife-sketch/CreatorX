import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { colors } from '@/src/theme';
import { sendOTP, verifyOTP, formatPhoneNumber } from '@/src/services/otpMock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@onboarding_complete_creator',
};

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign Up or Log in</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Feather name="help-circle" size={24} color="#1a1a1a" />
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
              <Text style={styles.title}>Verify your{'\n'}mobile number</Text>
              <Text style={styles.subtitle}>
                Please verify your mobile to log in or{'\n'}create a new account with CreatorX
              </Text>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Your phone number</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.input}
                    placeholder=""
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    maxLength={10}
                    autoFocus
                  />
                  {phoneNumber.length > 0 && (
                    <TouchableOpacity onPress={handleClearPhone} style={styles.clearButton}>
                      <Feather name="x-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.demoBox}>
                <Text style={styles.demoTitle}>Demo Credentials</Text>
                <Text style={styles.demoText}>Phone: Any 10 digits | OTP: 123456</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Enter OTP</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to{'\n'}{formatPhoneNumber(phoneNumber)}
              </Text>

              {message ? (
                <View style={styles.successBox}>
                  <Feather name="check-circle" size={16} color={colors.emerald} />
                  <Text style={styles.successText}>{message}</Text>
                </View>
              ) : null}

              <View style={styles.otpContainer}>
                <TextInput
                  style={styles.otpInput}
                  placeholder="000000"
                  placeholderTextColor="#ccc"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={setOtp}
                  maxLength={6}
                  autoFocus
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity style={styles.resendButton} onPress={handleSendOTP} disabled={loading}>
                <Text style={styles.resendText}>Didn't receive code? <Text style={styles.resendLink}>Resend</Text></Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step === 'phone' && (
            <TouchableOpacity 
              style={styles.termsRow} 
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && <Feather name="check" size={14} color="#fff" />}
              </View>
              <Text style={styles.termsText}>
                By continuing, I agree to CreatorX's{'\n'}
                <Text style={styles.termsLink}>Terms & Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.verifyButton, 
              (step === 'phone' ? !isPhoneValid : otp.length !== 6) && styles.verifyButtonDisabled
            ]}
            onPress={step === 'phone' ? handleSendOTP : handleVerifyOTP}
            disabled={loading || (step === 'phone' ? !isPhoneValid : otp.length !== 6)}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[
                styles.verifyText,
                (step === 'phone' ? !isPhoneValid : otp.length !== 6) && styles.verifyTextDisabled
              ]}>
                {step === 'phone' ? 'Verify' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>

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
    backgroundColor: '#fff',
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
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  helpButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
  },
  countryCode: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  clearButton: {
    padding: 4,
  },
  otpContainer: {
    marginBottom: 16,
  },
  otpInput: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 16,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  successText: {
    color: colors.emerald,
    fontSize: 14,
    marginLeft: 8,
  },
  demoBox: {
    backgroundColor: '#f8f4ff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  demoText: {
    fontSize: 12,
    color: '#666',
  },
  resendButton: {
    alignItems: 'center',
    padding: 8,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1a1a1a',
    borderColor: '#1a1a1a',
  },
  termsText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  termsLink: {
    color: '#1a1a1a',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  verifyButton: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  verifyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyTextDisabled: {
    color: '#999',
  },
  skipButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    color: '#999',
    fontSize: 13,
  },
});
