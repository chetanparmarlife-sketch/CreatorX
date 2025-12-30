'use client'

import { useAuthStore } from '@/lib/store/auth-store'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ProfilePage() {
  const { user } = useAuthStore()

  return (
    <div>
      <PageHeader title="Profile" />

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-sky-500 flex items-center justify-center text-white text-2xl font-semibold">
              {user?.email?.substring(0, 2).toUpperCase() || 'CF'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.email?.split('@')[0] || 'Demo Brand'}
              </h2>
              <p className="text-gray-600">{user?.email || 'demo@creatorx.com'}</p>
              <p className="text-sm text-gray-500">Brand Account</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <Input
                defaultValue="Demo Company"
                className="bg-white border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-white text-sm">
                <option>Technology</option>
                <option>Fashion</option>
                <option>Beauty</option>
                <option>Food & Beverage</option>
                <option>Health & Fitness</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <Input
                defaultValue="https://demo.creatorx.com"
                className="bg-white border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                defaultValue="+91 98765 43210"
                className="bg-white border-gray-300"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button className="bg-sky-500 hover:bg-sky-600 text-white">
              Save Changes
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Active Campaigns</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">89</div>
              <div className="text-sm text-gray-600">Influencers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">$24.5K</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-semibold text-gray-900">4.8%</div>
              <div className="text-sm text-gray-600">Avg. Engagement</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
