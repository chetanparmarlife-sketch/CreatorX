/**
 * Explore Screen Tests
 * Tests for loading, error, empty, and populated states
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { Campaign } from '@/src/types';

// Mock the context before importing the component
const mockUseApp = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('@/src/context', () => ({
    useApp: () => mockUseApp(),
}));

jest.mock('@/src/context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

jest.mock('@/src/hooks', () => ({
    useTheme: () => ({
        colors: {
            text: '#ffffff',
            textSecondary: '#aaaaaa',
            textMuted: '#666666',
            card: '#1a1a1a',
            cardBorder: '#333333',
            primary: '#1337EC',
            background: '#050505',
        },
        isDark: true,
    }),
    useRefresh: () => ({
        refreshing: false,
        handleRefresh: jest.fn(),
    }),
}));

// Mock components used in Explore
jest.mock('@/src/components', () => ({
    Avatar: () => null,
    CampaignApplicationModal: () => null,
    CampaignCardSkeleton: () => {
        const { Text } = require('react-native');
        return <Text testID="campaign-skeleton">Loading...</Text>;
    },
    CampaignDetailModal: () => null,
    ErrorView: ({ error, onRetry }: { error: string; onRetry: () => void }) => {
        const { Text, TouchableOpacity } = require('react-native');
        return (
            <>
                <Text testID="error-view">{error}</Text>
                <TouchableOpacity testID="retry-button" onPress={onRetry}>
                    <Text>Retry</Text>
                </TouchableOpacity>
            </>
        );
    },
}));

// Import after mocks are set up
import ExploreScreen from '../../../../app/(app)/(tabs)/explore';

// Sample campaigns fixture
const sampleCampaigns: Campaign[] = [
    {
        id: 'campaign-1',
        title: 'Instagram Influencer Campaign',
        brand: 'Nike',
        budget: '$2,000',
        category: 'Fashion',
        status: 'ACTIVE',
        platforms: ['instagram'],
        contentTypes: ['Reel', 'Story'],
        daysRemaining: 14,
        isPaid: true,
    },
    {
        id: 'campaign-2',
        title: 'YouTube Tech Review',
        brand: 'Samsung',
        budget: '$5,000',
        category: 'Tech',
        status: 'ACTIVE',
        platforms: ['youtube'],
        contentTypes: ['Video'],
        daysRemaining: 7,
        isPaid: true,
    },
];

// Default mock values
const defaultAppContext = {
    campaigns: [],
    applyCampaign: jest.fn(),
    saveCampaign: jest.fn(),
    unsaveCampaign: jest.fn(),
    isCampaignSaved: jest.fn(() => false),
    fetchCampaigns: jest.fn(),
    loadingCampaigns: false,
    error: null,
    getApplication: jest.fn(() => undefined),
    fetchApplications: jest.fn(),
};

const defaultAuthContext = {
    session: { access_token: 'test-token' },
    initialized: true,
    loading: false,
};

describe('ExploreScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseApp.mockReturnValue(defaultAppContext);
        mockUseAuth.mockReturnValue(defaultAuthContext);
    });

    describe('Loading State', () => {
        it('shows skeleton when loading and no campaigns', async () => {
            mockUseApp.mockReturnValue({
                ...defaultAppContext,
                loadingCampaigns: true,
                campaigns: [],
            });

            render(<ExploreScreen />);

            await waitFor(() => {
                expect(screen.getAllByTestId('campaign-skeleton').length).toBeGreaterThan(0);
            });
        });

        it('shows auth loading message when session not ready', async () => {
            mockUseAuth.mockReturnValue({
                session: null,
                initialized: true,
                loading: true,
            });

            render(<ExploreScreen />);

            await waitFor(() => {
                expect(screen.getByText('Signing you in...')).toBeTruthy();
            });
        });
    });

    describe('Error State', () => {
        it('shows ErrorView when error occurs', async () => {
            mockUseApp.mockReturnValue({
                ...defaultAppContext,
                error: 'Failed to load campaigns',
                campaigns: [],
            });

            render(<ExploreScreen />);

            await waitFor(() => {
                expect(screen.getByTestId('error-view')).toBeTruthy();
                expect(screen.getByText('Failed to load campaigns')).toBeTruthy();
            });
        });

        it('ErrorView has retry button', async () => {
            mockUseApp.mockReturnValue({
                ...defaultAppContext,
                error: 'Network error',
                campaigns: [],
            });

            render(<ExploreScreen />);

            await waitFor(() => {
                expect(screen.getByTestId('retry-button')).toBeTruthy();
            });
        });
    });

    describe('Empty State', () => {
        it('renders empty list when no campaigns match filter', async () => {
            mockUseApp.mockReturnValue({
                ...defaultAppContext,
                campaigns: [], // No campaigns
                loadingCampaigns: false,
            });

            render(<ExploreScreen />);

            // The "For You" section should still render, just empty
            await waitFor(() => {
                expect(screen.getByText('For You')).toBeTruthy();
            });
        });
    });

    describe('Populated State', () => {
        it('renders campaign cards when campaigns exist', async () => {
            mockUseApp.mockReturnValue({
                ...defaultAppContext,
                campaigns: sampleCampaigns,
                loadingCampaigns: false,
            });

            render(<ExploreScreen />);

            await waitFor(() => {
                // Check that campaign data is rendered
                expect(screen.getByText('Nike')).toBeTruthy();
                expect(screen.getByText('Samsung')).toBeTruthy();
            });
        });

        it('displays campaign titles', async () => {
            mockUseApp.mockReturnValue({
                ...defaultAppContext,
                campaigns: sampleCampaigns,
                loadingCampaigns: false,
            });

            render(<ExploreScreen />);

            await waitFor(() => {
                expect(screen.getByText('Instagram Influencer Campaign')).toBeTruthy();
                expect(screen.getByText('YouTube Tech Review')).toBeTruthy();
            });
        });

        it('displays campaign budgets', async () => {
            mockUseApp.mockReturnValue({
                ...defaultAppContext,
                campaigns: sampleCampaigns,
                loadingCampaigns: false,
            });

            render(<ExploreScreen />);

            await waitFor(() => {
                expect(screen.getByText('$2,000')).toBeTruthy();
                expect(screen.getByText('$5,000')).toBeTruthy();
            });
        });
    });

    describe('Filter Behavior', () => {
        it('renders filter chips', async () => {
            mockUseApp.mockReturnValue({
                ...defaultAppContext,
                campaigns: sampleCampaigns,
            });

            render(<ExploreScreen />);

            await waitFor(() => {
                expect(screen.getByText('All')).toBeTruthy();
                expect(screen.getByText('Beauty')).toBeTruthy();
                expect(screen.getByText('Tech')).toBeTruthy();
                expect(screen.getByText('Fashion')).toBeTruthy();
            });
        });
    });

    describe('Header', () => {
        it('renders Discover header', async () => {
            mockUseApp.mockReturnValue(defaultAppContext);

            render(<ExploreScreen />);

            await waitFor(() => {
                expect(screen.getByText('Discover')).toBeTruthy();
            });
        });

        it('renders search input', async () => {
            mockUseApp.mockReturnValue(defaultAppContext);

            render(<ExploreScreen />);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Search campaigns, brands...')).toBeTruthy();
            });
        });
    });
});
