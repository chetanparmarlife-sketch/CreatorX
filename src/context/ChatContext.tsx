/**
 * Chat context with WebSocket integration
 * Manages real-time messaging state and WebSocket connections
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  connectWebSocket,
  disconnectWebSocket,
  subscribeToMessages,
  subscribeToConversation,
  unsubscribe,
  sendMessage as sendWebSocketMessage,
  isConnected,
} from '@/src/lib/websocket';
import { useAuth } from './AuthContext';
import { messagingService } from '@/src/api/services/messagingService';
import { adaptConversationToChatPreview, adaptMessage } from '@/src/api/adapters';
import { Message, Conversation } from '@/src/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { featureFlags } from '@/src/config/featureFlags';

interface ChatContextType {
  // State
  conversations: Conversation[];
  messages: Map<string, Message[]>; // conversationId -> messages
  unreadCount: number;
  connected: boolean;
  loading: boolean;

  // Actions
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  getConversation: (conversationId: string) => Conversation | undefined;
  getConversationMessages: (conversationId: string) => Message[];
  
  // WebSocket
  connect: () => Promise<void>;
  disconnect: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Offline message queue
const OFFLINE_QUEUE_KEY = '@offline_messages';

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Map<string, Message[]>>(new Map());
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // Connect WebSocket when authenticated
  useEffect(() => {
    if (!featureFlags.isEnabled('USE_WS_MESSAGES')) {
      disconnect();
      return;
    }
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  // Load conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
      loadUnreadCount();
    }
  }, [isAuthenticated]);

  const connect = useCallback(async () => {
    if (!user) return;

    try {
      await connectWebSocket(
        () => {
          setConnected(true);
          console.log('WebSocket connected');
          
          // Subscribe to user's message queue
          subscribeToMessages(user.id, {
            onMessage: handleIncomingMessage,
            onError: (error) => {
              console.error('Message subscription error:', error);
            },
          });

          // Process offline queue
          processOfflineQueue();
        },
        () => {
          setConnected(false);
          console.log('WebSocket disconnected');
        },
        (error) => {
          console.error('WebSocket error:', error);
          setConnected(false);
        }
      );
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnected(false);
    }
  }, [user, handleIncomingMessage]);

  const disconnect = useCallback(() => {
    disconnectWebSocket();
    setConnected(false);
  }, []);

  const handleIncomingMessage = useCallback((messageData: any) => {
    if (!user?.id || !messageData?.conversationId) return;
    const message = adaptMessage(messageData, user.id);

    // Update messages map
    setMessages((prev) => {
      const conversationMessages = prev.get(message.chatId || messageData.conversationId) || [];
      const updated = new Map(prev);
      updated.set(message.chatId || messageData.conversationId, [...conversationMessages, message]);
      return updated;
    });

    // Update conversation last message
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.chatId === message.conversationId) {
          return {
            ...conv,
            lastMessage: message.text,
            unread: message.sender === 'other' ? (conv.unread || 0) + 1 : conv.unread,
          };
        }
        return conv;
      })
    );

    // Update unread count
    if (message.sender === 'other') {
      setUnreadCount((prev) => prev + 1);
    }
  }, [user]);

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!user) return;

      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        text: content,
        sender: 'user',
        time: new Date().toISOString(),
        status: 'sending',
        chatId: conversationId,
      };

      // Add to local state immediately
      setMessages((prev) => {
        const conversationMessages = prev.get(conversationId) || [];
        const updated = new Map(prev);
        updated.set(conversationId, [...conversationMessages, tempMessage]);
        return updated;
      });

      if (connected && isConnected()) {
        // Send via WebSocket
        const success = sendWebSocketMessage(conversationId, content, 'sending');
        if (!success) {
          // Queue for offline sending
          await queueOfflineMessage(conversationId, content);
        }
      } else {
        // Queue for offline sending
        await queueOfflineMessage(conversationId, content);
      }
    },
    [user, connected]
  );

  const markAsRead = useCallback(
    async (conversationId: string) => {
      try {
        await messagingService.markConversationRead(conversationId);

        // Update local state
        setMessages((prev) => {
          const updated = new Map(prev);
          const conversationMessages = updated.get(conversationId) || [];
          updated.set(
            conversationId,
            conversationMessages.map((msg) =>
              msg.sender === 'other' ? { ...msg, status: 'read' as const } : msg
            )
          );
          return updated;
        });

        setConversations((prev) =>
          prev.map((conv) =>
            conv.chatId === conversationId ? { ...conv, unread: 0 } : conv
          )
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    },
    []
  );

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messagingService.getConversations();
      const adapted = data.map((conversation) => {
        const preview = adaptConversationToChatPreview(conversation, user?.id || '');
        const mapped: Conversation = {
          chatId: preview.id,
          name: preview.name,
          lastMessage: preview.lastMessage,
          unread: preview.unread,
          online: preview.online,
          type: preview.type,
        };
        return mapped;
      });
      setConversations(adapted);
      setUnreadCount(adapted.reduce((sum, conv) => sum + (conv.unread || 0), 0));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await messagingService.getMessages(conversationId, 0, 50);
      const items = Array.isArray(response) ? response : response.items ?? [];
      const adapted = items.map((message) => adaptMessage(message, user?.id || ''));
      setMessages((prev) => {
        const updated = new Map(prev);
        updated.set(conversationId, adapted);
        return updated;
      });

      // Subscribe to conversation topic for real-time updates
      if (connected) {
        subscribeToConversation(conversationId, {
          onMessage: handleIncomingMessage,
          onError: (error) => {
            console.error('Conversation subscription error:', error);
          },
        });
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [connected, handleIncomingMessage, user?.id]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await messagingService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, []);

  const getConversation = useCallback(
    (conversationId: string) => {
      return conversations.find((conv) => conv.chatId === conversationId);
    },
    [conversations]
  );

  const getConversationMessages = useCallback(
    (conversationId: string) => {
      return messages.get(conversationId) || [];
    },
    [messages]
  );

  // Offline queue management
  const queueOfflineMessage = async (conversationId: string, content: string) => {
    try {
      const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const messages = queue ? JSON.parse(queue) : [];
      messages.push({ conversationId, content, timestamp: Date.now() });
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to queue offline message:', error);
    }
  };

  const processOfflineQueue = async () => {
    try {
      const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!queue) return;

      const messages = JSON.parse(queue);
      for (const msg of messages) {
        if (connected && isConnected()) {
          sendWebSocketMessage(msg.conversationId, msg.content, 'sending');
        }
      }

      // Clear queue after processing
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to process offline queue:', error);
    }
  };

  const value: ChatContextType = {
    conversations,
    messages,
    unreadCount,
    connected,
    loading,
    sendMessage,
    markAsRead,
    loadConversations,
    loadMessages,
    getConversation,
    getConversationMessages,
    connect,
    disconnect,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
