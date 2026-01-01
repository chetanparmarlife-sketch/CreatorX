import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messageService } from '@/lib/api/messages'
import { useMessagePolling } from '@/lib/hooks/use-message-polling'
import type { Conversation, Message, Page } from '@/lib/types'

type ConversationResponse =
  | Conversation[]
  | { conversations?: Conversation[] }

const normalizeConversations = (data: ConversationResponse | undefined): Conversation[] => {
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.conversations ?? []
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

export const extractMessages = (data?: Page<Message> | Message[]): Message[] => {
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.items ?? []
}
