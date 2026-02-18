'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Send } from 'lucide-react'
import { adminMessageService } from '@/lib/api/admin/messages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import { TableSkeleton } from '@/components/shared/skeleton'
import type { Conversation, Message } from '@/lib/types'

const formatMessageTime = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const formatMessageDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getLastMessageText = (conversation: Conversation) =>
  conversation.lastMessage?.content || 'No messages yet'

const getLastMessageTime = (conversation: Conversation) =>
  conversation.lastMessageAt || conversation.lastMessage?.createdAt

const isAdminMessage = (message: Message) =>
  message.senderName === 'Team CreatorX'

export default function AdminMessagesPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: () => adminMessageService.listConversations(),
  })

  const conversations = (data as any)?.items ?? (data as any)?.content ?? []

  const filteredConversations = useMemo(() => {
    const needle = searchQuery.toLowerCase()
    return conversations.filter((conversation: Conversation) => {
      const creator = (conversation.creatorName || '').toLowerCase()
      const brand = (conversation.brandName || '').toLowerCase()
      const campaign = (conversation.campaignTitle || '').toLowerCase()
      return creator.includes(needle) || brand.includes(needle) || campaign.includes(needle)
    })
  }, [conversations, searchQuery])

  const activeConversation = filteredConversations.find(
    (conversation: Conversation) => conversation.id === activeConversationId
  ) || filteredConversations[0]

  const { data: messagesData, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['admin-messages', activeConversation?.id],
    queryFn: () => adminMessageService.getMessages(activeConversation?.id as string, 0, 100),
    enabled: !!activeConversation?.id,
  })

  const messages: Message[] =
    Array.isArray(messagesData) ? messagesData : (messagesData as any)?.items ?? []

  const sendMutation = useMutation({
    mutationFn: () =>
      adminMessageService.sendMessage(activeConversation?.id as string, messageText.trim()),
    onSuccess: () => {
      setMessageText('')
      queryClient.invalidateQueries({ queryKey: ['admin-messages', activeConversation?.id] })
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] })
    },
  })

  const handleSend = () => {
    if (!messageText.trim() || !activeConversation?.id) return
    sendMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <DashboardPageShell
        title="Messages"
        subtitle="Monitor all creator-brand conversations and reply as Team CreatorX."
        eyebrow="Support"
      >

      <div className="grid h-[70vh] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="table-shell flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search creator, brand, campaign..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4">
                <TableSkeleton rows={4} />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No conversations found.</div>
            ) : (
              filteredConversations.map((conversation: Conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveConversationId(conversation.id)}
                  className={`w-full px-4 py-3 border-b border-slate-100 text-left hover:bg-slate-50 ${
                    activeConversation?.id === conversation.id ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {conversation.creatorName || 'Creator'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {conversation.brandName || 'Brand'} · {conversation.campaignTitle || 'Campaign'}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {formatMessageTime(getLastMessageTime(conversation))}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 line-clamp-1">
                    {getLastMessageText(conversation)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="table-shell flex flex-col">
          {activeConversation ? (
            <>
              <div className="border-b border-slate-100 px-5 py-4">
                <p className="text-sm font-semibold text-slate-900">
                  {activeConversation.creatorName || 'Creator'} ↔ {activeConversation.brandName || 'Brand'}
                </p>
                <p className="text-xs text-slate-500">
                  Campaign: {activeConversation.campaignTitle || 'Campaign'} · {activeConversation.campaignId}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {isMessagesLoading ? (
                  <div className="text-sm text-slate-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-sm text-slate-500">No messages yet.</div>
                ) : (
                  messages
                    .slice()
                    .reverse()
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          isAdminMessage(message)
                            ? 'ml-auto bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="text-xs opacity-70 mb-1">
                          {isAdminMessage(message) ? 'Team CreatorX' : message.senderName || 'Participant'} ·{' '}
                          {formatMessageTime(message.createdAt)}
                        </div>
                        <p>{message.content}</p>
                      </div>
                    ))
                )}
              </div>
              <div className="border-t border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder="Message as Team CreatorX..."
                    className="min-h-[48px]"
                  />
                  <Button onClick={handleSend} disabled={!messageText.trim() || sendMutation.isPending}>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Replies are sent as Team CreatorX and appear in both creator and brand inboxes.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
              Select a conversation to view messages.
            </div>
          )}
        </div>
      </div>
      </DashboardPageShell>
    </div>
  )
}
