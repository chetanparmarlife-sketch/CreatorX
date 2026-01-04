/**
 * WebSocket Service for real-time messaging (STOMP)
 *
 * Event contract (expected):
 * - ThreadEvent: { thread: Conversation } or Conversation
 * - MessageEvent: Message
 *
 * Destinations (default):
 * - Threads: /user/queue/threads
 * - Messages: /topic/conversation/{threadId}
 */

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { API_BASE_URL, WS_BASE_URL } from '@/src/config/env';
import { APIError, normalizeApiError } from '@/src/api/errors';
import type { Conversation, Message } from '@/src/api/types';

export type ThreadEvent = Conversation | { thread: Conversation };
export type MessageEvent = Message;
export type ThreadHandler = (event: ThreadEvent) => void;
export type MessageHandler = (event: MessageEvent) => void;
export type ErrorHandler = (error: APIError) => void;
export type ConnectionHandler = () => void;

type SubscriptionRecord = {
  destination: string;
  subscription: StompSubscription;
};

class WebSocketService {
  private client: Client | null = null;
  private subscriptions = new Map<string, SubscriptionRecord>();
  private isConnected = false;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 6;
  private baseReconnectDelay = 1500;
  private token: string | null = null;
  private errorHandlers = new Set<ErrorHandler>();
  private connectHandlers = new Set<ConnectionHandler>();
  private disconnectHandlers = new Set<ConnectionHandler>();

  private getWebSocketUrl(): string | null {
    const explicit = WS_BASE_URL?.trim();
    if (explicit) return explicit;

    if (!API_BASE_URL) return null;
    const normalized = API_BASE_URL.replace(/\/+$/, '').replace('/api/v1', '');
    if (normalized.startsWith('https://')) {
      return normalized.replace('https://', 'wss://') + '/ws';
    }
    if (normalized.startsWith('http://')) {
      return normalized.replace('http://', 'ws://') + '/ws';
    }
    return null;
  }

  private notifyError(error: unknown) {
    const normalized = normalizeApiError(error);
    this.errorHandlers.forEach((handler) => handler(normalized));
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.notifyError(new APIError(0, 'WebSocket reconnect failed', 'WS_RECONNECT_FAILED'));
      return;
    }

    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts += 1;

    if (__DEV__) {
      console.log(`[WebSocket] Reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    }

    setTimeout(() => {
      if (this.token) {
        void this.connect(this.token);
      }
    }, delay);
  }

  async connect(token: string): Promise<void> {
    if (this.isConnected || this.isConnecting) return;
    this.token = token;

    const wsUrl = this.getWebSocketUrl();
    if (!wsUrl) {
      this.notifyError(new APIError(0, 'WebSocket URL is missing', 'CONFIG_MISSING'));
      return;
    }

    this.isConnecting = true;

    this.client = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      reconnectDelay: 0,
      debug: (str) => {
        if (__DEV__) {
          console.log('STOMP:', str);
        }
      },
      onConnect: () => {
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        if (__DEV__) {
          console.log('[WebSocket] Connected');
        }
        this.connectHandlers.forEach((handler) => handler());
      },
      onDisconnect: () => {
        this.isConnected = false;
        this.isConnecting = false;
        this.subscriptions.clear();
        if (__DEV__) {
          console.log('[WebSocket] Disconnected');
        }
        this.disconnectHandlers.forEach((handler) => handler());
        this.scheduleReconnect();
      },
      onWebSocketClose: () => {
        this.isConnected = false;
        this.isConnecting = false;
        this.disconnectHandlers.forEach((handler) => handler());
        this.scheduleReconnect();
      },
      onWebSocketError: (event) => {
        if (__DEV__) {
          console.log('[WebSocket] Error', event);
        }
        this.isConnected = false;
        this.isConnecting = false;
        this.notifyError(new APIError(0, 'WebSocket connection error', 'WS_ERROR'));
        this.scheduleReconnect();
      },
      onStompError: (frame) => {
        const error = new APIError(0, frame.headers['message'] || 'STOMP error', 'WS_STOMP_ERROR');
        this.notifyError(error);
      },
    });

    try {
      this.client.activate();
    } catch (error) {
      this.isConnecting = false;
      this.notifyError(error);
    }
  }

  disconnect(): void {
    this.subscriptions.forEach((sub) => sub.subscription.unsubscribe());
    this.subscriptions.clear();

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    if (__DEV__) {
      console.log('[WebSocket] Disconnected (manual)');
    }
  }

  subscribeToThreads(onThreadEvent: ThreadHandler): (() => void) | null {
    if (!this.client || !this.isConnected) {
      this.notifyError(new APIError(0, 'WebSocket not connected', 'WS_NOT_CONNECTED'));
      return null;
    }

    const destination = '/user/queue/threads';
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body) as ThreadEvent;
        onThreadEvent(payload);
      } catch (error) {
        this.notifyError(error);
      }
    });

    this.subscriptions.set(destination, { destination, subscription });
    return () => this.unsubscribe(destination);
  }

  subscribeToThreadMessages(threadId: string, onMessageEvent: MessageHandler): (() => void) | null {
    if (!this.client || !this.isConnected) {
      this.notifyError(new APIError(0, 'WebSocket not connected', 'WS_NOT_CONNECTED'));
      return null;
    }

    const destination = `/topic/conversation/${threadId}`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body) as MessageEvent;
        onMessageEvent(payload);
      } catch (error) {
        this.notifyError(error);
      }
    });

    this.subscriptions.set(destination, { destination, subscription });
    return () => this.unsubscribe(destination);
  }

  unsubscribe(destination: string): void {
    const record = this.subscriptions.get(destination);
    if (record) {
      record.subscription.unsubscribe();
      this.subscriptions.delete(destination);
    }
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.connectHandlers.add(handler);
    return () => this.connectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }

  get connected(): boolean {
    return this.isConnected;
  }
}

export const webSocketService = new WebSocketService();
