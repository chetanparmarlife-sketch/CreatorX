import { useState } from 'react';
import { File, Image, Download, ExternalLink, Search, Filter, FileText, Video as VideoIcon } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Input } from './ui/input';

interface SharedFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'other';
  size: string;
  sharedBy: 'brand' | 'influencer';
  sharedByName: string;
  date: string;
  campaign: string;
  thumbnailColor?: string;
}

const mockSharedFiles: SharedFile[] = [
  {
    id: 'file1',
    name: 'Campaign_Guidelines.pdf',
    type: 'document',
    size: '2.4 MB',
    sharedBy: 'brand',
    sharedByName: 'Carbamide Forte',
    date: '2 days ago',
    campaign: 'Summer Collection Launch',
  },
  {
    id: 'file2',
    name: 'Product_Photos_Final.zip',
    type: 'other',
    size: '45.2 MB',
    sharedBy: 'brand',
    sharedByName: 'Carbamide Forte',
    date: '3 days ago',
    campaign: 'Summer Collection Launch',
  },
  {
    id: 'file3',
    name: 'Content_Calendar_May.xlsx',
    type: 'document',
    size: '156 KB',
    sharedBy: 'brand',
    sharedByName: 'Carbamide Forte',
    date: '5 days ago',
    campaign: 'Tech Product Review Series',
  },
  {
    id: 'file4',
    name: 'Review_Video_Draft.mp4',
    type: 'video',
    size: '128 MB',
    sharedBy: 'influencer',
    sharedByName: 'Michael Chen',
    date: '1 week ago',
    campaign: 'Tech Product Review Series',
  },
  {
    id: 'file5',
    name: 'Brand_Logo_Assets.png',
    type: 'image',
    size: '3.2 MB',
    sharedBy: 'brand',
    sharedByName: 'Carbamide Forte',
    date: '1 week ago',
    campaign: 'Food & Recipe Campaign',
    thumbnailColor: 'bg-purple-100',
  },
  {
    id: 'file6',
    name: 'Recipe_Photos_1.jpg',
    type: 'image',
    size: '4.8 MB',
    sharedBy: 'influencer',
    sharedByName: 'Emma Davis',
    date: '1 week ago',
    campaign: 'Food & Recipe Campaign',
    thumbnailColor: 'bg-orange-100',
  },
  {
    id: 'file7',
    name: 'Contract_Agreement.pdf',
    type: 'document',
    size: '892 KB',
    sharedBy: 'brand',
    sharedByName: 'Carbamide Forte',
    date: '2 weeks ago',
    campaign: 'Summer Collection Launch',
  },
  {
    id: 'file8',
    name: 'Influencer_Brief.docx',
    type: 'document',
    size: '245 KB',
    sharedBy: 'brand',
    sharedByName: 'Carbamide Forte',
    date: '2 weeks ago',
    campaign: 'Fitness Challenge 2024',
  },
];

function FileTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'image':
      return <Image className="w-5 h-5" />;
    case 'video':
      return <VideoIcon className="w-5 h-5" />;
    case 'document':
      return <FileText className="w-5 h-5" />;
    default:
      return <File className="w-5 h-5" />;
  }
}

export function SharedFilesView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'images' | 'videos' | 'documents'>('all');

  const filteredFiles = mockSharedFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.campaign.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'images' && file.type === 'image') ||
                         (selectedFilter === 'videos' && file.type === 'video') ||
                         (selectedFilter === 'documents' && file.type === 'document');

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <PageHeader title="Shared Files" />

      {/* Search and Filters */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white border-gray-300"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              selectedFilter === 'all'
                ? 'bg-sky-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Files
          </button>
          <button
            onClick={() => setSelectedFilter('images')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              selectedFilter === 'images'
                ? 'bg-sky-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setSelectedFilter('videos')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              selectedFilter === 'videos'
                ? 'bg-sky-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => setSelectedFilter('documents')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              selectedFilter === 'documents'
                ? 'bg-sky-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Documents
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Total Files</div>
          <div className="text-2xl text-gray-900">{mockSharedFiles.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Images</div>
          <div className="text-2xl text-gray-900">
            {mockSharedFiles.filter((f) => f.type === 'image').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Videos</div>
          <div className="text-2xl text-gray-900">
            {mockSharedFiles.filter((f) => f.type === 'video').length}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1">Documents</div>
          <div className="text-2xl text-gray-900">
            {mockSharedFiles.filter((f) => f.type === 'document').length}
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-600">File Name</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Type</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Size</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Campaign</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Shared By</th>
                <th className="px-6 py-3 text-left text-xs text-gray-600">Date</th>
                <th className="px-6 py-3 text-right text-xs text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${
                        file.thumbnailColor || 'bg-gray-100'
                      } flex items-center justify-center text-gray-600`}>
                        <FileTypeIcon type={file.type} />
                      </div>
                      <span className="text-sm text-gray-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 capitalize">{file.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{file.size}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{file.campaign}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${
                        file.sharedBy === 'brand' ? 'bg-sky-500' : 'bg-purple-500'
                      } flex items-center justify-center text-white text-xs`}>
                        {file.sharedByName.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-600">{file.sharedByName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{file.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <File className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No files found</h3>
            <p className="text-sm text-gray-600">
              {searchQuery
                ? 'Try adjusting your search query or filters'
                : 'No files have been shared yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
