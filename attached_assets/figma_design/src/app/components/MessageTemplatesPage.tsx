import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Copy } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface MessageTemplate {
  id: string;
  name: string;
  category: 'greeting' | 'follow-up' | 'campaign' | 'payment' | 'general';
  content: string;
  usageCount: number;
  lastUsed: string;
}

const mockTemplates: MessageTemplate[] = [
  {
    id: 'tmp1',
    name: 'Initial Campaign Invitation',
    category: 'campaign',
    content: 'Hi {influencer_name}! We\'re excited to invite you to participate in our {campaign_name} campaign. We believe your content aligns perfectly with our brand values. Would you be interested in discussing this opportunity?',
    usageCount: 34,
    lastUsed: '2 hours ago',
  },
  {
    id: 'tmp2',
    name: 'Campaign Guidelines Sharing',
    category: 'campaign',
    content: 'Thank you for accepting! I\'ve attached our campaign guidelines and content calendar. Please review them and let me know if you have any questions.',
    usageCount: 28,
    lastUsed: '5 hours ago',
  },
  {
    id: 'tmp3',
    name: 'Content Approval',
    category: 'follow-up',
    content: 'Great work on the content! Our team has reviewed it and we\'re happy to approve it for posting. You can go ahead and publish it on {date}.',
    usageCount: 42,
    lastUsed: 'Yesterday',
  },
  {
    id: 'tmp4',
    name: 'Payment Confirmation',
    category: 'payment',
    content: 'Hi {influencer_name}! Your payment of ${amount} has been processed and should reflect in your account within 3-5 business days. Thank you for your collaboration!',
    usageCount: 56,
    lastUsed: '2 days ago',
  },
  {
    id: 'tmp5',
    name: 'Check-in Message',
    category: 'follow-up',
    content: 'Hi! Just checking in on the campaign progress. How are things going? Let me know if you need any support or have questions.',
    usageCount: 19,
    lastUsed: '3 days ago',
  },
  {
    id: 'tmp6',
    name: 'Welcome Message',
    category: 'greeting',
    content: 'Welcome to {brand_name}! We\'re thrilled to have you on board. I\'m {your_name}, and I\'ll be your main point of contact for this campaign.',
    usageCount: 67,
    lastUsed: '1 week ago',
  },
  {
    id: 'tmp7',
    name: 'Contract Review Request',
    category: 'general',
    content: 'Hi {influencer_name}! I\'ve sent over the collaboration contract for your review. Please take your time to read through it, and feel free to reach out with any questions or concerns.',
    usageCount: 23,
    lastUsed: '1 week ago',
  },
  {
    id: 'tmp8',
    name: 'Campaign Completion',
    category: 'campaign',
    content: 'Thank you for a successful campaign! We really appreciated working with you. The content performed excellently and we\'d love to collaborate again in the future.',
    usageCount: 31,
    lastUsed: '2 weeks ago',
  },
];

const categoryColors = {
  greeting: 'bg-blue-100 text-blue-700',
  'follow-up': 'bg-purple-100 text-purple-700',
  campaign: 'bg-green-100 text-green-700',
  payment: 'bg-orange-100 text-orange-700',
  general: 'bg-gray-100 text-gray-700',
};

export function MessageTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <PageHeader
        title="Message Templates"
        ctaLabel="Create Template"
        onCtaClick={() => console.log('Create template')}
      />

      {/* Search and Filter */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white border-gray-300"
          />
        </div>

        <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              selectedCategory === 'all'
                ? 'bg-sky-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('campaign')}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              selectedCategory === 'campaign'
                ? 'bg-sky-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Campaign
          </button>
          <button
            onClick={() => setSelectedCategory('follow-up')}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              selectedCategory === 'follow-up'
                ? 'bg-sky-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Follow-up
          </button>
          <button
            onClick={() => setSelectedCategory('payment')}
            className={`px-3 py-2 text-sm rounded-md transition-colors ${
              selectedCategory === 'payment'
                ? 'bg-sky-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Templates</div>
          <div className="text-2xl text-gray-900">{mockTemplates.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Usage</div>
          <div className="text-2xl text-gray-900">
            {mockTemplates.reduce((sum, t) => sum + t.usageCount, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Most Used</div>
          <div className="text-sm text-gray-900 truncate">
            {mockTemplates.sort((a, b) => b.usageCount - a.usageCount)[0]?.name}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Categories</div>
          <div className="text-2xl text-gray-900">5</div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-gray-900">{template.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs capitalize ${
                      categoryColors[template.category]
                    }`}
                  >
                    {template.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Used {template.usageCount} times</span>
                  <span>•</span>
                  <span>Last used {template.lastUsed}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 leading-relaxed">{template.content}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No templates found</h3>
            <p className="text-sm text-gray-600">
              {searchQuery
                ? 'Try adjusting your search query or filters'
                : 'Create your first message template to get started'}
            </p>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-sm text-blue-900 mb-2">💡 Template Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use variables like {'{influencer_name}'}, {'{campaign_name}'}, and {'{amount}'} for personalization</li>
          <li>• Keep templates professional yet friendly to match your brand voice</li>
          <li>• Review and update templates regularly based on campaign performance</li>
        </ul>
      </div>
    </div>
  );
}
