/**
 * WebSocket Service for Real-time Messaging
 * 
 * Handles STOMP over WebSocket connections for real-time message delivery.
 * Matches the architecture of the React Native app's WebSocket service.
 */

import { Client, IMessage, StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export type MessageHandler = (message: MessagePayload) => void
export type TypingHandler = (data: TypingPayload) => void
export type ConnectionChangeHandler = (connected: boolean) => void

export interface MessagePayload {
  id: string
  conversationId: string
  senderId: string
  content: string
  read: boolean
  createdAt: string
}

export interface TypingPayload {
  conversationId: string
  userId: string
  isTyping: boolean
}

class WebSocketService {
  private client: Client | null = null
  private messageSubscription: StompSubscription | null = null
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000

  private messageHandlers: Set<MessageHandler> = new Set()
  private typingHandlers: Set<TypingHandler> = new Set()
  private connectionHandlers: Set<ConnectionChangeHandler> = new Set()

  /**
   * Initialize and connect to WebSocket server
   */
  public connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve()
        return
      }

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws'
      
      // Use SockJS for better browser compatibility
      // SockJS is compatible with STOMP.js
      this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl) as any,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[STOMP]', str)
          }
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('[WebSocket] Connected')
          this.isConnected = true
          this.reconnectAttempts = 0
          this.notifyConnectionChange(true)

          // Subscribe to user's message queue
          this.subscribeToMessages()
          resolve()
        },
        onStompError: (frame) => {
          console.error('[WebSocket] STOMP error:', frame)
          this.isConnected = false
          this.notifyConnectionChange(false)
          reject(new Error(frame.headers['message'] || 'STOMP connection failed'))
        },
        onWebSocketClose: () => {
          console.log('[WebSocket] Connection closed')
          this.isConnected = false
          this.notifyConnectionChange(false)
          this.messageSubscription = null

          // Attempt to reconnect
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            console.log(`[WebSocket] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)
            setTimeout(() => {
              if (token) {
                this.connect(token).catch(console.error)
              }
            }, this.reconnectDelay)
          } else {
            console.error('[WebSocket] Max reconnect attempts reached')
          }
        },
        onDisconnect: () => {
          console.log('[WebSocket] Disconnected')
          this.isConnected = false
          this.notifyConnectionChange(false)
        },
      })

      this.client.activate()
    })
  }

  /**
   * Subscribe to incoming messages
   */
  private subscribeToMessages(): void {
    if (!this.client || !this.client.connected) {
      return
    }

    this.messageSubscription = this.client.subscribe(
      '/user/queue/messages',
      (message: IMessage) => {
        try {
          const payload: MessagePayload = JSON.parse(message.body)
          this.notifyMessageHandlers(payload)
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error)
        }
      }
    )

    console.log('[WebSocket] Subscribed to /user/queue/messages')
  }

  /**
   * Send a message via WebSocket
   */
  public sendMessage(conversationId: string, content: string): void {
    if (!this.client || !this.client.connected) {
      console.error('[WebSocket] Cannot send message: not connected')
      return
    }

    const message = {
      conversationId,
      content,
    }

    this.client.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(message),
    })

    console.log('[WebSocket] Message sent to /app/chat.send')
  }

  /**
   * Send typing indicator
   */
  public sendTyping(conversationId: string, isTyping: boolean): void {
    if (!this.client || !this.client.connected) {
      return
    }

    const payload = {
      conversationId,
      isTyping,
    }

    this.client.publish({
      destination: '/app/chat.typing',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe()
      this.messageSubscription = null
    }

    if (this.client) {
      this.client.deactivate()
      this.client = null
    }

    this.isConnected = false
    this.notifyConnectionChange(false)
    console.log('[WebSocket] Disconnected')
  }

  /**
   * Check if WebSocket is connected
   */
  public getConnected(): boolean {
    return this.isConnected && this.client?.connected === true
  }

  // Event handlers
  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  public onTyping(handler: TypingHandler): () => void {
    this.typingHandlers.add(handler)
    return () => {
      this.typingHandlers.delete(handler)
    }
  }

  public onConnectionChange(handler: ConnectionChangeHandler): () => void {
    this.connectionHandlers.add(handler)
    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  private notifyMessageHandlers(payload: MessagePayload): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(payload)
      } catch (error) {
        console.error('[WebSocket] Error in message handler:', error)
      }
    })
  }

  private notifyTypingHandlers(payload: TypingPayload): void {
    this.typingHandlers.forEach((handler) => {
      try {
        handler(payload)
      } catch (error) {
        console.error('[WebSocket] Error in typing handler:', error)
      }
    })
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected)
      } catch (error) {
        console.error('[WebSocket] Error in connection handler:', error)
      }
    })
  }
}

// Export singleton instance
export const websocketService = new WebSocketService()

