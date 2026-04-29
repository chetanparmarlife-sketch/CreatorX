/**
 * WebSocket client for real-time messaging
 * Uses STOMP over WebSocket protocol
 */

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { STORAGE_KEYS, API_BASE_URL, WS_BASE_URL } from '@/src/config/env';
import { getSecureItem } from '@/src/lib/secureStore';

let stompClient: Client | null = null;
let subscriptions: Map<string, StompSubscription> = new Map();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000; // 3 seconds

export interface MessageHandler {
  onMessage: (message: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Initialize WebSocket connection
 */
export async function connectWebSocket(
  onConnect?: () => void,
  onDisconnect?: () => void,
  onError?: (error: Error) => void
): Promise<Client | null> {
  if (stompClient?.connected) {
    return stompClient;
  }

  try {
    const token = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      throw new Error('No access token available');
    }

    // Use configured WebSocket URL so real backend connections do not depend on hardcoded localhost.
    let wsUrl = WS_BASE_URL;
    
    // Fallback: Convert the configured API URL to WebSocket URL if WS_BASE_URL is not set.
    if (!wsUrl) {
      let baseUrl = API_BASE_URL.replace('/api/v1', '');
      if (baseUrl.startsWith('http://')) {
        wsUrl = baseUrl.replace('http://', 'ws://') + '/ws';
      } else if (baseUrl.startsWith('https://')) {
        wsUrl = baseUrl.replace('https://', 'wss://') + '/ws';
      }
    }

    stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: RECONNECT_DELAY,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log('WebSocket connected:', frame);
        reconnectAttempts = 0;
        onConnect?.();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        subscriptions.clear();
        onDisconnect?.();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        onError?.(new Error(frame.headers['message'] || 'STOMP error'));
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        onError?.(new Error('WebSocket connection error'));
      },
      beforeConnect: async () => {
        // Refresh token if needed
        const currentToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (currentToken && stompClient) {
          stompClient.configure({
            connectHeaders: {
              Authorization: `Bearer ${currentToken}`,
            },
          });
        }
      },
    });

    await stompClient.activate();
    return stompClient;
  } catch (error: any) {
    console.error('Failed to connect WebSocket:', error);
    onError?.(error);
    return null;
  }
}

/**
 * Disconnect WebSocket
 */
export function disconnectWebSocket(): void {
  if (stompClient?.connected) {
    subscriptions.forEach((sub) => sub.unsubscribe());
    subscriptions.clear();
    stompClient.deactivate();
  }
  stompClient = null;
}

/**
 * Subscribe to user's message queue
 */
export function subscribeToMessages(
  userId: string,
  handler: MessageHandler
): StompSubscription | null {
  if (!stompClient?.connected) {
    console.error('WebSocket not connected');
    handler.onError?.(new Error('WebSocket not connected'));
    return null;
  }

  const destination = '/user/queue/messages';
  const subscription = stompClient.subscribe(destination, (message: IMessage) => {
    try {
      const data = JSON.parse(message.body);
      handler.onMessage(data);
    } catch (error: any) {
      console.error('Error parsing message:', error);
      handler.onError?.(error);
    }
  });

  subscriptions.set(destination, subscription);
  console.log('Subscribed to:', destination);
  return subscription;
}

/**
 * Subscribe to conversation topic
 */
export function subscribeToConversation(
  conversationId: string,
  handler: MessageHandler
): StompSubscription | null {
  if (!stompClient?.connected) {
    console.error('WebSocket not connected');
    handler.onError?.(new Error('WebSocket not connected'));
    return null;
  }

  const destination = `/topic/conversation/${conversationId}`;
  const subscription = stompClient.subscribe(destination, (message: IMessage) => {
    try {
      const data = JSON.parse(message.body);
      handler.onMessage(data);
    } catch (error: any) {
      console.error('Error parsing message:', error);
      handler.onError?.(error);
    }
  });

  subscriptions.set(destination, subscription);
  console.log('Subscribed to:', destination);
  return subscription;
}

/**
 * Unsubscribe from destination
 */
export function unsubscribe(destination: string): void {
  const subscription = subscriptions.get(destination);
  if (subscription) {
    subscription.unsubscribe();
    subscriptions.delete(destination);
    console.log('Unsubscribed from:', destination);
  }
}

/**
 * Send message via WebSocket
 */
export function sendMessage(
  conversationId: string,
  content: string,
  deliveryStatus: string = 'sending'
): boolean {
  if (!stompClient?.connected) {
    console.error('WebSocket not connected');
    return false;
  }

  try {
    const message = {
      conversationId,
      content,
      deliveryStatus,
    };

    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message),
    });

    console.log('Message sent to conversation:', conversationId);
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
}

/**
 * Check if WebSocket is connected
 */
export function isConnected(): boolean {
  return stompClient?.connected ?? false;
}

/**
 * Get WebSocket client instance
 */
export function getClient(): Client | null {
  return stompClient;
}
