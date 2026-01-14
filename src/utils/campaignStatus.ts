/**
 * Campaign Status Utilities
 * Pure functions for status calculation, eligibility, and userState mapping
 */

import type { Campaign } from '@/src/types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type UserState = 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN' | 'SAVED' | undefined;

export type CampaignStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DRAFT' | 'PAUSED';

export interface StatusBadgeConfig {
    backgroundColor: string;
    textColor: string;
    iconName: 'clock' | 'check-circle' | 'x-circle' | 'award' | 'info';
    label: string;
}

export interface CTAConfig {
    type: 'apply' | 'status';
    visible: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Status Badge Logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determines the status badge configuration based on userState and campaign status
 */
export function getStatusBadgeConfig(
    userState: UserState,
    campaignStatus: CampaignStatus,
    defaultPrimaryColor: string = '#1337EC'
): StatusBadgeConfig {
    // User state takes precedence
    if (userState === 'APPLIED' || userState === 'SHORTLISTED') {
        return {
            backgroundColor: '#FFF3E0',
            textColor: '#F57C00',
            iconName: 'clock',
            label: 'Under Review',
        };
    }

    if (userState === 'SELECTED') {
        return {
            backgroundColor: '#E8F5E9',
            textColor: '#388E3C',
            iconName: 'check-circle',
            label: 'Accepted',
        };
    }

    if (userState === 'REJECTED') {
        return {
            backgroundColor: '#FFEBEE',
            textColor: '#D32F2F',
            iconName: 'x-circle',
            label: 'Not Selected',
        };
    }

    if (userState === 'WITHDRAWN') {
        return {
            backgroundColor: '#FFEBEE',
            textColor: '#D32F2F',
            iconName: 'x-circle',
            label: 'Withdrawn',
        };
    }

    // Fall back to campaign status
    if (campaignStatus === 'ACTIVE') {
        return {
            backgroundColor: '#E8F5E9',
            textColor: '#388E3C',
            iconName: 'check-circle',
            label: 'Active',
        };
    }

    if (campaignStatus === 'COMPLETED') {
        return {
            backgroundColor: '#E3F2FD',
            textColor: '#1976D2',
            iconName: 'award',
            label: 'Completed',
        };
    }

    if (campaignStatus === 'CANCELLED') {
        return {
            backgroundColor: '#FFEBEE',
            textColor: '#D32F2F',
            iconName: 'x-circle',
            label: 'Cancelled',
        };
    }

    // Default
    return {
        backgroundColor: defaultPrimaryColor + '20',
        textColor: defaultPrimaryColor,
        iconName: 'info',
        label: campaignStatus || 'Unknown',
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Eligibility Logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determines if the Apply button should be shown
 */
export function canShowApplyButton(
    campaignStatus: CampaignStatus,
    userState: UserState,
    hasOnApplyHandler: boolean
): boolean {
    if (!hasOnApplyHandler) return false;
    if (campaignStatus !== 'ACTIVE') return false;
    if (!userState || userState === 'SAVED') return true;
    return false;
}

/**
 * Determines if the status badge should be shown
 */
export function shouldShowStatusBadge(
    campaignStatus: CampaignStatus,
    userState: UserState
): boolean {
    // Show badge if there's a userState (except when it would show Apply)
    if (userState && userState !== 'SAVED') return true;
    // Also show if campaign is not active (completed, cancelled, etc.)
    if (campaignStatus !== 'ACTIVE') return true;
    // Show for SAVED if campaign is ACTIVE but no Apply handler
    if (userState === 'SAVED') return true;
    return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Normalization
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts platform list from campaign, handling both array and single platform
 */
export function getPlatforms(campaign: Campaign): string[] {
    if (campaign.platforms && campaign.platforms.length > 0) {
        return campaign.platforms;
    }
    if (campaign.platform) {
        return [campaign.platform];
    }
    return [];
}

/**
 * Extracts content types from campaign with fallback
 */
export function getContentTypes(campaign: Campaign): string[] {
    return campaign.contentTypes || ['Post'];
}

/**
 * Extracts tags from campaign with category fallback
 */
export function getTags(campaign: Campaign): string[] {
    return campaign.tags || (campaign.category ? [campaign.category] : []);
}

/**
 * Gets days remaining with fallback
 */
export function getDaysRemaining(campaign: Campaign): number {
    return campaign.daysRemaining || 7;
}

/**
 * Determines if campaign is paid or barter
 */
export function isPaidCampaign(campaign: Campaign): boolean {
    return campaign.isPaid !== false;
}

/**
 * Gets payment type label
 */
export function getPaymentTypeLabel(campaign: Campaign): string {
    return isPaidCampaign(campaign) ? 'Paid' : 'Barter';
}
