/**
 * MessagingContext
 * Manages chat conversations, messages, and real-time updates via polling/WebSocket
 * Extracted from AppContext.api.tsx
 */

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
    ReactNode,
} from 'react';
import { AppState } from 'react-native';
import { ChatPreview, Message, Conversation } from '@/src/types';
import { messagingService } from '@/src/api/services/messagingService';
import { adaptConversationToChatPreview, adaptMessage } from '@/src/api/adapters';
import { handleAPIError, isNetworkError, normalizeApiError } from '@/src/api/errors';
import { featureFlags, POLL_INTERVAL_MS } from '@/src/config/featureFlags';
import { API_BASE_URL_READY } from '@/src/config/env';
import { getSecureItem } from '@/src/lib/secureStore';
import { getSession } from '@/src/lib/supabase';
import { webSocketService, ThreadEvent, MessageEvent } from '@/src/services/WebSocketService';
import {
    useRunIfMounted,
    STORAGE_KEYS,
    normalizeMessages,
} from './contextUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface MessagingContextType {
    // State
    chats: ChatPreview[];
    conversations: Conversation[];
    messagesByConversation: Record<string, Message[]>;
    loadingChats: boolean;
    messagingError: string | null;
    messagingConnectionState: 'offline' | 'reconnecting' | 'connected';
    messagingUnreadCount: number;

    // Actions
    fetchConversations: () => Promise<void>;
    loadMessages: (conversationId: string, page?: number, size?: number) => Promise<void>;
    sendMessage: (chatId: string, text: string) => Promise<void>;
    getConversation: (chatId: string) => Message[];
    markChatRead: (chatId: string) => Promise<void>;

    // Polling control
    startMessagesPolling: () => void;
    stopMessagesPolling: () => void;
    startConversationPolling: (conversationId: string) => void;
    stopConversationPolling: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

interface MessagingProviderProps {
    children: ReactNode;
    userId?: string;
}

