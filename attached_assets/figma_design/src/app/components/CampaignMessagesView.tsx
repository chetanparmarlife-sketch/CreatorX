import { useState } from 'react';
import { Search, Filter, ArrowLeft, Download } from 'lucide-react';
import { mockConversations, Conversation } from '../data/messages-data';
import { PageHeader } from './PageHeader';
import { Input } from './ui/input';

export function CampaignMessagesView({ 
  campaignId, 
  onBack 
}: { 
  campaignId: string; 
  onBack: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter conversations by campaign
  const campaignConversations = mockConversations.filter(
    (conv) => conv.campaign.id === campaignId
  );

  const campaign = campaignConversations[0]?.campaign;

  const filteredConversations = campaignConversations.filter((conv) =>
    conv.influencer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Messages</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-1">Campaign Messages</h1>
            {campaign && (
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-600">{campaign.name}</p>
                <span className={`px-2 py-1 rounded text-xs ${
                  campaign.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : campaign.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {campaign.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search influencers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white border-gray-300"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Filter</span>
        </button>
      </div>

      {/* Conversations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Influencer Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white">
                <span>{conv.influencer.avatar}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900">{conv.influencer.name}</h3>
                <p className="text-xs text-gray-600">{conv.influencer.username}</p>
              </div>
              {conv.unreadCount > 0 && (
                <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
                  <span className="text-xs text-white">{conv.unreadCount}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
              <div>
                <div className="text-xs text-gray-600 mb-1">Followers</div>
                <div className="text-sm text-gray-900">{conv.influencer.followers}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Engagement</div>
                <div className="text-sm text-gray-900">{conv.influencer.engagementRate}</div>
              </div>
            </div>

            {/* Last Message */}
            <div className="mb-4">
              <div className="text-xs text-gray-600 mb-1">Last Message</div>
              <p className="text-sm text-gray-900 line-clamp-2">{conv.lastMessage}</p>
              <span className="text-xs text-gray-500">{conv.lastMessageTime}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white text-sm rounded-lg transition-colors">
                Open Chat
              </button>
              <button className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredConversations.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No conversations found</h3>
            <p className="text-sm text-gray-600">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'No influencers have been messaged for this campaign yet'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
