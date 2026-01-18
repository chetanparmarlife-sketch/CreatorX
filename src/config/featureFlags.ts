/**
 * Feature flags for gradual API migration
 * Toggle between mock data and real API per feature
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const FEATURE_FLAG_STORAGE_KEY = '@feature_flags';

export type FeatureFlag =
  | 'USE_API_AUTH'
  | 'USE_API_CAMPAIGNS'
  | 'USE_API_APPLICATIONS'
  | 'USE_API_DELIVERABLES'
  | 'USE_API_WALLET'
  | 'USE_API_MESSAGING'
  | 'USE_API_MESSAGING_POLLING'
  | 'USE_WS_MESSAGING'
  | 'USE_POLLING_MESSAGES'
  | 'USE_WS_MESSAGES'
  | 'USE_API_NOTIFICATIONS'
  | 'USE_API_PROFILE'
  | 'USE_API_SOCIAL_CONNECT'
  | 'USE_API_KYC'
  | 'USE_WITHDRAWALS_UI';

interface FeatureFlags {
  USE_API_AUTH: boolean;
  USE_API_CAMPAIGNS: boolean;
  USE_API_APPLICATIONS: boolean;
  USE_API_DELIVERABLES: boolean;
  USE_API_WALLET: boolean;
  USE_API_MESSAGING: boolean;
  USE_API_MESSAGING_POLLING: boolean;
  USE_WS_MESSAGING: boolean;
  USE_POLLING_MESSAGES: boolean;
  USE_WS_MESSAGES: boolean;
  USE_API_NOTIFICATIONS: boolean;
  USE_API_PROFILE: boolean;
  USE_API_SOCIAL_CONNECT: boolean;
  USE_API_KYC: boolean;
  USE_WITHDRAWALS_UI: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  USE_API_AUTH: false, // Controls auth path: true = API backend, false = Supabase only
  USE_API_CAMPAIGNS: true,
  USE_API_APPLICATIONS: true,
  USE_API_DELIVERABLES: true,
  USE_API_WALLET: true,
  USE_API_MESSAGING: true,
  USE_API_MESSAGING_POLLING: true,
  USE_WS_MESSAGING: false,
  USE_POLLING_MESSAGES: true,
  USE_WS_MESSAGES: false,
  USE_API_NOTIFICATIONS: true,
  USE_API_PROFILE: true,
  USE_API_SOCIAL_CONNECT: true, // Controls social account connect flows
  USE_API_KYC: true, // Controls KYC verification flows
  USE_WITHDRAWALS_UI: true, // Phase 4 enabled - real money payouts
};

class FeatureFlagManager {
  private flags: FeatureFlags = { ...DEFAULT_FLAGS };
  private initialized = false;

  async loadFlags(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(FEATURE_FLAG_STORAGE_KEY);
      if (stored) {
        this.flags = { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
      }
      this.initialized = true;
      this.logEnabledFlags();
    } catch (error) {
      console.error('Error loading feature flags:', error);
      this.initialized = true;
    }
  }

  async setFlag(flag: FeatureFlag, enabled: boolean): Promise<void> {
    this.flags[flag] = enabled;
    try {
      await AsyncStorage.setItem(FEATURE_FLAG_STORAGE_KEY, JSON.stringify(this.flags));
    } catch (error) {
      console.error('Error saving feature flags:', error);
    }
  }

  isEnabled(flag: FeatureFlag): boolean {
    return this.flags[flag];
  }

  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  async resetFlags(): Promise<void> {
    this.flags = { ...DEFAULT_FLAGS };
    await AsyncStorage.setItem(FEATURE_FLAG_STORAGE_KEY, JSON.stringify(this.flags));
    this.logEnabledFlags();
  }

  /**
   * Dev log: List enabled flags at startup
   */
  private logEnabledFlags(): void {
    if (__DEV__) {
      const enabled = Object.entries(this.flags)
        .filter(([_, value]) => value)
        .map(([key]) => key);
      const disabled = Object.entries(this.flags)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

      console.log('═══════════════════════════════════════════════════════');
      console.log('🚩 FEATURE FLAGS AUDIT');
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ ENABLED:', enabled.join(', ') || 'None');
      console.log('❌ DISABLED:', disabled.join(', ') || 'None');
      console.log('═══════════════════════════════════════════════════════');
    }
  }
}

export const featureFlags = new FeatureFlagManager();

export const POLL_INTERVAL_MS = 15000;

// Initialize on import
featureFlags.loadFlags();
