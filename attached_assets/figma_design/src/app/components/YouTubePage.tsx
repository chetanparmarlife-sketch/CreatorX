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

export function YouTubePage() {
  return (
    <div>
      <PageHeader title="YouTube" />

      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search YouTube channels..."
            className="pl-10 h-11 bg-white border-gray-300"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <FilterButton label="Subscribers" />
          <FilterButton label="Content Type" />
          <FilterButton label="Upload Frequency" />
          <FilterButton label="Average Views" />
          <FilterButton label="Location" />
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <h3 className="text-gray-900 mb-2">YouTube Influencer Discovery</h3>
          <p className="text-sm text-gray-600">
            Discover and connect with YouTube creators who align with your brand values and campaign goals.
          </p>
        </div>
      </div>
    </div>
  );
}
