/**
 * Optimistic update utilities
 * Provides helpers for implementing optimistic UI updates
 */

import { Campaign, Application } from '@/src/api/types';

/**
 * Optimistic update result
 */
export interface OptimisticUpdateResult<T> {
  previousState: T[];
  updatedState: T[];
  revert: () => T[];
}

/**
 * Optimistically update campaign save status
 */
export function optimisticSaveCampaign(
  campaigns: Campaign[],
  campaignId: number
): OptimisticUpdateResult<Campaign> {
  const previousState = [...campaigns];
  const updatedState = campaigns.map((campaign) =>
    campaign.id === String(campaignId)
      ? { ...campaign, isSaved: true }
      : campaign
  );

  return {
    previousState,
    updatedState,
    revert: () => previousState,
  };
}

/**
 * Optimistically update campaign unsave status
 */
export function optimisticUnsaveCampaign(
  campaigns: Campaign[],
  campaignId: number
): OptimisticUpdateResult<Campaign> {
  const previousState = [...campaigns];
  const updatedState = campaigns.map((campaign) =>
    campaign.id === String(campaignId)
      ? { ...campaign, isSaved: false }
      : campaign
  );

  return {
    previousState,
    updatedState,
    revert: () => previousState,
  };
}

/**
 * Optimistically add application
 */
export function optimisticAddApplication(
  applications: Application[],
  newApplication: Application
): OptimisticUpdateResult<Application> {
  const previousState = [...applications];
  const updatedState = [newApplication, ...applications];

  return {
    previousState,
    updatedState,
    revert: () => previousState,
  };
}

/**
 * Optimistically remove application
 */
export function optimisticRemoveApplication(
  applications: Application[],
  applicationId: number
): OptimisticUpdateResult<Application> {
  const previousState = [...applications];
  const updatedState = applications.filter(
    (app) => app.id !== String(applicationId)
  );

  return {
    previousState,
    updatedState,
    revert: () => previousState,
  };
}

/**
 * Optimistically update application status
 */
export function optimisticUpdateApplicationStatus(
  applications: Application[],
  applicationId: number,
  status: Application['status']
): OptimisticUpdateResult<Application> {
  const previousState = [...applications];
  const updatedState = applications.map((app) =>
    app.id === String(applicationId) ? { ...app, status } : app
  );

  return {
    previousState,
    updatedState,
    revert: () => previousState,
  };
}

/**
 * Generic optimistic update helper
 */
export function createOptimisticUpdate<T extends { id: string }>(
  items: T[],
  updateFn: (item: T) => T,
  itemId: string
): OptimisticUpdateResult<T> {
  const previousState = [...items];
  const updatedState = items.map((item) =>
    item.id === itemId ? updateFn(item) : item
  );

  return {
    previousState,
    updatedState,
    revert: () => previousState,
  };
}

