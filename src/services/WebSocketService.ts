/**
 * WebSocket Service for real-time messaging
 * Uses STOMP over WebSocket protocol
 */

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
  deliveryStatus?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
}

export type MessageHandler = (message: Message) => void;
export type ErrorHandler = (error: Error) => void;
export type ConnectionHandler = () => void;

class WebSocketService {
  private client: Client | null = null;
  private messageSubscription: StompSubscription | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000; // 3 seconds
  private messageHandlers: Map<string, MessageHandler> = new Map();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();

  /**
   * Get WebSocket URL based on environment
   */
  private getWebSocketUrl(): string {
    // Import WS_BASE_URL from env config
    // @ts-ignore - Dynamic import to avoid circular dependency
    const { WS_BASE_URL } = require('@/src/config/env');
    
    if (WS_BASE_URL && WS_BASE_URL !== 'ws://localhost:8080/ws') {
      return WS_BASE_URL;
    }
    
    // Fallback for local development
    const baseUrl = __DEV__
      ? 'ws://localhost:8080'
      : 'wss://api.creatorx.com'; // Production URL
    
    return `${baseUrl}/ws`;
  }

  /**
   * Get JWT token from AsyncStorage
   */
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to get token from storage:', error);
      return null;
    }
  }

  /**
   * Connect to WebSocket
   */
  async connect(): Promise<void> {
    if (this.client && this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    const token = await this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const wsUrl = this.getWebSocketUrl();
    console.log('Connecting to WebSocket:', wsUrl);

    this.client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (__DEV__) {
          console.log('STOMP:', str);
        }
      },
      onConnect: () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.subscribe();
        this.connectionHandlers.forEach((handler) => handler());
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.handleError(new Error(frame.headers['message'] || 'STOMP error'));
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        this.handleError(new Error('WebSocket connection error'));
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.messageSubscription = null;
        this.attemptReconnect();
      },
    });

    try {
      this.client.activate();
    } catch (error) {
      console.error('Failed to activate WebSocket client:', error);
      this.handleError(error as Error);
    }
  }

  /**
   * Subscribe to user's message queue
   */
  private subscribe(): void {
    if (!this.client || !this.isConnected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    try {
      this.messageSubscription = this.client.subscribe(
        '/user/queue/messages',
        (message: IMessage) => {
          try {
            const messageData: Message = JSON.parse(message.body);
            console.log('Received message:', messageData);
            
            // Notify all handlers
            this.messageHandlers.forEach((handler) => {
              try {
                handler(messageData);
              } catch (error) {
                console.error('Error in message handler:', error);
              }
            });
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        },
        {
          id: `sub-${Date.now()}`,
        }
      );
      console.log('Subscribed to /user/queue/messages');
    } catch (error) {
      console.error('Failed to subscribe to messages:', error);
      this.handleError(error as Error);
    }
  }

  /**
   * Send message via WebSocket
   */
  sendMessage(conversationId: string, content: string): void {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const message: SendMessageRequest = {
      conversationId,
      content,
    };

    try {
      this.client.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(message),
      });
      console.log('Message sent:', message);
    } catch (error) {
      console.error('Failed to send message:', error);
      this.handleError(error as Error);
    }
  }

  /**
   * Subscribe to conversation topic for real-time updates
   */
  subscribeToConversation(
    conversationId: string,
    onMessage: MessageHandler,
    onError?: ErrorHandler
  ): StompSubscription | null {
    if (!this.client || !this.isConnected) {
      console.warn('Cannot subscribe to conversation: WebSocket not connected');
      return null;
    }

    try {
      const subscription = this.client.subscribe(
        `/topic/conversation/${conversationId}`,
        (message: IMessage) => {
          try {
            const messageData: Message = JSON.parse(message.body);
            onMessage(messageData);
          } catch (error) {
            console.error('Failed to parse conversation message:', error);
            if (onError) {
              onError(error as Error);
            }
          }
        }
      );
      console.log(`Subscribed to conversation: ${conversationId}`);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to conversation:', error);
      if (onError) {
        onError(error as Error);
      }
      return null;
    }
  }

  /**
   * Unsubscribe from conversation
   */
  unsubscribeFromConversation(subscription: StompSubscription): void {
    if (subscription) {
      subscription.unsubscribe();
      console.log('Unsubscribed from conversation');
    }
  }

  /**
   * Add message handler
   */
  onMessage(handler: MessageHandler): () => void {
    const id = `handler-${Date.now()}-${Math.random()}`;
    this.messageHandlers.set(id, handler);
    
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(id);
    };
  }

  /**
   * Add error handler
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Add connection handler
   */
  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    
    // Return unsubscribe function
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error);
      } catch (err) {
        console.error('Error in error handler:', err);
      }
    });
  }

  /**
   * Attempt to reconnect
   */
  private async attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.handleError(new Error('Max reconnect attempts reached'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts; // Exponential backoff

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.messageHandlers.clear();
    console.log('WebSocket disconnected');
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();

