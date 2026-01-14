/**
 * Campaign Status Utility Tests
 */

import {
    getStatusBadgeConfig,
    canShowApplyButton,
    shouldShowStatusBadge,
    getPlatforms,
    getContentTypes,
    getTags,
    getDaysRemaining,
    isPaidCampaign,
    getPaymentTypeLabel,
} from '../campaignStatus';
import { Campaign } from '@/src/types';

describe('campaignStatus utilities', () => {
    describe('getStatusBadgeConfig', () => {
        it('returns "Under Review" for APPLIED userState', () => {
            const config = getStatusBadgeConfig('APPLIED', 'ACTIVE');
            expect(config.label).toBe('Under Review');
            expect(config.iconName).toBe('clock');
            expect(config.textColor).toBe('#F57C00');
        });

        it('returns "Under Review" for SHORTLISTED userState', () => {
            const config = getStatusBadgeConfig('SHORTLISTED', 'ACTIVE');
            expect(config.label).toBe('Under Review');
        });

        it('returns "Accepted" for SELECTED userState', () => {
            const config = getStatusBadgeConfig('SELECTED', 'ACTIVE');
            expect(config.label).toBe('Accepted');
            expect(config.iconName).toBe('check-circle');
            expect(config.textColor).toBe('#388E3C');
        });

        it('returns "Not Selected" for REJECTED userState', () => {
            const config = getStatusBadgeConfig('REJECTED', 'ACTIVE');
            expect(config.label).toBe('Not Selected');
            expect(config.iconName).toBe('x-circle');
            expect(config.textColor).toBe('#D32F2F');
        });

        it('returns "Withdrawn" for WITHDRAWN userState', () => {
            const config = getStatusBadgeConfig('WITHDRAWN', 'ACTIVE');
            expect(config.label).toBe('Withdrawn');
        });

        it('returns "Active" for ACTIVE campaign without userState', () => {
            const config = getStatusBadgeConfig(undefined, 'ACTIVE');
            expect(config.label).toBe('Active');
            expect(config.iconName).toBe('check-circle');
        });

        it('returns "Completed" for COMPLETED campaign', () => {
            const config = getStatusBadgeConfig(undefined, 'COMPLETED');
            expect(config.label).toBe('Completed');
            expect(config.iconName).toBe('award');
        });

        it('returns "Cancelled" for CANCELLED campaign', () => {
            const config = getStatusBadgeConfig(undefined, 'CANCELLED');
            expect(config.label).toBe('Cancelled');
            expect(config.iconName).toBe('x-circle');
        });
    });

    describe('canShowApplyButton', () => {
        it('returns true for ACTIVE campaign with no userState and handler', () => {
            expect(canShowApplyButton('ACTIVE', undefined, true)).toBe(true);
        });

        it('returns true for ACTIVE campaign with SAVED userState and handler', () => {
            expect(canShowApplyButton('ACTIVE', 'SAVED', true)).toBe(true);
        });

        it('returns false when no onApply handler', () => {
            expect(canShowApplyButton('ACTIVE', undefined, false)).toBe(false);
        });

        it('returns false for non-ACTIVE campaign', () => {
            expect(canShowApplyButton('COMPLETED', undefined, true)).toBe(false);
        });

        it('returns false when userState is APPLIED', () => {
            expect(canShowApplyButton('ACTIVE', 'APPLIED', true)).toBe(false);
        });

        it('returns false when userState is SELECTED', () => {
            expect(canShowApplyButton('ACTIVE', 'SELECTED', true)).toBe(false);
        });
    });

    describe('shouldShowStatusBadge', () => {
        it('returns true for APPLIED userState', () => {
            expect(shouldShowStatusBadge('ACTIVE', 'APPLIED')).toBe(true);
        });

        it('returns true for SELECTED userState', () => {
            expect(shouldShowStatusBadge('ACTIVE', 'SELECTED')).toBe(true);
        });

        it('returns true for COMPLETED campaign', () => {
            expect(shouldShowStatusBadge('COMPLETED', undefined)).toBe(true);
        });

        it('returns true for SAVED userState', () => {
            expect(shouldShowStatusBadge('ACTIVE', 'SAVED')).toBe(true);
        });
    });

    describe('getPlatforms', () => {
        it('returns platforms array when present', () => {
            const campaign = { platforms: ['instagram', 'youtube'] } as Campaign;
            expect(getPlatforms(campaign)).toEqual(['instagram', 'youtube']);
        });

        it('returns single platform as array', () => {
            const campaign = { platform: 'instagram' } as Campaign;
            expect(getPlatforms(campaign)).toEqual(['instagram']);
        });

        it('returns empty array when no platforms', () => {
            const campaign = {} as Campaign;
            expect(getPlatforms(campaign)).toEqual([]);
        });
    });

    describe('getContentTypes', () => {
        it('returns contentTypes when present', () => {
            const campaign = { contentTypes: ['Reel', 'Story'] } as Campaign;
            expect(getContentTypes(campaign)).toEqual(['Reel', 'Story']);
        });

        it('returns ["Post"] as fallback', () => {
            const campaign = {} as Campaign;
            expect(getContentTypes(campaign)).toEqual(['Post']);
        });
    });

    describe('getTags', () => {
        it('returns tags when present', () => {
            const campaign = { tags: ['Fashion', 'Beauty'] } as Campaign;
            expect(getTags(campaign)).toEqual(['Fashion', 'Beauty']);
        });

        it('returns category as fallback', () => {
            const campaign = { category: 'Tech' } as Campaign;
            expect(getTags(campaign)).toEqual(['Tech']);
        });

        it('returns empty array when no tags or category', () => {
            const campaign = {} as Campaign;
            expect(getTags(campaign)).toEqual([]);
        });
    });

    describe('getDaysRemaining', () => {
        it('returns daysRemaining when present', () => {
            const campaign = { daysRemaining: 14 } as Campaign;
            expect(getDaysRemaining(campaign)).toBe(14);
        });

        it('returns 7 as fallback', () => {
            const campaign = {} as Campaign;
            expect(getDaysRemaining(campaign)).toBe(7);
        });
    });

    describe('isPaidCampaign / getPaymentTypeLabel', () => {
        it('returns true for paid campaign', () => {
            const campaign = { isPaid: true } as Campaign;
            expect(isPaidCampaign(campaign)).toBe(true);
            expect(getPaymentTypeLabel(campaign)).toBe('Paid');
        });

        it('returns false for barter campaign', () => {
            const campaign = { isPaid: false } as Campaign;
            expect(isPaidCampaign(campaign)).toBe(false);
            expect(getPaymentTypeLabel(campaign)).toBe('Barter');
        });

        it('returns true (Paid) when isPaid is undefined', () => {
            const campaign = {} as Campaign;
            expect(isPaidCampaign(campaign)).toBe(true);
            expect(getPaymentTypeLabel(campaign)).toBe('Paid');
        });
    });
});
