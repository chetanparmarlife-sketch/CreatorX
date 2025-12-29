'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, formatDistanceToNow } from 'date-fns'
import { Search, Send, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { messageService } from '@/lib/api/messages'
import { websocketService } from '@/lib/services/websocket-service'
import { Conversation, Message } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  // Get access token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('creatorx_access_token') : null

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations(),
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: () => {
      if (!selectedConversationId) return null
      return messageService.getMessages(selectedConversationId)
    },
    enabled: !!selectedConversationId,
  })

  const messages = messagesData?.items || []

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: string) => messageService.markAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // Send message mutation (REST fallback)
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      messageService.sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setMessageInput('')
    },
  })

  // WebSocket connection
  useEffect(() => {
    if (!token) return

    const connect = async () => {
      try {
        await websocketService.connect(token)
      } catch (error) {
        console.error('[MessagesPage] WebSocket connection failed:', error)
      }
    }

    connect()

    return () => {
      websocketService.disconnect()
    }
  }, [token])

  // Handle incoming WebSocket messages
  useEffect(() => {
    const unsubscribe = websocketService.onMessage((message) => {
      // Update messages if this conversation is open
      if (message.conversationId === selectedConversationId) {
        queryClient.setQueryData(['messages', selectedConversationId], (old: any) => {
          if (!old) return { items: [message], page: 0, size: 50, total: 1, totalPages: 1 }
          // Check if message already exists
          const exists = old.items.some((m: Message) => m.id === message.id)
          if (exists) return old
          return {
            ...old,
            items: [...old.items, message],
            total: old.total + 1,
          }
        })
      }

      // Update conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    return unsubscribe
  }, [selectedConversationId, queryClient])

  // Handle typing indicators
  useEffect(() => {
    const unsubscribe = websocketService.onTyping((data) => {
      if (data.conversationId === selectedConversationId && data.userId !== user?.id) {
        setIsTyping(data.isTyping)
        if (data.isTyping) {
          // Clear existing timeout
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
          }
          // Set timeout to hide typing indicator after 3 seconds
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false)
          }, 3000)
        }
      }
    })

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      unsubscribe()
    }
  }, [selectedConversationId, user?.id])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark conversation as read when opened
  useEffect(() => {
    if (selectedConversationId) {
      markAsReadMutation.mutate(selectedConversationId)
    }
  }, [selectedConversationId])

  // Filter conversations by search query
  const filteredConversations = conversations.filter((conv: Conversation) => {
    if (!searchQuery.trim()) return true
    const searchLower = searchQuery.toLowerCase()
    const creatorName = conv.creator?.profile?.fullName || conv.creator?.email || ''
    const campaignTitle = conv.campaign?.title || ''
    return (
      creatorName.toLowerCase().includes(searchLower) ||
      campaignTitle.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.content.toLowerCase().includes(searchLower)
    )
  })

  // Sort conversations by last message time
  const sortedConversations = [...filteredConversations].sort((a: Conversation, b: Conversation) => {
    const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return timeB - timeA
  })

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  const handleSendMessage = useCallback(() => {
    if (!selectedConversationId || !messageInput.trim()) return

    const content = messageInput.trim()

    // Try WebSocket first
    if (websocketService.getConnected()) {
      websocketService.sendMessage(selectedConversationId, content)
      setMessageInput('')
      
      // Optimistically add message to UI
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: selectedConversationId,
        senderId: user?.id || '',
        content,
        read: false,
        createdAt: new Date().toISOString(),
      }

      queryClient.setQueryData(['messages', selectedConversationId], (old: any) => {
        if (!old) return { items: [optimisticMessage], page: 0, size: 50, total: 1, totalPages: 1 }
        return {
          ...old,
          items: [...old.items, optimisticMessage],
          total: old.total + 1,
        }
      })
    } else {
      // Fallback to REST API
      sendMessageMutation.mutate({ conversationId: selectedConversationId, content })
    }
  }, [selectedConversationId, messageInput, user?.id, queryClient, sendMessageMutation])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = useCallback(() => {
    if (!selectedConversationId || !websocketService.getConnected()) return

    // Send typing indicator
    websocketService.sendTyping(selectedConversationId, true)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.sendTyping(selectedConversationId, false)
    }, 2000)
  }, [selectedConversationId])

  const getCreatorName = (conversation: Conversation) => {
    return conversation.creator?.profile?.fullName || conversation.creator?.email || 'Unknown Creator'
  }

  const getCreatorInitials = (conversation: Conversation) => {
    const name = getCreatorName(conversation)
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] border rounded-lg bg-white overflow-hidden">
      {/* Left Sidebar - Conversation List */}
      <div className="w-full md:w-96 border-r flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading conversations...</div>
          ) : sortedConversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            <div className="divide-y">
              {sortedConversations.map((conversation) => {
                const isSelected = conversation.id === selectedConversationId
                const unreadCount = conversation.brandUnreadCount || 0

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    className={cn(
                      'w-full p-4 text-left hover:bg-slate-50 transition-colors',
                      isSelected && 'bg-purple-50 border-l-4 border-l-purple-600'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src={conversation.creator?.profile?.avatarUrl} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {getCreatorInitials(conversation)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm text-slate-900 truncate">
                            {getCreatorName(conversation)}
                          </h3>
                          {conversation.lastMessageAt && (
                            <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>

                        {conversation.campaign && (
                          <p className="text-xs text-purple-600 mb-1 truncate">
                            {conversation.campaign.title}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-600 truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                          {unreadCount > 0 && (
                            <Badge className="ml-2 bg-purple-600 text-white flex-shrink-0">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Message Thread */}
      <div className="flex-1 flex flex-col hidden md:flex">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.creator?.profile?.avatarUrl} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {getCreatorInitials(selectedConversation)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-900">
                  {getCreatorName(selectedConversation)}
                </h2>
                {selectedConversation.campaign && (
                  <p className="text-xs text-slate-500">{selectedConversation.campaign.title}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="text-center text-sm text-slate-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <>
                  {messages.map((message: Message) => {
                    const isOwnMessage = message.senderId === user?.id
                    const senderName = isOwnMessage
                      ? 'You'
                      : selectedConversation.creator?.profile?.fullName ||
                        selectedConversation.creator?.email ||
                        'Creator'

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          isOwnMessage ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-lg px-4 py-2',
                            isOwnMessage
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-900'
                          )}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-semibold mb-1 opacity-75">{senderName}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p
                            className={cn(
                              'text-xs mt-1',
                              isOwnMessage ? 'text-purple-100' : 'text-slate-500'
                            )}
                          >
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-lg px-4 py-2">
                        <p className="text-sm text-slate-500 italic">Typing...</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={messageInputRef}
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value)
                    handleTyping()
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <p className="text-lg font-medium mb-2">Select a conversation</p>
              <p className="text-sm">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Show selected conversation or list */}
      <div className="flex-1 flex flex-col md:hidden">
        {selectedConversationId ? (
          <>
            {/* Mobile Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedConversationId(null)}
                type="button"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation?.creator?.profile?.avatarUrl} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {selectedConversation && getCreatorInitials(selectedConversation)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-900">
                  {selectedConversation && getCreatorName(selectedConversation)}
                </h2>
                {selectedConversation?.campaign && (
                  <p className="text-xs text-slate-500">{selectedConversation.campaign.title}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="text-center text-sm text-slate-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-slate-500 py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                <>
                  {messages.map((message: Message) => {
                    const isOwnMessage = message.senderId === user?.id
                    const senderName = isOwnMessage
                      ? 'You'
                      : selectedConversation?.creator?.profile?.fullName ||
                        selectedConversation?.creator?.email ||
                        'Creator'

                    return (
                      <div
                        key={message.id}
                        className={cn('flex', isOwnMessage ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-lg px-4 py-2',
                            isOwnMessage
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-900'
                          )}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-semibold mb-1 opacity-75">{senderName}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p
                            className={cn(
                              'text-xs mt-1',
                              isOwnMessage ? 'text-purple-100' : 'text-slate-500'
                            )}
                          >
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-lg px-4 py-2">
                        <p className="text-sm text-slate-500 italic">Typing...</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={messageInputRef}
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value)
                    handleTyping()
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <p className="text-sm">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
