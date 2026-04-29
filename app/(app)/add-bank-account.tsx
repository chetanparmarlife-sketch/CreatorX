// This screen lets creators add a real bank account for backend withdrawal payouts.
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { walletService } from '@/src/api/services/walletService';
import { borderRadius, spacing } from '@/src/theme';
import { useTheme } from '@/src/hooks';

type AccountType = 'SAVINGS' | 'CURRENT';

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_NUMBER_PATTERN = /^\d{9,18}$/;

export default function AddBankAccountScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('SAVINGS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedIfsc = useMemo(() => ifscCode.toUpperCase().replace(/\s/g, ''), [ifscCode]);
  const normalizedAccountNumber = useMemo(() => accountNumber.replace(/\D/g, ''), [accountNumber]);
  const normalizedConfirmAccountNumber = useMemo(() => confirmAccountNumber.replace(/\D/g, ''), [confirmAccountNumber]);

  const validate = useCallback(() => {
    if (accountHolderName.trim().length < 3) {
      return 'Account holder name must be at least 3 characters.';
    }
    if (!ACCOUNT_NUMBER_PATTERN.test(normalizedAccountNumber)) {
      return 'Account number must be 9-18 digits.';
    }
    if (normalizedConfirmAccountNumber !== normalizedAccountNumber) {
      return 'Account numbers do not match.';
    }
    if (!IFSC_PATTERN.test(normalizedIfsc)) {
      return 'IFSC code must use format XXXX0XXXXXX.';
    }
    return null;
  }, [accountHolderName, normalizedAccountNumber, normalizedConfirmAccountNumber, normalizedIfsc]);

  const handleSubmit = useCallback(async () => {
    const validationError = validate();
    if (validationError) {
      Alert.alert('Invalid bank details', validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit bank account to backend so withdrawals can use a real payout destination.
      await walletService.addBankAccount({
        accountHolderName: accountHolderName.trim(),
        accountNumber: normalizedAccountNumber,
        ifscCode: normalizedIfsc,
        accountType,
      });

      Alert.alert('Success', 'Bank account added successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Could not add bank account', error?.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [accountHolderName, accountType, normalizedAccountNumber, normalizedIfsc, router, validate]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#050505' }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} onPress={() => router.back()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Bank Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account holder name</Text>
            <TextInput
              style={styles.textInput}
              value={accountHolderName}
              onChangeText={setAccountHolderName}
              placeholder="Name as per bank records"
              placeholderTextColor="#4b5563"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account number</Text>
            <TextInput
              style={styles.textInput}
              value={accountNumber}
              onChangeText={(value) => setAccountNumber(value.replace(/\D/g, ''))}
              placeholder="9-18 digit account number"
              placeholderTextColor="#4b5563"
              keyboardType="numeric"
              maxLength={18}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm account number</Text>
            <TextInput
              style={styles.textInput}
              value={confirmAccountNumber}
              onChangeText={(value) => setConfirmAccountNumber(value.replace(/\D/g, ''))}
              placeholder="Re-enter account number"
              placeholderTextColor="#4b5563"
              keyboardType="numeric"
              maxLength={18}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>IFSC code</Text>
            <TextInput
              style={styles.textInput}
              value={ifscCode}
              onChangeText={(value) => setIfscCode(value.toUpperCase().replace(/\s/g, ''))}
              placeholder="XXXX0XXXXXX"
              placeholderTextColor="#4b5563"
              autoCapitalize="characters"
              maxLength={11}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account type</Text>
            <View style={styles.accountTypeRow}>
              {(['SAVINGS', 'CURRENT'] as AccountType[]).map((type) => {
                const selected = accountType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.accountTypeButton, selected && styles.accountTypeButtonActive]}
                    onPress={() => setAccountType(type)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.accountTypeText, selected && styles.accountTypeTextActive]}>
                      {type === 'SAVINGS' ? 'Savings' : 'Current'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: isSubmitting ? '#1f2430' : colors.primary }]}
          activeOpacity={0.85}
          disabled={isSubmitting}
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueText}>Add Bank Account</Text>
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
        <View style={styles.secureRow}>
          <Feather name="lock" size={12} color="#9ca3af" />
          <Text style={styles.secureText}>Secure 256-bit SSL Encrypted</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 160,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: '#151515',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#1f2937',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  accountTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  accountTypeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  accountTypeButtonActive: {
    backgroundColor: '#1337ec',
    borderColor: '#1337ec',
  },
  accountTypeText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  accountTypeTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: 'rgba(5, 5, 5, 0.98)',
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secureRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  secureText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '600',
  },
});
