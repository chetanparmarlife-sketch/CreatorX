/**
 * AppFacade - Compatibility Layer
 * Wraps all sub-contexts and provides the legacy useApp() hook
 * Maintains backward compatibility with existing screens
 */

import React, { ReactNode, useCallback } from 'react';

// Import sub-contexts
import { NotificationProvider, useNotification } from './NotificationContext';
import { WalletProvider, useWallet } from './WalletContext';
import { CampaignProvider, useCampaign, ApplicationFormData } from './CampaignContext';
import { MessagingProvider, useMessaging } from './MessagingContext';
import { ProfileProvider, useProfile } from './ProfileContext';

// ─────────────────────────────────────────────────────────────────────────────
// AppProvider - Wraps all sub-providers
// ─────────────────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
    return (
        <ProfileProvider>
            <NotificationProvider>
                <WalletProvider>
                    <CampaignProvider>
                        <MessagingProviderWrapper>
                            {children}
                        </MessagingProviderWrapper>
                    </CampaignProvider>
                </WalletProvider>
            </NotificationProvider>
        </ProfileProvider>
    );
}

/**
 * Wrapper component that passes userId to MessagingProvider
 */
function MessagingProviderWrapper({ children }: { children: ReactNode }) {
    const { user } = useProfile();
    return (
        <MessagingProvider userId={user.id}>
            {children}
        </MessagingProvider>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// useApp - Legacy compatibility hook
// ─────────────────────────────────────────────────────────────────────────────

export function useApp() {
    const notification = useNotification();
    const wallet = useWallet();
    const campaign = useCampaign();
    const messaging = useMessaging();
    const profile = useProfile();

    // RefreshData combines all context refresh functions
    const refreshData = useCallback(async () => {
        await Promise.all([
            notification.refreshNotifications(),
            wallet.refreshWalletAll(),
            campaign.fetchCampaigns({}, true),
            campaign.fetchApplications(),
            messaging.fetchConversations(),
        ]);
    }, [notification, wallet, campaign, messaging]);

    // ResetAppState - clears all context state from storage
    const resetAppState = useCallback(async () => {
        console.log('[AppFacade] resetAppState called - clearing cached state');
        try {
            // Import AsyncStorage and cacheUtils for cleanup
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            const { cacheUtils } = await import('@/src/api/utils/cache');

            // Clear all cached app state from AsyncStorage
            const keysToRemove = [
                '@user_profile',
                '@wallet',
                '@campaigns',
                '@saved_campaigns',
                '@notifications',
                '@creator_social_accounts',
                '@active_campaigns',
                '@applications',
                '@chats',
                '@conversations',
                '@transactions',
                '@withdrawals',
            ];

            await AsyncStorage.multiRemove(keysToRemove);

            // Clear in-memory API cache
            await cacheUtils.clear();

            console.log('[AppFacade] App state cleared successfully');
        } catch (error) {
            console.error('[AppFacade] Error clearing app state:', error);
        }
    }, []);

    // Combine all context values into the legacy shape
    return {
        // Profile context
        user: profile.user,
        darkMode: profile.darkMode,
        isLoading: profile.isLoading,
        updateUser: profile.updateUser,
        toggleDarkMode: profile.toggleDarkMode,
        copyReferralCode: profile.copyReferralCode,

        // Social accounts from profile
        socialAccounts: profile.socialAccounts,
        socialAccountsLoading: profile.socialAccountsLoading,
        socialAccountsError: profile.socialAccountsError,
        fetchSocialAccounts: profile.fetchSocialAccounts,
        refreshSocialAccount: profile.refreshSocialAccount,
        disconnectSocialAccount: profile.disconnectSocialAccount,
        getSocialConnectUrl: profile.getSocialConnectUrl,

        // Messaging context
        chats: messaging.chats,
        conversations: messaging.conversations,
        messagesByConversation: messaging.messagesByConversation,
        messagingError: messaging.messagingError,
        loadingChats: messaging.loadingChats,
        sendMessage: messaging.sendMessage,
        getConversation: messaging.getConversation,
        markChatRead: messaging.markChatRead,
        fetchConversations: messaging.fetchConversations,
        loadMessages: messaging.loadMessages,
        startMessagesPolling: messaging.startMessagesPolling,
        stopMessagesPolling: messaging.stopMessagesPolling,
        startConversationPolling: messaging.startConversationPolling,
        stopConversationPolling: messaging.stopConversationPolling,

        // Campaign context
        campaigns: campaign.campaigns,
        savedCampaigns: campaign.savedCampaigns,
        applications: campaign.applications,
        activeCampaigns: campaign.activeCampaigns,
        deliverables: campaign.deliverables,
        campaignsHasMore: campaign.campaignsHasMore,
        campaignsTotal: campaign.campaignsTotal,
        loadingCampaigns: campaign.loadingCampaigns,
        loadingApplications: campaign.loadingApplications,
        error: campaign.campaignError,
        fetchCampaigns: campaign.fetchCampaigns,
        loadMoreCampaigns: campaign.loadMoreCampaigns,
        getCampaignById: campaign.getCampaignById,
        fetchCampaignById: campaign.fetchCampaignById,
        saveCampaign: campaign.saveCampaign,
        unsaveCampaign: campaign.unsaveCampaign,
        isCampaignSaved: campaign.isCampaignSaved,
        updateCampaignStatus: campaign.updateCampaignStatus,
        applyCampaign: campaign.applyCampaign,
        getApplication: campaign.getApplication,
        withdrawApplication: campaign.withdrawApplication,
        fetchApplications: campaign.fetchApplications,
        approveApplication: campaign.approveApplication,
        rejectApplication: campaign.rejectApplication,
        updateActiveCampaign: campaign.updateActiveCampaign,
        completeCampaign: campaign.completeCampaign,
        processPayment: campaign.processPayment,
        addDeliverable: campaign.addDeliverable,
        updateDeliverable: campaign.updateDeliverable,
        submitDeliverable: campaign.submitDeliverable,
        approveDeliverable: campaign.approveDeliverable,
        requestDeliverableChanges: campaign.requestDeliverableChanges,
        markDeliverablePosted: campaign.markDeliverablePosted,

        // Wallet context
        wallet: wallet.wallet,
        transactions: wallet.transactions,
        withdrawals: wallet.withdrawals,
        walletLoading: wallet.walletLoading,
        loadingWallet: wallet.walletLoading,
        transactionsLoading: wallet.transactionsLoading,
        withdrawalsLoading: wallet.withdrawalsLoading,
        walletError: wallet.walletError,
        transactionsError: wallet.transactionsError,
        withdrawalsError: wallet.withdrawalsError,
        transactionsHasMore: wallet.transactionsHasMore,
        transactionsPage: wallet.transactionsPage,
        withdrawalsHasMore: wallet.withdrawalsHasMore,
        withdrawalsPage: wallet.withdrawalsPage,
        fetchWalletSummary: wallet.fetchWalletSummary,
        fetchTransactions: wallet.fetchTransactions,
        fetchWithdrawals: wallet.fetchWithdrawals,
        refreshWalletAll: wallet.refreshWalletAll,

        // Notification context
        notifications: notification.notifications,
        unreadNotifications: notification.unreadNotificationCount,
        unreadNotificationCount: notification.unreadNotificationCount,
        notificationsHasMore: notification.notificationsHasMore,
        notificationsPage: notification.notificationsPage,
        loadingNotifications: notification.loadingNotifications,
        notificationsError: notification.notificationsError,
        markNotificationRead: notification.markNotificationRead,
        markAllNotificationsRead: notification.markAllNotificationsRead,
        addNotification: notification.addNotification,
        fetchNotifications: notification.fetchNotifications,
        fetchUnreadNotificationCount: notification.fetchUnreadNotificationCount,

        // Combined actions
        refreshData,
        resetAppState,
    };
}

// Re-export ApplicationFormData for compatibility
export type { ApplicationFormData };
