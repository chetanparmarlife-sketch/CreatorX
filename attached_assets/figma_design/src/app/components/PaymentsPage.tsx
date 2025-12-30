import { Calendar, ChevronDown } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Input } from './ui/input';

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-900 mb-1">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}

export function PaymentsPage() {
  return (
    <div>
      <PageHeader 
        title="Payments" 
        ctaLabel="Add Payment Method"
        onCtaClick={() => console.log('Add payment method')}
      />

      <div className="space-y-6">
        {/* Payment Methods Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="mb-4">Payment Methods</h3>
          <EmptyState
            title="No payment methods added"
            description="Add a payment method to start processing transactions"
          />
        </div>

        {/* Transactions Card */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="mb-4">Transactions</h3>
            
            <div className="flex gap-3">
              {/* Date From */}
              <div className="flex-1">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="From"
                    className="pl-10 bg-white border-gray-300"
                  />
                </div>
              </div>

              {/* Date To */}
              <div className="flex-1">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="To"
                    className="pl-10 bg-white border-gray-300"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-700">Status</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {/* Type Filter */}
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-sm text-gray-700">Type</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <EmptyState
            title="No transactions found"
            description="Your transaction history will appear here"
          />
        </div>
      </div>
    </div>
  );
}
