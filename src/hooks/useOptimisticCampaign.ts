/**
 * Hook for optimistic campaign updates
 * Handles save/unsave operations with optimistic UI updates
 */

import { useState, useCallback } from 'react';
import { Campaign } from '@/src/api/types';
import { campaignService } from '@/src/api/services';
import {
  optimisticSaveCampaign,
  optimisticUnsaveCampaign,
} from '@/src/utils/optimisticUpdates';
import { handleAPIError } from '@/src/api/errors';

export interface UseOptimisticCampaignResult {
  campaigns: Campaign[];
  setCampaigns: (campaigns: Campaign[]) => void;
  saveCampaign: (campaignId: string) => Promise<void>;
  unsaveCampaign: (campaignId: string) => Promise<void>;
  isSaving: boolean;
  error: Error | null;
}

/**
 * Hook for managing campaigns with optimistic updates
 */
export function useOptimisticCampaign(
  initialCampaigns: Campaign[] = []
): UseOptimisticCampaignResult {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Save campaign with optimistic update
   */
  const saveCampaign = useCallback(
    async (campaignId: string) => {
      // 1. Optimistic update
      const { updatedState, revert } = optimisticSaveCampaign(
        campaigns,
        campaignId
      );
      setCampaigns(updatedState);
      setIsSaving(true);
      setError(null);

      try {
        // 2. Make API call
        await campaignService.saveCampaign(campaignId);
      } catch (err) {
        // 3. Revert on error
        setCampaigns(revert());
        const apiError = handleAPIError(err);
        setError(apiError);
        throw apiError;
      } finally {
        setIsSaving(false);
      }
    },
    [campaigns]
  );

  /**
   * Unsave campaign with optimistic update
   */
  const unsaveCampaign = useCallback(
    async (campaignId: string) => {
      // 1. Optimistic update
      const { updatedState, revert } = optimisticUnsaveCampaign(
        campaigns,
        campaignId
      );
      setCampaigns(updatedState);
      setIsSaving(true);
      setError(null);

      try {
        // 2. Make API call
        await campaignService.unsaveCampaign(campaignId);
      } catch (err) {
        // 3. Revert on error
        setCampaigns(revert());
        const apiError = handleAPIError(err);
        setError(apiError);
        throw apiError;
      } finally {
        setIsSaving(false);
      }
    },
    [campaigns]
  );

  return {
    campaigns,
    setCampaigns,
    saveCampaign,
    unsaveCampaign,
    isSaving,
    error,
  };
}

