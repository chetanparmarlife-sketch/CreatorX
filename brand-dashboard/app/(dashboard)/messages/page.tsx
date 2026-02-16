'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  Search,
  Send,
  Paperclip,
  Smile,
  ArrowLeft,
  ExternalLink,
  Phone,
  Video,
  MoreVertical,
  Plus,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { useAuthStore } from '@/lib/store/auth-store'
import { cn } from '@/lib/utils/cn'
import { messageService } from '@/lib/api/messages'
import {
  extractMessages,
  useConversations,
  useMarkConversationRead,
  useMessages,
  useSendMessage,
} from '@/lib/hooks/use-messages'
import { useWebSocket } from '@/lib/hooks/use-websocket'
import type { Conversation, Message } from '@/lib/types'

const formatMessageTime = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const getConversationCreatorName = (conversation: Conversation) =>
  conversation.creator?.profile?.fullName ||
  (conversation.creator as any)?.name ||
  conversation.creator?.email?.split('@')[0] ||
  'Creator'

const getConversationCreatorHandle = (conversation: Conversation) =>
  conversation.creator?.email ? `@${conversation.creator.email.split('@')[0]}` : '@creator'

const getCampaignTitle = (conversation: Conversation) =>
  conversation.campaign?.title || (conversation.campaign as any)?.name || 'Campaign'

const getUnreadCount = (conversation: Conversation) =>
  (conversation as any).unreadCount ?? conversation.brandUnreadCount ?? 0

const getLastMessageText = (conversation: Conversation) =>
  conversation.lastMessage?.content ||
  (conversation.lastMessage as any)?.text ||
  'No messages yet'

const getLastMessageTime = (conversation: Conversation) =>
  conversation.lastMessageAt || (conversation.lastMessage as any)?.sentAt

function NewConversationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const router = useRouter()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">New Conversation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-3">
          <p className="text-sm text-gray-600">
            Conversations are created automatically when a creator applies to a campaign
            or when you invite them from the campaign applications page.
          </p>
          <p className="text-sm text-gray-600">
            Go to a campaign to start a new conversation from an application.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              onClose()
              router.push('/campaigns')
            }}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            View Campaigns
          </Button>
        </div>
      </div>
    </div>
  )
}

