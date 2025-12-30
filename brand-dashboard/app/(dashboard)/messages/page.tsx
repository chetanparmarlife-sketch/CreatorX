'use client'

import { useState } from 'react'
import { Search, Send, Paperclip, Smile, ExternalLink, Phone, Video, MoreVertical, Plus, File, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  text: string
  timestamp: string
  sender: 'brand' | 'influencer'
  attachment?: { name: string }
}

interface Influencer {
  name: string
  username: string
  avatar: string
  followers: string
  engagementRate: string
  platform: string
}

interface Campaign {
  name: string
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED'
  platform: string
}

interface Conversation {
  id: string
  influencer: Influencer
  campaign: Campaign
  messages: Message[]
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    influencer: {
      name: 'Sarah Johnson',
      username: '@sarahjstyle',
      avatar: 'SJ',
      followers: '245K',
      engagementRate: '4.2%',
      platform: 'instagram',
    },
    campaign: {
      name: 'Summer Collection Launch',
      status: 'ACTIVE',
      platform: 'instagram',
    },
    messages: [
      { id: 'm1', text: 'Hi! I\'m excited to collaborate on the Summer Collection campaign!', timestamp: '10:30 AM', sender: 'influencer' },
      { id: 'm2', text: 'Great to hear from you, Sarah! We\'re excited to work with you too.', timestamp: '10:32 AM', sender: 'brand' },
      { id: 'm3', text: 'Could you share the product samples and brief?', timestamp: '10:33 AM', sender: 'influencer' },
      { id: 'm4', text: 'Of course! I\'ll send over the creative brief and product details.', timestamp: '10:35 AM', sender: 'brand' },
    ],
    lastMessage: 'Of course! I\'ll send over the creative brief...',
    lastMessageTime: '10:35 AM',
    unreadCount: 0,
  },
  {
    id: '2',
    influencer: {
      name: 'Michael Chen',
      username: '@techbymike',
      avatar: 'MC',
      followers: '180K',
      engagementRate: '3.8%',
      platform: 'youtube',
    },
    campaign: {
      name: 'Tech Product Review Series',
      status: 'PENDING',
      platform: 'youtube',
    },
    messages: [
      { id: 'm1', text: 'Looking forward to reviewing the new product line!', timestamp: '9:15 AM', sender: 'influencer' },
    ],
    lastMessage: 'Looking forward to reviewing the new product line!',
    lastMessageTime: '9:15 AM',
    unreadCount: 2,
  },
  {
    id: '3',
    influencer: {
      name: 'Emma Davis',
      username: '@emmafoodie',
      avatar: 'ED',
      followers: '320K',
      engagementRate: '5.1%',
      platform: 'instagram',
    },
    campaign: {
      name: 'Food & Recipe Campaign',
      status: 'ACTIVE',
      platform: 'instagram',
    },
    messages: [
      { id: 'm1', text: 'The recipe photos are ready for review!', timestamp: 'Yesterday', sender: 'influencer' },
    ],
    lastMessage: 'The recipe photos are ready for review!',
    lastMessageTime: 'Yesterday',
    unreadCount: 1,
  },
]

function NewConversationModal({ isOpen, onClose, onStart }: { isOpen: boolean; onClose: () => void; onStart: (i: string, c: string) => void }) {
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [selectedInfluencer, setSelectedInfluencer] = useState('')

  if (!isOpen) return null

  const handleStart = () => {
    if (selectedCampaign && selectedInfluencer) {
      onStart(selectedInfluencer, selectedCampaign)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">New Conversation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Campaign</label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Choose a campaign...</option>
              <option value="camp1">Summer Collection Launch</option>
              <option value="camp2">Tech Product Review Series</option>
              <option value="camp3">Food & Recipe Campaign</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Influencer</label>
            <select
              value={selectedInfluencer}
              onChange={(e) => setSelectedInfluencer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Choose an influencer...</option>
              <option value="inf1">Sarah Johnson (@sarahjstyle)</option>
              <option value="inf2">Michael Chen (@techbymike)</option>
              <option value="inf3">Emma Davis (@emmafoodie)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleStart}
            disabled={!selectedCampaign || !selectedInfluencer}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            Start Chat
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
}: {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewConversation: () => void
}) {
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = conversations.filter(
    (conv) =>
      conv.influencer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
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
        {filtered.length === 0 ? (
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
                  <span className="text-sm font-medium">{conv.influencer.avatar}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{conv.influencer.name}</h4>
                    <span className="text-xs text-gray-500 ml-2">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-sky-600 mb-1 truncate">{conv.campaign.name}</p>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                </div>

                {conv.unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-white">{conv.unreadCount}</span>
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
  onSendMessage,
}: {
  conversation: Conversation | null
  onSendMessage: (text: string) => void
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
          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
            <span className="text-sm font-medium">{conversation.influencer.avatar}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.influencer.name}</h3>
            <button className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1">
              {conversation.campaign.name}
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
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'brand' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 ${
                message.sender === 'brand'
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              {message.attachment && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <div className="flex items-center gap-2 text-xs">
                    <File className="w-4 h-4" />
                    <span>{message.attachment.name}</span>
                  </div>
                </div>
              )}
              <span className={`text-xs mt-1 block ${message.sender === 'brand' ? 'text-sky-100' : 'text-gray-500'}`}>
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
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
            <div className="text-sm font-medium text-gray-900">{conversation.campaign.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Status</div>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              conversation.campaign.status === 'ACTIVE'
                ? 'bg-green-100 text-green-700'
                : conversation.campaign.status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {conversation.campaign.status}
            </span>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Platform</div>
            <div className="text-sm text-gray-900 capitalize">{conversation.campaign.platform}</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Influencer Details</h3>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white">
              <span className="font-medium">{conversation.influencer.avatar}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{conversation.influencer.name}</div>
              <div className="text-xs text-gray-600">{conversation.influencer.username}</div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-600 mb-1">Followers</div>
              <div className="text-sm text-gray-900">{conversation.influencer.followers}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Engagement Rate</div>
              <div className="text-sm text-gray-900">{conversation.influencer.engagementRate}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Platform</div>
              <div className="text-sm text-gray-900 capitalize">{conversation.influencer.platform}</div>
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
  const [conversations, setConversations] = useState(mockConversations)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null

  const handleSendMessage = (text: string) => {
    if (!activeConversationId) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      sender: 'brand',
    }

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: text,
              lastMessageTime: 'Just now',
            }
          : conv
      )
    )
  }

  const handleStartNewConversation = (influencerId: string, campaignId: string) => {
    console.log('Starting new conversation:', { influencerId, campaignId })
  }

  return (
    <div className="fixed inset-0 left-64 top-0 bg-[#F7F9FC] flex">
      <ConversationList
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        onNewConversation={() => setShowNewConversationModal(true)}
      />
      
      <ChatWindow conversation={activeConversation} onSendMessage={handleSendMessage} />
      
      <ContextPanel conversation={activeConversation} />

      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onStart={handleStartNewConversation}
      />
    </div>
  )
}