export function MessagingProvider({ children, userId = '' }: MessagingProviderProps) {
    const { isMountedRef, runIfMounted } = useRunIfMounted();

    // State
    const [chats, setChats] = useState<ChatPreview[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>({});
    const [loadingChats, setLoadingChats] = useState(false);
    const [messagingError, setMessagingError] = useState<string | null>(null);
    const [messagingConnectionState, setMessagingConnectionState] = useState<'offline' | 'reconnecting' | 'connected'>('offline');
    const [messagingUnreadCount, setMessagingUnreadCount] = useState(0);

    // Refs for polling
    const conversationsPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const conversationsPollInFlightRef = useRef(false);
    const chatListActiveRef = useRef(false);
    const activeConversationRef = useRef<string | null>(null);
    const messagesPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const messagesPollInFlightRef = useRef(false);
    const appStateRef = useRef(AppState.currentState);
    const wsThreadsUnsubRef = useRef<(() => void) | null>(null);
    const wsMessagesUnsubRef = useRef<(() => void) | null>(null);
    const wsFailedRef = useRef(false);

    /**
     * Check if we have a valid auth token
     */
    const hasAuthToken = useCallback(async (): Promise<boolean> => {
        const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (storedToken) return true;
        const session = await getSession().catch(() => null);
        return !!session?.access_token;
    }, []);

    /**
     * Resolve messaging token
     */
    const resolveMessagingToken = useCallback(async (): Promise<string | null> => {
        const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (storedToken) return storedToken;
        const session = await getSession().catch(() => null);
        return session?.access_token ?? null;
    }, []);

    /**
     * Check if WebSocket is enabled
     */
    const isWebSocketEnabled = useCallback(() => {
        return (
            featureFlags.isEnabled('USE_WS_MESSAGING') ||
            featureFlags.isEnabled('USE_WS_MESSAGES')
        );
    }, []);

    /**
     * Check if messaging polling can start
     */
    const canStartMessagingPolling = useCallback(async () => {
        if (!featureFlags.isEnabled('USE_API_MESSAGING_POLLING')) return false;
        if (!featureFlags.isEnabled('USE_POLLING_MESSAGES')) return false;
        if (!featureFlags.isEnabled('USE_API_MESSAGING')) return false;
        if (isWebSocketEnabled() && !wsFailedRef.current && webSocketService.connected) return false;
        if (!API_BASE_URL_READY) {
            runIfMounted(() => setMessagingError('Messaging unavailable in degraded mode.'));
            return false;
        }
        const token = await resolveMessagingToken();
        if (!token) {
            runIfMounted(() => setMessagingError('Login required to view messages.'));
            return false;
        }
        runIfMounted(() => setMessagingError(null));
        return true;
    }, [isWebSocketEnabled, resolveMessagingToken, runIfMounted]);

    /**
     * Check if WebSocket messaging can start
     */
    const canStartWebSocketMessaging = useCallback(async () => {
        if (!isWebSocketEnabled()) return false;
        if (!featureFlags.isEnabled('USE_API_MESSAGING')) return false;
        if (!API_BASE_URL_READY) {
            runIfMounted(() => setMessagingError('Messaging unavailable in degraded mode.'));
            return false;
        }
        const token = await resolveMessagingToken();
        if (!token) {
            runIfMounted(() => setMessagingError('Login required to view messages.'));
            return false;
        }
        runIfMounted(() => setMessagingError(null));
        return true;
    }, [isWebSocketEnabled, resolveMessagingToken, runIfMounted]);

    /**
     * Fetch conversations
     */
    const fetchConversations = useCallback(async () => {
        if (loadingChats) return;

        runIfMounted(() => setLoadingChats(true));
        try {
            if (featureFlags.isEnabled('USE_API_MESSAGING')) {
                if (!API_BASE_URL_READY) {
                    runIfMounted(() => setMessagingError('Messaging unavailable in degraded mode.'));
                    return;
                }
                if (!(await hasAuthToken())) {
                    runIfMounted(() => setMessagingError('Login required to view messages.'));
                    return;
                }

                // Chat list now loads real backend conversations instead of mock conversations.
                const apiConversations = await messagingService.getConversations();
                // Unread count now comes from the backend focus refresh endpoint instead of summing mock chat rows.
                const unreadCount = await messagingService.getUnreadCount().catch(() => null);
                const adaptedChats = apiConversations.map((conv) =>
                    adaptConversationToChatPreview(conv, userId)
                );
                runIfMounted(() => {
                    if (typeof unreadCount === 'number') {
                        setMessagingUnreadCount(unreadCount);
                    }
                    setChats((prev) => {
                        const prevById = new Map(prev.map((item) => [item.id, item]));
                        const merged = adaptedChats.map((chat) => {
                            const existing = prevById.get(chat.id);
                            if (!existing) return chat;
                            const hasNewUnread = chat.unread > existing.unread;
                            return {
                                ...chat,
                                lastMessage: chat.lastMessage || (hasNewUnread ? 'New message received' : existing.lastMessage),
                                time: chat.time || existing.time,
                                online: existing.online,
                            };
                        });
                        const mergedIds = new Set(merged.map((chat) => chat.id));
                        const extras = prev.filter((chat) => !mergedIds.has(chat.id));
                        return [...merged, ...extras];
                    });
                    setMessagingError(null);
                });
            }
        } catch (err) {
            const apiError = handleAPIError(err);
            runIfMounted(() => {
                if (apiError.code === 'AUTH_REQUIRED' || apiError.status === 401 || apiError.code === 'CONFIG_MISSING') {
                    setMessagingError(apiError.message);
                }
            });
        } finally {
            runIfMounted(() => setLoadingChats(false));
        }
    }, [loadingChats, userId, runIfMounted, hasAuthToken]);

    /**
     * Load messages for a conversation
     */
    const loadMessages = useCallback(
        async (conversationId: string, page: number = 0, size: number = 50) => {
            try {
                if (featureFlags.isEnabled('USE_API_MESSAGING')) {
                    if (!API_BASE_URL_READY) {
                        runIfMounted(() => setMessagingError('Messaging unavailable in degraded mode.'));
                        return;
                    }
                    if (!(await hasAuthToken())) {
                        runIfMounted(() => setMessagingError('Login required to view messages.'));
                        return;
                    }

                    // Conversation screen now loads real backend messages instead of a mock message array.
                    const response = await messagingService.getMessages(conversationId, page, size);
                    const items = Array.isArray(response) ? response : response.items ?? [];
                    const adapted = items.map((message) => adaptMessage(message, userId));

                    let mergedMessages: Message[] = [];
                    runIfMounted(() => {
                        setMessagesByConversation((prev) => {
                            const existing = prev[conversationId] ?? [];
                            const mergedInput = page > 0 ? [...existing, ...adapted] : [...adapted, ...existing];
                            mergedMessages = normalizeMessages(mergedInput);
                            return { ...prev, [conversationId]: mergedMessages };
                        });
                        setChats((prev) => {
                            const latest = mergedMessages[mergedMessages.length - 1];
                            if (!latest) return prev;
                            return prev.map((chat) =>
                                chat.id === conversationId
                                    ? { ...chat, lastMessage: latest.text, time: latest.time }
                                    : chat
                            );
                        });
                        setMessagingError(null);
                    });
                } else {
                    runIfMounted(() => {
                        setMessagesByConversation((prev) => ({
                            ...prev,
                            [conversationId]: normalizeMessages(prev[conversationId] ?? []),
                        }));
                    });
                }
            } catch (err) {
                const apiError = handleAPIError(err);
                runIfMounted(() => {
                    if (apiError.code === 'AUTH_REQUIRED' || apiError.status === 401 || apiError.code === 'CONFIG_MISSING') {
                        setMessagingError(apiError.message);
                    } else if (isNetworkError(apiError)) {
                        setMessagingError('Network error. Retrying messages...');
                    }
                });
                if (apiError.code === 'AUTH_REQUIRED' || apiError.status === 401) {
                    stopConversationPolling();
                }
            }
        },
        [runIfMounted, userId, hasAuthToken]
    );

    /**
     * Send message
     */
    const sendMessage = useCallback(
        async (chatId: string, text: string) => {
            try {
                if (featureFlags.isEnabled('USE_API_MESSAGING')) {
                    let adapted: Message | null = null;
                    if (isWebSocketEnabled() && webSocketService.connected) {
                        // Real-time send uses STOMP /app/chat.send; REST is only a fallback when the socket is unavailable.
                        webSocketService.sendMessage(chatId, text);
                        adapted = {
                            id: `pending-${Date.now()}`,
                            text,
                            sender: 'user',
                            time: 'Just now',
                            status: 'sending',
                            chatId,
                            conversationId: chatId,
                            createdAt: new Date().toISOString(),
                        };
                    } else {
                        // REST fallback keeps sending possible when WebSocket is reconnecting or offline.
                        const apiMessage = await messagingService.sendMessage(chatId, text);
                        adapted = adaptMessage(apiMessage, userId);
                    }

                    runIfMounted(() => {
                        setMessagesByConversation((prev) => {
                            const existing = prev[chatId] ?? [];
                            return adapted ? { ...prev, [chatId]: normalizeMessages([...existing, adapted]) } : prev;
                        });
                    });

                    runIfMounted(() =>
                        setChats((prev) =>
                            prev.map((c) =>
                                c.id === chatId ? { ...c, lastMessage: text, time: 'Just now' } : c
                            )
                        )
                    );
                } else {
                    const mockMessage: Message = {
                        id: Date.now().toString(),
                        text,
                        sender: 'user',
                        time: new Date().toLocaleTimeString(),
                        status: 'sent',
                        chatId,
                        createdAt: new Date().toISOString(),
                    };

                    runIfMounted(() => {
                        setMessagesByConversation((prev) => {
                            const existing = prev[chatId] ?? [];
                            return { ...prev, [chatId]: normalizeMessages([...existing, mockMessage]) };
                        });
                    });
                }
            } catch (err) {
                const apiError = handleAPIError(err);
                runIfMounted(() => setMessagingError(apiError.message));
                throw apiError;
            }
        },
        [runIfMounted, userId, isWebSocketEnabled]
    );

    /**
     * Get conversation messages
     */
    const getConversation = useCallback(
        (chatId: string) => normalizeMessages(messagesByConversation[chatId] ?? []),
        [messagesByConversation]
    );

    /**
     * Mark chat as read
     */
    const markChatRead = useCallback(
        async (chatId: string) => {
            runIfMounted(() => setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unread: 0 } : c))));
            runIfMounted(() => setMessagingUnreadCount((prev) => Math.max(0, prev - (chats.find((c) => c.id === chatId)?.unread ?? 0))));
            try {
                if (featureFlags.isEnabled('USE_API_MESSAGING')) {
                    await messagingService.markConversationRead(chatId);
                }
            } catch (err) {
                console.error('Error marking chat read:', err);
            }
        },
        [chats, runIfMounted]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Polling & WebSocket Logic
    // ─────────────────────────────────────────────────────────────────────────

    const stopMessagesPolling = useCallback(() => {
        if (conversationsPollRef.current) {
            clearInterval(conversationsPollRef.current);
            conversationsPollRef.current = null;
        }
        conversationsPollInFlightRef.current = false;
        chatListActiveRef.current = false;
        if (wsThreadsUnsubRef.current) {
            wsThreadsUnsubRef.current();
            wsThreadsUnsubRef.current = null;
        }
        if (!activeConversationRef.current) {
            webSocketService.disconnect();
            wsFailedRef.current = false;
        }
    }, []);

    const stopConversationPolling = useCallback(() => {
        if (messagesPollRef.current) {
            clearInterval(messagesPollRef.current);
            messagesPollRef.current = null;
        }
        messagesPollInFlightRef.current = false;
        activeConversationRef.current = null;
        if (wsMessagesUnsubRef.current) {
            wsMessagesUnsubRef.current();
            wsMessagesUnsubRef.current = null;
        }
        if (!chatListActiveRef.current) {
            webSocketService.disconnect();
            wsFailedRef.current = false;
        }
    }, []);

    const stopPollingIntervalsOnly = useCallback(() => {
        if (conversationsPollRef.current) {
            clearInterval(conversationsPollRef.current);
            conversationsPollRef.current = null;
        }
        if (messagesPollRef.current) {
            clearInterval(messagesPollRef.current);
            messagesPollRef.current = null;
        }
    }, []);

    const upsertChatPreview = useCallback(
        (conversation: Conversation) => {
            const adapted = adaptConversationToChatPreview(conversation, userId);
            runIfMounted(() => {
                setChats((prev) => {
                    const prevById = new Map(prev.map((item) => [item.id, item]));
                    const existing = prevById.get(adapted.id);
                    if (!existing) {
                        return [adapted, ...prev];
                    }
                    const hasNewUnread = adapted.unread > existing.unread;
                    return prev.map((chat) =>
                        chat.id === adapted.id
                            ? {
                                ...adapted,
                                lastMessage: adapted.lastMessage || (hasNewUnread ? 'New message received' : existing.lastMessage),
                                time: adapted.time || existing.time,
                                online: existing.online,
                            }
                            : chat
                    );
                });
            });
        },
        [runIfMounted, userId]
    );

    const handleThreadEvent = useCallback(
        (event: ThreadEvent) => {
            const conversation = 'thread' in event ? event.thread : event;
            if (!conversation?.id) return;
            upsertChatPreview(conversation);
        },
        [upsertChatPreview]
    );

    const handleMessageEvent = useCallback(
        (event: MessageEvent) => {
            if (!event?.conversationId) return;
            const adapted = adaptMessage(event, userId);
            runIfMounted(() => {
                setMessagesByConversation((prev) => {
                    const existing = prev[adapted.chatId] ?? [];
                    const merged = normalizeMessages([...existing, adapted]);
                    return { ...prev, [adapted.chatId]: merged };
                });
                setChats((prev) =>
                    prev.map((chat) => {
                        if (chat.id !== adapted.chatId) return chat;
                        const shouldIncrementUnread =
                            adapted.sender === 'other' && activeConversationRef.current !== adapted.chatId;
                        return {
                            ...chat,
                            lastMessage: adapted.text,
                            time: adapted.time,
                            unread: shouldIncrementUnread ? chat.unread + 1 : chat.unread,
                        };
                    })
                );
                if (adapted.sender === 'other' && activeConversationRef.current !== adapted.chatId) {
                    // Incoming backend messages update the unread total used by the chat badge data layer.
                    setMessagingUnreadCount((prev) => prev + 1);
                }
            });
        },
        [runIfMounted, userId]
    );

    const startMessagesPollingInterval = useCallback(() => {
        chatListActiveRef.current = true;
        if (conversationsPollRef.current) return;

        const start = async () => {
            if (!(await canStartMessagingPolling())) {
                stopMessagesPolling();
                return;
            }

            const poll = async () => {
                if (!isMountedRef.current) return;
                if (!chatListActiveRef.current) return;
                if (appStateRef.current !== 'active') return;
                if (!(await canStartMessagingPolling())) {
                    stopMessagesPolling();
                    return;
                }
                if (conversationsPollInFlightRef.current) return;
                conversationsPollInFlightRef.current = true;
                try {
                    await fetchConversations();
                    if (__DEV__) {
                        console.log('[Messaging] Conversations polled', new Date().toISOString());
                    }
                } finally {
                    conversationsPollInFlightRef.current = false;
                }
            };

            if (__DEV__) {
                console.log('[Messaging] Start conversations polling');
            }
            poll();
            conversationsPollRef.current = setInterval(poll, POLL_INTERVAL_MS);
        };

        void start();
    }, [canStartMessagingPolling, fetchConversations, stopMessagesPolling, isMountedRef]);

    const startWebSocketThreads = useCallback(() => {
        chatListActiveRef.current = true;
        if (wsThreadsUnsubRef.current) return;

        const start = async () => {
            if (!(await canStartWebSocketMessaging())) {
                runIfMounted(() => setMessagingConnectionState('offline'));
                wsFailedRef.current = true;
                startMessagesPollingInterval();
                return;
            }

            const token = await resolveMessagingToken();
            if (!token) {
                runIfMounted(() => setMessagingConnectionState('offline'));
                wsFailedRef.current = true;
                startMessagesPollingInterval();
                return;
            }

            try {
                runIfMounted(() => setMessagingConnectionState('reconnecting'));
                await webSocketService.connect(token);
                if (webSocketService.connected && !wsThreadsUnsubRef.current) {
                    wsThreadsUnsubRef.current = webSocketService.subscribeToThreads((event) => {
                        // Backend user queue sends message events, so update messages directly when no thread wrapper exists.
                        if ('conversationId' in (event as any)) {
                            handleMessageEvent(event as unknown as MessageEvent);
                            return;
                        }
                        handleThreadEvent(event);
                    });
                }
                if (webSocketService.connected) {
                    runIfMounted(() => setMessagingConnectionState('connected'));
                }
                wsFailedRef.current = false;
            } catch (error) {
                wsFailedRef.current = true;
                const apiError = normalizeApiError(error);
                runIfMounted(() => setMessagingError(apiError.message));
                runIfMounted(() => setMessagingConnectionState('reconnecting'));
                startMessagesPollingInterval();
            }
        };

        void start();
    }, [canStartWebSocketMessaging, handleThreadEvent, resolveMessagingToken, runIfMounted, startMessagesPollingInterval]);

    const startMessagesPolling = useCallback(() => {
        chatListActiveRef.current = true;
        if (isWebSocketEnabled() && !wsFailedRef.current) {
            return startWebSocketThreads();
        }
        return startMessagesPollingInterval();
    }, [isWebSocketEnabled, startMessagesPollingInterval, startWebSocketThreads]);

    const startConversationPollingInterval = useCallback(
        (conversationId: string) => {
            if (!conversationId) return;
            if (activeConversationRef.current !== conversationId) {
                stopConversationPolling();
                activeConversationRef.current = conversationId;
            }
            if (messagesPollRef.current) return;

            const start = async () => {
                if (!(await canStartMessagingPolling())) {
                    stopConversationPolling();
                    return;
                }

                const poll = async () => {
                    if (!isMountedRef.current) return;
                    if (appStateRef.current !== 'active') return;
                    if (!(await canStartMessagingPolling())) {
                        stopConversationPolling();
                        return;
                    }
                    if (messagesPollInFlightRef.current) return;
                    messagesPollInFlightRef.current = true;
                    try {
                        await loadMessages(conversationId, 0, 50);
                        if (__DEV__) {
                            console.log('[Messaging] Messages polled', new Date().toISOString());
                        }
                    } finally {
                        messagesPollInFlightRef.current = false;
                    }
                };

                if (__DEV__) {
                    console.log('[Messaging] Start conversation polling', conversationId);
                }
                poll();
                messagesPollRef.current = setInterval(poll, POLL_INTERVAL_MS);
            };

            void start();
        },
        [canStartMessagingPolling, loadMessages, stopConversationPolling, isMountedRef]
    );

    const startWebSocketConversation = useCallback(
        (conversationId: string) => {
            if (!conversationId) return;
            if (activeConversationRef.current !== conversationId) {
                stopConversationPolling();
                activeConversationRef.current = conversationId;
            }
            if (wsMessagesUnsubRef.current) return;

            const start = async () => {
                if (!(await canStartWebSocketMessaging())) {
                    runIfMounted(() => setMessagingConnectionState('offline'));
                    wsFailedRef.current = true;
                    startConversationPollingInterval(conversationId);
                    return;
                }

                const token = await resolveMessagingToken();
                if (!token) {
                    runIfMounted(() => setMessagingConnectionState('offline'));
                    wsFailedRef.current = true;
                    startConversationPollingInterval(conversationId);
                    return;
                }

                try {
                    runIfMounted(() => setMessagingConnectionState('reconnecting'));
                    await webSocketService.connect(token);
                    if (webSocketService.connected && !wsMessagesUnsubRef.current) {
                        wsMessagesUnsubRef.current = webSocketService.subscribeToThreadMessages(conversationId, handleMessageEvent);
                    }
                    if (webSocketService.connected) {
                        runIfMounted(() => setMessagingConnectionState('connected'));
                    }
                    wsFailedRef.current = false;
                } catch (error) {
                    wsFailedRef.current = true;
                    const apiError = normalizeApiError(error);
                    runIfMounted(() => setMessagingError(apiError.message));
                    runIfMounted(() => setMessagingConnectionState('reconnecting'));
                    startConversationPollingInterval(conversationId);
                }
            };

            void start();
        },
        [canStartWebSocketMessaging, handleMessageEvent, resolveMessagingToken, runIfMounted, startConversationPollingInterval, stopConversationPolling]
    );

    const startConversationPolling = useCallback(
        (conversationId: string) => {
            if (!conversationId) return;
            if (isWebSocketEnabled() && !wsFailedRef.current) {
                return startWebSocketConversation(conversationId);
            }
            return startConversationPollingInterval(conversationId);
        },
        [isWebSocketEnabled, startConversationPollingInterval, startWebSocketConversation]
    );

    // AppState listener
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            appStateRef.current = state;
            if (state !== 'active') {
                stopMessagesPolling();
                stopConversationPolling();
                webSocketService.disconnect();
                return;
            }
            if (chatListActiveRef.current) {
                startMessagesPolling();
            }
            if (activeConversationRef.current) {
                startConversationPolling(activeConversationRef.current);
            }
        });

        return () => subscription.remove();
    }, [startConversationPolling, startMessagesPolling, stopMessagesPolling, stopConversationPolling]);

    // WebSocket event listeners
    useEffect(() => {
        const unsubscribeError = webSocketService.onError((error) => {
            const apiError = normalizeApiError(error);
            wsFailedRef.current = true;
            runIfMounted(() => setMessagingError(apiError.message));
            runIfMounted(() => setMessagingConnectionState('reconnecting'));
            if (chatListActiveRef.current) {
                startMessagesPollingInterval();
            }
            if (activeConversationRef.current) {
                startConversationPollingInterval(activeConversationRef.current);
            }
        });

        const unsubscribeDisconnect = webSocketService.onDisconnect(() => {
            wsThreadsUnsubRef.current = null;
            wsMessagesUnsubRef.current = null;
            runIfMounted(() => setMessagingConnectionState('reconnecting'));
            if (chatListActiveRef.current) {
                startMessagesPollingInterval();
            }
            if (activeConversationRef.current) {
                startConversationPollingInterval(activeConversationRef.current);
            }
        });

        const unsubscribeConnect = webSocketService.onConnect(() => {
            wsFailedRef.current = false;
            runIfMounted(() => setMessagingConnectionState('connected'));
            stopPollingIntervalsOnly();
            if (chatListActiveRef.current && !wsThreadsUnsubRef.current) {
                wsThreadsUnsubRef.current = webSocketService.subscribeToThreads((event) => {
                    // Backend user queue sends message events, so update messages directly when no thread wrapper exists.
                    if ('conversationId' in (event as any)) {
                        handleMessageEvent(event as unknown as MessageEvent);
                        return;
                    }
                    handleThreadEvent(event);
                });
            }
            if (activeConversationRef.current && !wsMessagesUnsubRef.current) {
                wsMessagesUnsubRef.current = webSocketService.subscribeToThreadMessages(
                    activeConversationRef.current,
                    handleMessageEvent
                );
            }
        });

        return () => {
            unsubscribeError();
            unsubscribeDisconnect();
            unsubscribeConnect();
        };
    }, [handleMessageEvent, handleThreadEvent, runIfMounted, startConversationPollingInterval, startMessagesPollingInterval, stopPollingIntervalsOnly]);

    // Context value
    const value: MessagingContextType = {
        chats,
        conversations,
        messagesByConversation,
        loadingChats,
        messagingError,
        messagingConnectionState,
        messagingUnreadCount,
        fetchConversations,
        loadMessages,
        sendMessage,
        getConversation,
        markChatRead,
        startMessagesPolling,
        stopMessagesPolling,
        startConversationPolling,
        stopConversationPolling,
    };

    return (
        <MessagingContext.Provider value={value}>
            {children}
        </MessagingContext.Provider>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useMessaging(): MessagingContextType {
    const context = useContext(MessagingContext);
    if (context === undefined) {
        throw new Error('useMessaging must be used within a MessagingProvider');
    }
    return context;
}
