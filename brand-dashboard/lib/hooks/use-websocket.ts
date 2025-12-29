/**
 * React Hook for WebSocket Connection
 * 
 * Manages WebSocket connection lifecycle and provides message handlers.
 */

import { useEffect, useRef, useState } from 'react'
import { websocketService, MessageHandler, TypingHandler, ConnectionChangeHandler } from '@/lib/services/websocket-service'

export function useWebSocket(token: string | null) {
  const [isConnected, setIsConnected] = useState(false)
  const messageHandlerRef = useRef<MessageHandler | null>(null)
  const typingHandlerRef = useRef<TypingHandler | null>(null)

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
      if (messageHandlerRef.current) {
        // Handler cleanup is handled by the service
      }
      websocketService.disconnect()
    }
  }, [token])

  // Register message handler
  const onMessage = (handler: MessageHandler) => {
    useEffect(() => {
      messageHandlerRef.current = handler
      const unsubscribe = websocketService.onMessage(handler)
      return unsubscribe
    }, [handler])
  }

  // Register typing handler
  const onTyping = (handler: TypingHandler) => {
    useEffect(() => {
      typingHandlerRef.current = handler
      const unsubscribe = websocketService.onTyping(handler)
      return unsubscribe
    }, [handler])
  }

  return {
    isConnected,
    sendMessage: websocketService.sendMessage.bind(websocketService),
    sendTyping: websocketService.sendTyping.bind(websocketService),
    onMessage,
    onTyping,
  }
}

