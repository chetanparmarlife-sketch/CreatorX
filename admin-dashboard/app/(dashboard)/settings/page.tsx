'use client'

import { useState } from 'react'
import { Bell, Lock, CreditCard, Globe, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useInviteTeamMember, useRemoveTeamMember, useTeamMembers } from '@/lib/hooks/use-team-members'

function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
    </label>
  )
}

export default function SettingsPage() {
  const { data: teamMembers = [], isLoading: teamLoading } = useTeamMembers()
  const inviteMutation = useInviteTeamMember()
  const removeMutation = useRemoveTeamMember()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('MANAGER')

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    inviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole })
    setInviteEmail('')
  }

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Team Members</h3>
                <p className="text-sm text-gray-600">Invite teammates and assign roles</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Teammate email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                className="max-w-xs"
              />
              <select
                value={inviteRole}
                onChange={(event) => setInviteRole(event.target.value)}
                className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ADMIN">Owner</option>
                <option value="MANAGER">Manager</option>
                <option value="VIEWER">Viewer</option>
              </select>
              <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? 'Inviting...' : 'Invite'}
              </Button>
            </div>

            {teamLoading ? (
              <div className="text-sm text-gray-500">Loading team members...</div>
            ) : teamMembers.length === 0 ? (
              <div className="text-sm text-gray-500">No team members yet.</div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{member.email}</div>
                      <div className="text-xs text-gray-500">
                        {member.role} · {member.status}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMutation.mutate(member.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">Manage your notification preferences</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Email Notifications</div>
                <div className="text-xs text-gray-600">Receive email updates about your campaigns</div>
              </div>
              <ToggleSwitch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Campaign Updates</div>
                <div className="text-xs text-gray-600">Get notified when campaigns start or end</div>
              </div>
              <ToggleSwitch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Influencer Activity</div>
                <div className="text-xs text-gray-600">Alerts for new influencer interactions</div>
              </div>
              <ToggleSwitch />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Security</h3>
                <p className="text-sm text-gray-600">Manage your security settings</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Two-Factor Authentication</div>
                <div className="text-xs text-gray-600">Add an extra layer of security to your account</div>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Active Sessions</div>
                <div className="text-xs text-gray-600">Manage your active login sessions</div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Billing & Subscription</h3>
                <p className="text-sm text-gray-600">Manage your plan and payment methods</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Current Plan</div>
                <div className="text-xs text-gray-600">Professional - $99/month</div>
              </div>
              <Button variant="outline" size="sm">Upgrade</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">Billing History</div>
                <div className="text-xs text-gray-600">View and download invoices</div>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Preferences</h3>
                <p className="text-sm text-gray-600">Customize your experience</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Language</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Timezone</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option>UTC-08:00 Pacific Time</option>
                <option>UTC-05:00 Eastern Time</option>
                <option>UTC+00:00 London</option>
                <option>UTC+05:30 India</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
