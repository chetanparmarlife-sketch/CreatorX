/**
 * Shared utilities for context modules
 * Extracted from AppContext.api.tsx for reuse across modular contexts
 */

import { useRef, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeParseJSON } from '@/src/storage/serialization';
import { cacheUtils } from '@/src/api/utils/cache';

// Re-export safeParseJSON for convenience
export { safeParseJSON };

/**
 * Storage keys used across contexts
 */
export const STORAGE_KEYS = {
    USER: '@user_profile',
    WALLET: '@wallet',
    CAMPAIGNS: '@campaigns',
    SAVED_CAMPAIGNS: '@saved_campaigns',
    NOTIFICATIONS: '@notifications',
    SOCIAL_ACCOUNTS: '@creator_social_accounts',
    DARK_MODE: '@dark_mode',
    ACTIVE_CAMPAIGNS: '@active_campaigns',
    APPLICATIONS: '@applications',
    ACCESS_TOKEN: '@access_token',
    CHATS: '@chats',
    CONVERSATIONS: '@conversations',
    TRANSACTIONS: '@transactions',
    WITHDRAWALS: '@withdrawals',
} as const;

/**
 * Hook to track component mount state
 * Returns a ref that is true while mounted, false after unmount
 */
export function useMountedRef() {
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    return isMountedRef;
}

/**
 * Hook that returns a function to safely run callbacks only if mounted
 * Prevents "setState on unmounted component" warnings
 */
export function useRunIfMounted() {
    const isMountedRef = useMountedRef();

    const runIfMounted = useCallback((fn: () => void) => {
        if (isMountedRef.current) {
            fn();
        }
    }, []);

    return { isMountedRef, runIfMounted };
}

/**
 * Merge two arrays, deduplicating by ID
 * Preserves newer items (later in the merged array) when duplicates exist
 */
export function safeMergeDedupById<T extends { id: string }>(
    existing: T[],
    incoming: T[]
): T[] {
    const byId = new Map<string, T>();

    // Add existing items first
    for (const item of existing) {
        byId.set(item.id, item);
    }

    // Incoming items override existing (newer data)
    for (const item of incoming) {
        byId.set(item.id, item);
    }

    return Array.from(byId.values());
}

/**
 * Resolve hasMore pagination flag from API response
 * Handles various response shapes
 */
export function resolveHasMore(
    response: { content?: unknown[]; totalPages?: number; last?: boolean; hasMore?: boolean } | unknown[],
    currentPage: number,
    pageSize: number = 20
): boolean {
    // If response is an array, check if we got a full page
    if (Array.isArray(response)) {
        return response.length >= pageSize;
    }

    // Spring Page response
    if (typeof response === 'object' && response !== null) {
        if ('last' in response && typeof response.last === 'boolean') {
            return !response.last;
        }
        if ('hasMore' in response && typeof response.hasMore === 'boolean') {
            return response.hasMore;
        }
        if ('totalPages' in response && typeof response.totalPages === 'number') {
            return currentPage + 1 < response.totalPages;
        }
        if ('content' in response && Array.isArray(response.content)) {
            return response.content.length >= pageSize;
        }
    }

    return false;
}

/**
 * Storage helper: save to AsyncStorage with JSON serialization
 */
export async function saveToStorage<T>(key: string, value: T): Promise<void> {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`[Storage] Failed to save ${key}:`, error);
    }
}

/**
 * Storage helper: load from AsyncStorage with JSON parsing
 */
export async function loadFromStorage<T>(key: string, defaultValue: T): Promise<T> {
    try {
        const raw = await AsyncStorage.getItem(key);
        if (raw === null) return defaultValue;
        return safeParseJSON<T>(raw, defaultValue);
    } catch (error) {
        console.error(`[Storage] Failed to load ${key}:`, error);
        return defaultValue;
    }
}

/**
 * Storage helper: remove from AsyncStorage
 */
export async function removeFromStorage(key: string): Promise<void> {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error(`[Storage] Failed to remove ${key}:`, error);
    }
}

/**
 * Cache helper: save to API cache
 */
export async function saveToCache<T>(key: string, value: T): Promise<void> {
    try {
        await cacheUtils.set(key, value);
    } catch (error) {
        console.error(`[Cache] Failed to save ${key}:`, error);
    }
}

/**
 * Cache helper: load from API cache
 */
export async function loadFromCache<T>(key: string): Promise<T | null> {
    try {
        return await cacheUtils.get<T>(key);
    } catch (error) {
        console.error(`[Cache] Failed to load ${key}:`, error);
        return null;
    }
}

/**
 * Get timestamp from a message for sorting/deduplication
 */
export function getMessageTimestamp(message: { createdAt?: string }): number | null {
    if (!message.createdAt) return null;
    const timestamp = Date.parse(message.createdAt);
    return Number.isNaN(timestamp) ? null : timestamp;
}

/**
 * Normalize and deduplicate messages, keeping the latest version of each
 */
export function normalizeMessages<T extends { id: string; createdAt?: string }>(
    messages: T[]
): T[] {
    const byId = new Map<string, { message: T; index: number }>();

    messages.forEach((message, index) => {
        const existing = byId.get(message.id);
        if (!existing) {
            byId.set(message.id, { message, index });
            return;
        }

        const existingTs = getMessageTimestamp(existing.message);
        const incomingTs = getMessageTimestamp(message);

        if (incomingTs !== null && (existingTs === null || incomingTs > existingTs)) {
            byId.set(message.id, { message, index: existing.index });
        }
    });

    const items = Array.from(byId.values());
    items.sort((a, b) => {
        const aTs = getMessageTimestamp(a.message);
        const bTs = getMessageTimestamp(b.message);

        if (aTs !== null && bTs !== null) {
            if (aTs !== bTs) return aTs - bTs;
            return a.index - b.index;
        }

        if (aTs !== null) return -1;
        if (bTs !== null) return 1;
        return a.index - b.index;
    });

    return items.map((item) => item.message);
}

/**
 * Default page size for paginated APIs
 */
export const DEFAULT_PAGE_SIZE = 20;
