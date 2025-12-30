import { PageHeader } from './PageHeader';
import { StatusBadge, PillBadge } from './Badges';

interface Campaign {
  id: number;
  name: string;
  platform: string;
  paymentTerms: string;
  status: 'active' | 'closed';
}

const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: 'Summer Collection Launch',
    platform: 'Instagram',
    paymentTerms: 'BARTER',
    status: 'active',
  },
  {
    id: 2,
    name: 'Product Review Campaign',
    platform: 'YouTube',
    paymentTerms: 'BOTH',
    status: 'active',
  },
  {
    id: 3,
    name: 'Holiday Special 2024',
    platform: 'Instagram',
    paymentTerms: 'BARTER',
    status: 'closed',
  },
  {
    id: 4,
    name: 'Tech Review Series',
    platform: 'YouTube',
    paymentTerms: 'BOTH',
    status: 'active',
  },
  {
    id: 5,
    name: 'Spring Fashion Week',
    platform: 'Instagram',
    paymentTerms: 'BARTER',
    status: 'closed',
  },
];

export function CampaignsPage() {
  return (
    <div>
      <PageHeader 
        title="Campaigns" 
        ctaLabel="Create Campaign"
        onCtaClick={() => console.log('Create campaign')}
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-sm text-gray-600">Name</th>
              <th className="text-left px-6 py-3 text-sm text-gray-600">Platform</th>
              <th className="text-left px-6 py-3 text-sm text-gray-600">Payment Terms</th>
              <th className="text-left px-6 py-3 text-sm text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockCampaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{campaign.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{campaign.platform}</td>
                <td className="px-6 py-4">
                  <PillBadge label={campaign.paymentTerms} variant="outline" />
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={campaign.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
