import { Search, ChevronDown, MapPin, Users, TrendingUp, Tag } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { PillBadge } from './Badges';
import { Input } from './ui/input';

interface Influencer {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  gender: string;
  age: number;
  location: string;
  followers: string;
  engagement: string;
  industries: string[];
}

const mockInfluencers: Influencer[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    handle: '@sarahjohnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    gender: 'Female',
    age: 28,
    location: 'New York, USA',
    followers: '245K',
    engagement: '4.2%',
    industries: ['Fashion', 'Beauty'],
  },
  {
    id: 2,
    name: 'Mike Chen',
    handle: '@mikefoodie',
    avatar: 'https://i.pravatar.cc/150?img=12',
    gender: 'Male',
    age: 32,
    location: 'Los Angeles, USA',
    followers: '180K',
    engagement: '3.8%',
    industries: ['Food Blogger', 'Travel'],
  },
  {
    id: 3,
    name: 'Emma Wilson',
    handle: '@emmawilson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    gender: 'Female',
    age: 25,
    location: 'London, UK',
    followers: '320K',
    engagement: '5.1%',
    industries: ['Beauty', 'Fashion'],
  },
  {
    id: 4,
    name: 'David Martinez',
    handle: '@davidtech',
    avatar: 'https://i.pravatar.cc/150?img=13',
    gender: 'Male',
    age: 30,
    location: 'San Francisco, USA',
    followers: '450K',
    engagement: '4.5%',
    industries: ['Technology', 'Gaming'],
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    handle: '@lisafitness',
    avatar: 'https://i.pravatar.cc/150?img=9',
    gender: 'Female',
    age: 27,
    location: 'Miami, USA',
    followers: '290K',
    engagement: '6.2%',
    industries: ['Fitness', 'Health'],
  },
];

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-sm text-gray-700">{label}</span>
      <ChevronDown className="w-4 h-4 text-gray-500" />
    </button>
  );
}

export function InstagramPage() {
  return (
    <div>
      <PageHeader title="Instagram" />

      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Instagram name..."
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

      {/* Influencers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-sm text-gray-600">Influencer</th>
              <th className="text-left px-6 py-3 text-sm text-gray-600">Gender</th>
              <th className="text-left px-6 py-3 text-sm text-gray-600">Age</th>
              <th className="text-left px-6 py-3 text-sm text-gray-600">Location</th>
              <th className="text-left px-6 py-3 text-sm text-gray-600">Followers</th>
              <th className="text-left px-6 py-3 text-sm text-gray-600">Engagement</th>
              <th className="text-left px-6 py-3 text-sm text-gray-600">Industries</th>
            </tr>
          </thead>
          <tbody>
            {mockInfluencers.map((influencer) => (
              <tr key={influencer.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={influencer.avatar}
                      alt={influencer.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="text-sm text-gray-900">{influencer.name}</div>
                      <div className="text-xs text-gray-500">{influencer.handle}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{influencer.gender}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{influencer.age}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {influencer.location}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="w-4 h-4 text-gray-400" />
                    {influencer.followers}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    {influencer.engagement}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {influencer.industries.map((industry, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                      >
                        <Tag className="w-3 h-3" />
                        {industry}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
