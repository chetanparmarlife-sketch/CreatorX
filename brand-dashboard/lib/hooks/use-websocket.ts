/**
 * React Hook for WebSocket Connection
 * 
 * Manages WebSocket connection lifecycle and provides message handlers.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { websocketService, MessageHandler, TypingHandler, ConnectionChangeHandler } from '@/lib/services/websocket-service'

export function useWebSocket(token: string | null) {
  const [isConnected, setIsConnected] = useState(false)
  const messageHandlerRef = useRef<MessageHandler | null>(null)
  const typingHandlerRef = useRef<TypingHandler | null>(null)
  const messageUnsubscribeRef = useRef<(() => void) | null>(null)
  const typingUnsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!token) {
      return
    }

    // Connection change handler
    const connectionHandler: ConnectionChangeHandler = (connected) => {
      setIsConnected(connected)
    }

    const unsubscribeConnection = websocketService.onConnectionChange(connectionHandler)

    // Connect to WebSocket
    websocketService
      .connect(token)
      .then(() => {
        setIsConnected(true)
      })
      .catch((error) => {
        console.error('[useWebSocket] Connection failed:', error)
        setIsConnected(false)
      })

    // Cleanup on unmount
    return () => {
      unsubscribeConnection()
      if (messageUnsubscribeRef.current) {
        messageUnsubscribeRef.current()
      }
      if (typingUnsubscribeRef.current) {
        typingUnsubscribeRef.current()
      }
      websocketService.disconnect()
    }
  }, [token])

  // Register message handler - returns a function to call with the handler
  const setMessageHandler = useCallback((handler: MessageHandler) => {
    // Clean up previous handler if any
    if (messageUnsubscribeRef.current) {
      messageUnsubscribeRef.current()
    }
    messageHandlerRef.current = handler
    messageUnsubscribeRef.current = websocketService.onMessage(handler)
  }, [])

  // Register typing handler - returns a function to call with the handler
  const setTypingHandler = useCallback((handler: TypingHandler) => {
    // Clean up previous handler if any
    if (typingUnsubscribeRef.current) {
      typingUnsubscribeRef.current()
    }
    typingHandlerRef.current = handler
    typingUnsubscribeRef.current = websocketService.onTyping(handler)
  }, [])

  return {
    isConnected,
    sendMessage: websocketService.sendMessage.bind(websocketService),
    sendTyping: websocketService.sendTyping.bind(websocketService),
    setMessageHandler,
    setTypingHandler,
  }
}