function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewConversation,
  isLoading,
  error,
}: {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewConversation: () => void
  isLoading: boolean
  error: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = conversations.filter((conv) => {
    const creatorName = getConversationCreatorName(conv).toLowerCase()
    const campaignName = getCampaignTitle(conv).toLowerCase()
    const needle = searchQuery.toLowerCase()
    return creatorName.includes(needle) || campaignName.includes(needle)
  })

  return (
    <div className="w-full bg-white border-r border-gray-200 flex flex-col h-full md:w-80">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <button
            onClick={onNewConversation}
            className="w-9 h-9 rounded-lg bg-sky-500 hover:bg-sky-600 flex items-center justify-center text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search influencer or campaign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-sm text-gray-600">Loading conversations...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">Failed to load conversations.</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-600">No conversations found</p>
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                activeId === conv.id ? 'bg-gray-100' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white flex-shrink-0">
                  <span className="text-sm font-medium">
                    {getConversationCreatorName(conv).slice(0, 2).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {getConversationCreatorName(conv)}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatMessageTime(getLastMessageTime(conv))}
                    </span>
                  </div>
                  <p className="text-xs text-sky-600 mb-1 truncate">{getCampaignTitle(conv)}</p>
                  <p className="text-sm text-gray-600 truncate">{getLastMessageText(conv)}</p>
                </div>

                {getUnreadCount(conv) > 0 && (
                  <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white">{getUnreadCount(conv)}</span>
                  </div>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function ChatWindow({
  conversation,
  messages,
  isLoading,
  currentUserId,
  onSendMessage,
  onBack,
}: {
  conversation: Conversation | null
  messages: Message[]
  isLoading: boolean
  currentUserId?: string
  onSendMessage: (text: string) => void
  onBack: () => void
}) {
  const [messageText, setMessageText] = useState('')

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText)
      setMessageText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h3>
          <p className="text-sm text-gray-600">
            Select a conversation from the list or start a new one to begin messaging with influencers.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
            <span className="text-sm font-medium">
              {getConversationCreatorName(conversation).slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {getConversationCreatorName(conversation)}
            </h3>
            <button className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1">
              {getCampaignTitle(conversation)}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-gray-500">No messages yet.</div>
        ) : (
          messages.map((message) => {
            const isSender = message.senderId === currentUserId
            const content = message.content || (message as any).text || ''
            return (
              <div
                key={message.id}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    isSender
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{content}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      isSender ? 'text-sky-100' : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end gap-3">
          <button className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors flex-shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <Button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="w-10 h-10 p-0 rounded-lg bg-sky-500 hover:bg-sky-600 text-white flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function ContextPanel({ conversation }: { conversation: Conversation | null }) {
  if (!conversation) return null

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Campaign Details</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div>
            <div className="text-xs text-gray-600 mb-1">Campaign Name</div>
            <div className="text-sm font-medium text-gray-900">{getCampaignTitle(conversation)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Status</div>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              conversation.campaign?.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700'
                : conversation.campaign?.status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {conversation.campaign?.status || 'UNKNOWN'}
            </span>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Platform</div>
            <div className="text-sm text-gray-900 capitalize">
              {conversation.campaign?.platform || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Influencer Details</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white">
              <span className="font-medium">
                {getConversationCreatorName(conversation).slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {getConversationCreatorName(conversation)}
              </div>
              <div className="text-xs text-gray-600">
                {getConversationCreatorHandle(conversation)}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">Followers</div>
              <div className="text-sm text-gray-900">
                {(conversation as any).creator?.followers ?? 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Engagement Rate</div>
              <div className="text-sm text-gray-900">
                {(conversation as any).creator?.engagementRate
                  ? `${(conversation as any).creator?.engagementRate}%`
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Platform</div>
              <div className="text-sm text-gray-900 capitalize">
                {(conversation as any).creator?.platform || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
            View Influencer Profile
          </button>
          <button className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
            View Campaign Details
          </button>
          <button className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
            Share Files
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const { data: conversations = [], isLoading, isError } = useConversations()
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)

  const { data: messagesData, isLoading: messagesLoading } = useMessages(
    activeConversationId ?? undefined
  )
  const messages = extractMessages(messagesData)

  const { mutateAsync: sendMessageMutation } = useSendMessage()
  const markReadMutation = useMarkConversationRead()

  useEffect(() => {
    if (typeof window === 'undefined') return
    setToken(
      localStorage.getItem('creatorx_access_token') || localStorage.getItem('access_token')
    )
  }, [])

  useEffect(() => {
    const conversationId = searchParams.get('conversationId')
    if (conversationId) {
      setActiveConversationId(conversationId)
    }
  }, [searchParams])

  useEffect(() => {
    const applicationId = searchParams.get('applicationId')
    if (!applicationId) return
    messageService.getConversationByApplication(applicationId).then((conversation) => {
      setActiveConversationId(conversation.id)
    })
  }, [searchParams])

  const { isConnected, sendMessage, setMessageHandler } = useWebSocket(token)
  const handleSocketMessage = useCallback(
    (payload: { conversationId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', payload.conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    [queryClient]
  )

  useEffect(() => {
    setMessageHandler(handleSocketMessage)
  }, [handleSocketMessage, setMessageHandler])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [activeConversationId, conversations]
  )

  const handleSendMessage = (text: string) => {
    if (!activeConversationId) return
    const trimmed = text.trim()
    if (!trimmed) return

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: activeConversationId,
      senderId: user?.userId || 'brand',
      content: trimmed,
      read: true,
      createdAt: new Date().toISOString(),
    }

    queryClient.setQueryData(['messages', activeConversationId, 0, 50], (data: any) => {
      if (!data) return { items: [optimisticMessage] }
      if (Array.isArray(data)) {
        return [...data, optimisticMessage]
      }
      return { ...data, items: [...(data.items ?? []), optimisticMessage] }
    })

    if (isConnected) {
      sendMessage(activeConversationId, trimmed)
    } else {
      sendMessageMutation({ conversationId: activeConversationId, content: trimmed })
    }
  }

  useEffect(() => {
    if (!activeConversationId) return
    markReadMutation.mutate(activeConversationId)
  }, [activeConversationId, markReadMutation])

  const showConversationListMobile = !activeConversationId

  return (
    <div className="space-y-4">
      <PageHeader
        title="Messages"
        subtitle="Coordinate with creators and keep campaign conversations moving."
      />

      <div className="flex h-[calc(100vh-14rem)] w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-[#F7F9FC] shadow-sm">
        <div className={cn(showConversationListMobile ? 'flex w-full' : 'hidden md:flex')}>
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
            onNewConversation={() => setShowNewConversationModal(true)}
            isLoading={isLoading}
            error={isError}
          />
        </div>

        <div className={cn('flex-1', showConversationListMobile ? 'hidden md:flex' : 'flex')}>
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            isLoading={messagesLoading}
            currentUserId={user?.userId}
            onSendMessage={handleSendMessage}
            onBack={() => setActiveConversationId(null)}
          />
        </div>

        <div className="hidden xl:block">
          <ContextPanel conversation={activeConversation} />
        </div>
      </div>

      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
      />
    </div>
  )
}
