import { Search, ChevronDown } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Input } from './ui/input';

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-sm text-gray-700">{label}</span>
      <ChevronDown className="w-4 h-4 text-gray-500" />
    </button>
  );
}

export function FacebookPage() {
  return (
    <div>
      <PageHeader title="Facebook" />

      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Facebook profiles..."
            className="pl-10 h-11 bg-white border-gray-300"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <FilterButton label="Age Group" />
          <FilterButton label="Gender" />
          <FilterButton label="Followers" />
          <FilterButton label="Content Niche" />
          <FilterButton label="Cities" />
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <h3 className="text-gray-900 mb-2">Facebook Influencer Discovery</h3>
          <p className="text-sm text-gray-600">
            Search and filter through thousands of Facebook influencers to find the perfect match for your campaign.
          </p>
        </div>
      </div>
    </div>
  );
}
