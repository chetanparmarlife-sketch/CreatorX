import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messageService } from '@/lib/api/messages'
import { useMessagePolling } from '@/lib/hooks/use-message-polling'
import type { Conversation, Message, Page } from '@/lib/types'

type ConversationResponse =
  | Conversation[]
  | { conversations?: Conversation[] }

/** Map backend ConversationResponse (UserSummary, MessagePreview) to frontend Conversation */
const normalizeConversation = (raw: any): Conversation => ({
  ...raw,
  // Backend UserSummary has { id, name, avatarUrl }, frontend expects { id, email, profile }
  creator: raw.creator
    ? {
        id: raw.creator.id,
        email: raw.creator.email ?? '',
        profile: raw.creator.profile ?? {
          fullName: raw.creator.name,
          avatarUrl: raw.creator.avatarUrl,
        },
      }
    : raw.creator,
  // Backend MessagePreview uses `text`, frontend Message uses `content`
  lastMessage: raw.lastMessage
    ? { ...raw.lastMessage, content: raw.lastMessage.content ?? raw.lastMessage.text ?? '' }
    : raw.lastMessage,
  // Backend uses `unreadCount`, frontend uses `brandUnreadCount`
  brandUnreadCount: raw.brandUnreadCount ?? raw.unreadCount ?? 0,
})

const normalizeConversations = (data: ConversationResponse | undefined): Conversation[] => {
  if (!data) return []
  const list = Array.isArray(data) ? data : (data.conversations ?? [])
  return list.map(normalizeConversation)
}

export function useConversations() {
  const query = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations(),
    select: normalizeConversations,
  })
  useMessagePolling({ enabled: true, refetch: query.refetch })
  return query
}

export function useMessages(conversationId?: string, page = 0, size = 50) {
  const query = useQuery({
    queryKey: ['messages', conversationId, page, size],
    queryFn: () =>
      messageService.getMessages(conversationId as string, page, size),
    enabled: !!conversationId,
  })
  useMessagePolling({ enabled: Boolean(conversationId), refetch: query.refetch })
  return query
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string
      content: string
    }) => messageService.sendMessage(conversationId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => messageService.markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
    },
  })
}

/** Normalize backend MessageResponse (text) to frontend Message (content) */
const normalizeMessage = (raw: any): Message => ({
  ...raw,
  content: raw.content ?? raw.text ?? '',
})

export const extractMessages = (data?: Page<Message> | Message[]): Message[] => {
  if (!data) return []
  const raw = Array.isArray(data) ? data : (data.items ?? [])
  return raw.map(normalizeMessage)
}
