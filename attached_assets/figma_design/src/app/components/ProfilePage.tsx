import { User, Mail, Building, Phone } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function ProfilePage() {
  return (
    <div>
      <PageHeader title="Profile" />

      <div className="max-w-3xl">
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Profile Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-sky-500 flex items-center justify-center text-white text-2xl">
                CF
              </div>
              <div>
                <h2 className="text-gray-900 mb-1">Carbamide Forte</h2>
                <p className="text-sm text-gray-600">carbamide@opportune.co.in</p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Carbamide Forte"
                    defaultValue="Carbamide Forte"
                    className="pl-10 bg-white border-gray-300"
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Contact Person
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    defaultValue="Rushabh Shah"
                    className="pl-10 bg-white border-gray-300"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    defaultValue="carbamide@opportune.co.in"
                    className="pl-10 bg-white border-gray-300"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    defaultValue="+91 98765 43210"
                    className="pl-10 bg-white border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-lg border border-gray-200 mt-6 p-8">
          <h3 className="text-gray-900 mb-4">Change Password</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Current Password
              </label>
              <Input
                type="password"
                placeholder="Enter current password"
                className="bg-white border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="bg-white border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                className="bg-white border-gray-300"
              />
            </div>
            <Button className="bg-sky-500 hover:bg-sky-600 text-white">
              Update Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
