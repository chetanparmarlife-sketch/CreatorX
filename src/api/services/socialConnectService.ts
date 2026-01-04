/**
 * Social connect service
 *
 * Social accounts are NOT used for authentication.
 * OAuth tokens are stored ONLY on the backend (encrypted).
 * The mobile app never stores provider tokens.
 */

import { apiClient } from '../client';
import { API_BASE_URL, API_BASE_URL_READY } from '@/src/config/env';

export type SocialProvider = 'instagram' | 'facebook' | 'linkedin';

export type SocialAccountStatus = 'CONNECTED' | 'DISCONNECTED' | 'NEEDS_RECONNECT' | 'PENDING';

export interface CreatorSocialAccount {
  provider: SocialProvider;
  status: SocialAccountStatus;
  username?: string;
  followers?: number;
  engagementRate?: number;
  lastSyncedAt?: string;
  profileImageUrl?: string;
  syncStatus?: string;
  connected?: boolean;
  profileUrl?: string;
  avgViews?: number;
  errorMessage?: string;
}

export const socialConnectService = {
  /**
   * Returns the backend OAuth start URL for the provider.
   * The app opens this URL in a browser; OAuth tokens are handled server-side.
   */
  getConnectUrl(provider: SocialProvider): string | null {
    if (!API_BASE_URL_READY || !API_BASE_URL) return null;
    return `${API_BASE_URL}/social/connect/${provider}/start`;
  },

  /**
   * Fetch connected social accounts for the creator.
   */
  async getSocialAccounts(): Promise<CreatorSocialAccount[]> {
    const response = await apiClient.get<
      | CreatorSocialAccount[]
      | { accounts?: CreatorSocialAccount[] }
      | Array<Record<string, unknown>>
      | { accounts?: Array<Record<string, unknown>> }
    >('/creator/social-accounts');
    const rawAccounts = Array.isArray(response) ? response : response.accounts ?? [];

    return rawAccounts.map((raw) => {
      const providerValue = String(raw.provider ?? '').toLowerCase();
      const provider = (['instagram', 'facebook', 'linkedin'] as const).includes(
        providerValue as SocialProvider
      )
        ? (providerValue as SocialProvider)
        : 'instagram';
      const syncStatus = raw.syncStatus ? String(raw.syncStatus) : undefined;
      const status = (raw.status as SocialAccountStatus) || mapSyncStatus(syncStatus, raw.connected);
      const followers = typeof raw.followers === 'number' ? raw.followers : Number(raw.followerCount ?? 0);

      return {
        provider,
        status,
        username: raw.username as string | undefined,
        followers: Number.isFinite(followers) ? followers : undefined,
        engagementRate: raw.engagementRate as number | undefined,
        lastSyncedAt: raw.lastSyncedAt as string | undefined,
        profileImageUrl: (raw.profileImageUrl as string | undefined) || (raw.profileUrl as string | undefined),
        syncStatus,
        connected: raw.connected as boolean | undefined,
        profileUrl: raw.profileUrl as string | undefined,
        avgViews: raw.avgViews as number | undefined,
        errorMessage: raw.errorMessage as string | undefined,
      };
    });
  },

  /**
   * Refresh metrics for a provider.
   */
  async refresh(provider: SocialProvider): Promise<void> {
    await apiClient.post(`/creator/social-accounts/${provider}/refresh`);
  },

  /**
   * Disconnect a provider.
   */
  async disconnect(provider: SocialProvider): Promise<void> {
    await apiClient.post(`/creator/social-accounts/${provider}/disconnect`);
  },
};

function mapSyncStatus(syncStatus?: string, connected?: unknown): SocialAccountStatus {
  if (syncStatus === 'CONNECTED') return 'CONNECTED';
  if (syncStatus === 'NEEDS_REAUTH' || syncStatus === 'ERROR') return 'NEEDS_RECONNECT';
  if (syncStatus === 'PENDING') return 'PENDING';
  if (connected === true) return 'CONNECTED';
  return 'DISCONNECTED';
}
