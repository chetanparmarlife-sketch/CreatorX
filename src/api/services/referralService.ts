/**
 * Referral service
 */

import { apiClient } from '../client';
import {
  ReferralCode,
  ReferralStats,
  ApplyReferralRequest,
} from '../types';

export const referralService = {
  /**
   * Get referral code
   */
  async getReferralCode(): Promise<ReferralCode> {
    return await apiClient.get<ReferralCode>('/referrals/code');
  },

  /**
   * Apply referral code
   */
  async applyReferralCode(data: ApplyReferralRequest): Promise<void> {
    await apiClient.post('/referrals/apply', data);
  },

  /**
   * Get referral statistics
   */
  async getReferralStats(): Promise<ReferralStats> {
    return await apiClient.get<ReferralStats>('/referrals/stats');
  },
};

