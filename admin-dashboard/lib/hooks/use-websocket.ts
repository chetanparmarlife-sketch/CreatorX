/**
 * React Hook for WebSocket Connection
 * 
 * Manages WebSocket connection lifecycle and provides message handlers.
 */

import { useEffect, useMemo, useState } from 'react'
import { websocketService, MessageHandler, TypingHandler, ConnectionChangeHandler } from '@/lib/services/websocket-service'

export function useWebSocket(token: string | null) {
  const [isConnected, setIsConnected] = useState(false)
  const [messageHandler, setMessageHandler] = useState<MessageHandler | null>(null)
  const [typingHandler, setTypingHandler] = useState<TypingHandler | null>(null)

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
      websocketService.disconnect()
    }
  }, [token])

  useEffect(() => {
    if (!messageHandler) return
    return websocketService.onMessage(messageHandler)
  }, [messageHandler])

  useEffect(() => {
    if (!typingHandler) return
    return websocketService.onTyping(typingHandler)
  }, [typingHandler])

  const onMessage = useMemo(() => (handler: MessageHandler) => setMessageHandler(() => handler), [])
  const onTyping = useMemo(() => (handler: TypingHandler) => setTypingHandler(() => handler), [])

  return {
    isConnected,
    sendMessage: websocketService.sendMessage.bind(websocketService),
    sendTyping: websocketService.sendTyping.bind(websocketService),
    onMessage,
    onTyping,
  }
}
