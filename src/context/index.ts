/**
 * Context Exports
 * 
 * This module exports the refactored modular contexts and the legacy compatibility layer.
 * 
 * New code should use the individual hooks:
 * - useCampaign() for campaigns, applications, deliverables
 * - useWallet() for wallet, transactions, withdrawals
 * - useNotification() for notifications
 * - useMessaging() for chats and messages
 * - useProfile() for user profile and social accounts
 * 
 * Legacy code can continue using useApp() which combines all contexts.
 */

// Re-export from AppFacade for backwards compatibility
export { AppProvider, useApp } from './AppFacade';

// Export individual context providers and hooks for new code
export { NotificationProvider, useNotification, useNotifications } from './NotificationContext';
export { WalletProvider, useWallet } from './WalletContext';
export { CampaignProvider, useCampaign, useCampaigns } from './CampaignContext';
export { MessagingProvider, useMessaging } from './MessagingContext';
export { ProfileProvider, useProfile } from './ProfileContext';

// Export types
export type { ApplicationFormData } from './AppFacade';
export type { NotificationContextType } from './NotificationContext';
export type { WalletContextType } from './WalletContext';
export type { CampaignContextType } from './CampaignContext';
export type { MessagingContextType } from './MessagingContext';
export type { ProfileContextType } from './ProfileContext';

// Export utility functions
export {
    useMountedRef,
    useRunIfMounted,
    safeMergeDedupById,
    resolveHasMore,
    saveToStorage,
    loadFromStorage,
    normalizeMessages,
    STORAGE_KEYS,
} from './contextUtils';
