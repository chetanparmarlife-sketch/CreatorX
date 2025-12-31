import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingRole = 'creator' | 'brand' | 'admin';

const ONBOARDING_KEYS: Record<OnboardingRole, string> = {
  creator: '@onboarding_complete_creator',
  brand: '@onboarding_complete_brand',
  admin: '@onboarding_complete_admin',
};

export async function getOnboardingComplete(role: OnboardingRole): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEYS[role]);
    return value === '1';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(role: OnboardingRole): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEYS[role], '1');
  } catch {
    // Best-effort persistence; onboarding can still proceed.
  }
}
