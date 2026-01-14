/**
 * CampaignCard Component Tests
 * Tests for status badge rendering and Apply button logic
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { CampaignCard } from '../CampaignCard';
import { Campaign } from '@/src/types';

// Mock useTheme hook
jest.mock('@/src/hooks', () => ({
    useTheme: () => ({
        colors: {
            text: '#ffffff',
            textSecondary: '#aaaaaa',
            textMuted: '#666666',
            card: '#1a1a1a',
            cardBorder: '#333333',
            primary: '#1337EC',
        },
        isDark: true,
    }),
}));

// Base campaign fixture
const baseCampaign: Campaign = {
    id: 'test-campaign-1',
    title: 'Test Campaign Title',
    brand: 'Test Brand',
    budget: '$1,000',
    category: 'Tech',
    status: 'ACTIVE',
    platforms: ['instagram'],
    contentTypes: ['Post'],
    daysRemaining: 7,
    isPaid: true,
    image: 'https://example.com/image.jpg',
};

describe('CampaignCard', () => {
    describe('Status Badge Rendering', () => {
        it('shows "Under Review" badge when userState is APPLIED', () => {
            const campaign: Campaign = {
                ...baseCampaign,
                userState: 'APPLIED',
            };

            render(<CampaignCard campaign={campaign} />);

            expect(screen.getByText('Under Review')).toBeTruthy();
        });

        it('shows "Under Review" badge when userState is SHORTLISTED', () => {
            const campaign: Campaign = {
                ...baseCampaign,
                userState: 'SHORTLISTED',
            };

            render(<CampaignCard campaign={campaign} />);

            expect(screen.getByText('Under Review')).toBeTruthy();
        });

        it('shows "Accepted" badge when userState is SELECTED', () => {
            const campaign: Campaign = {
                ...baseCampaign,
                userState: 'SELECTED',
            };

            render(<CampaignCard campaign={campaign} />);

            expect(screen.getByText('Accepted')).toBeTruthy();
        });

        it('shows "Not Selected" badge when userState is REJECTED', () => {
            const campaign: Campaign = {
                ...baseCampaign,
                userState: 'REJECTED',
            };

            render(<CampaignCard campaign={campaign} />);

            expect(screen.getByText('Not Selected')).toBeTruthy();
        });

        it('shows "Withdrawn" badge when userState is WITHDRAWN', () => {
            const campaign: Campaign = {
                ...baseCampaign,
                userState: 'WITHDRAWN',
            };

            render(<CampaignCard campaign={campaign} />);

            expect(screen.getByText('Withdrawn')).toBeTruthy();
        });

        it('shows "Active" badge for ACTIVE campaign without userState', () => {
            const campaign: Campaign = {
                ...baseCampaign,
                status: 'ACTIVE',
                userState: 'SAVED', // SAVED shows Apply button, but also removed from this test
            };

            // When there's no apply handler and userState is set, it shows status badge
            render(<CampaignCard campaign={campaign} />);

            // SAVED with no onApply will show status badge
            expect(screen.getByText('Active')).toBeTruthy();
        });

        it('shows "Completed" badge for COMPLETED campaign', () => {
            const campaign: Campaign = {
                ...baseCampaign,
                status: 'COMPLETED',
            };

            render(<CampaignCard campaign={campaign} />);

            expect(screen.getByText('Completed')).toBeTruthy();
        });

        it('shows "Cancelled" badge for CANCELLED campaign', () => {
            const campaign: Campaign = {
                ...baseCampaign,
                status: 'CANCELLED',
            };

            render(<CampaignCard campaign={campaign} />);

            expect(screen.getByText('Cancelled')).toBeTruthy();
        });
    });

    describe('Apply Button Logic', () => {
        it('shows Apply button for ACTIVE campaign with no userState', () => {
            const onApply = jest.fn();
            const campaign: Campaign = {
                ...baseCampaign,
                status: 'ACTIVE',
                userState: undefined,
            };

            render(<CampaignCard campaign={campaign} onApply={onApply} />);

            expect(screen.getByText('Apply')).toBeTruthy();
        });

        it('shows Apply button for ACTIVE campaign with SAVED userState', () => {
            const onApply = jest.fn();
            const campaign: Campaign = {
                ...baseCampaign,
                status: 'ACTIVE',
                userState: 'SAVED',
            };

            render(<CampaignCard campaign={campaign} onApply={onApply} />);

            expect(screen.getByText('Apply')).toBeTruthy();
        });

        it('does NOT show Apply button when userState is APPLIED', () => {
            const onApply = jest.fn();
            const campaign: Campaign = {
                ...baseCampaign,
                status: 'ACTIVE',
                userState: 'APPLIED',
            };

            render(<CampaignCard campaign={campaign} onApply={onApply} />);

            expect(screen.queryByText('Apply')).toBeNull();
        });

        it('does NOT show Apply button when userState is SELECTED', () => {
            const onApply = jest.fn();
            const campaign: Campaign = {
                ...baseCampaign,
                status: 'ACTIVE',
                userState: 'SELECTED',
            };

            render(<CampaignCard campaign={campaign} onApply={onApply} />);

            expect(screen.queryByText('Apply')).toBeNull();
        });

        it('does NOT show Apply button for non-ACTIVE campaign', () => {
            const onApply = jest.fn();
            const campaign: Campaign = {
                ...baseCampaign,
                status: 'COMPLETED',
            };

            render(<CampaignCard campaign={campaign} onApply={onApply} />);

            expect(screen.queryByText('Apply')).toBeNull();
        });

        it('calls onApply when Apply button is pressed', () => {
            const onApply = jest.fn();
            const campaign: Campaign = {
                ...baseCampaign,
                status: 'ACTIVE',
                userState: undefined,
            };

            render(<CampaignCard campaign={campaign} onApply={onApply} />);

            fireEvent.press(screen.getByText('Apply'));

            expect(onApply).toHaveBeenCalledWith(campaign.id);
        });

        it('does NOT show Apply button when onApply is not provided', () => {
            const campaign: Campaign = {
                ...baseCampaign,
                status: 'ACTIVE',
                userState: undefined,
            };

            render(<CampaignCard campaign={campaign} />);

            expect(screen.queryByText('Apply')).toBeNull();
        });
    });

    describe('Card Interactions', () => {
        it('calls onView when card is pressed', () => {
            const onView = jest.fn();
            const campaign: Campaign = { ...baseCampaign };

            render(<CampaignCard campaign={campaign} onView={onView} />);

            // Press the card (TouchableOpacity wrapping the whole card)
            fireEvent.press(screen.getByText(campaign.title));

            expect(onView).toHaveBeenCalledWith(campaign.id);
        });

        it('displays campaign title', () => {
            render(<CampaignCard campaign={baseCampaign} />);

            expect(screen.getByText('Test Campaign Title')).toBeTruthy();
        });

        it('displays brand name', () => {
            render(<CampaignCard campaign={baseCampaign} />);

            expect(screen.getByText('Test Brand')).toBeTruthy();
        });

        it('displays budget', () => {
            render(<CampaignCard campaign={baseCampaign} />);

            expect(screen.getByText('$1,000')).toBeTruthy();
        });
    });
});
